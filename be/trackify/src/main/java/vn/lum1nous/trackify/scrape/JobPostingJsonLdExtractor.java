package vn.lum1nous.trackify.scrape;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import org.springframework.stereotype.Component;

@Component
public class JobPostingJsonLdExtractor {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final ScrapeHtmlCleaner htmlCleaner;

    public JobPostingJsonLdExtractor(ScrapeHtmlCleaner htmlCleaner) {
        this.htmlCleaner = Objects.requireNonNull(htmlCleaner);
    }

    public JobPostingFields extractFromJsonLd(List<String> jsonLdScripts) {
        if (jsonLdScripts == null || jsonLdScripts.isEmpty()) {
            return new JobPostingFields("", "", "", "", "");
        }

        String jobTitle = "";
        String companyName = "";
        String jobLocation = "";
        String salaryText = "";
        String jobDescription = "";

        for (String script : jsonLdScripts) {
            if (script == null || script.isBlank()) {
                continue;
            }

            String trimmedJson = script.trim();
            if (trimmedJson.isBlank()) {
                continue;
            }

            JsonNode rootNode;
            try {
                rootNode = OBJECT_MAPPER.readTree(trimmedJson);
            } catch (Exception parseEx) {
                // ignore single invalid script
                continue;
            }

            List<JsonNode> candidates = flattenToNodes(rootNode);
            for (JsonNode candidate : candidates) {
                if (!isJobPosting(candidate)) {
                    continue;
                }

                if (isBlank(jobTitle)) {
                    jobTitle = safeTrimText(candidate.path("title"));
                }

                if (isBlank(companyName)) {
                    companyName = safeTrimText(findCompanyNameNode(candidate));
                }

                if (isBlank(jobLocation)) {
                    jobLocation = extractJobLocationText(candidate.path("jobLocation"));
                }

                if (isBlank(salaryText)) {
                    salaryText = extractSalaryText(candidate);
                }

                if (isBlank(jobDescription)) {
                    String rawDescription = safeTrimText(candidate.path("description"));
                    jobDescription = htmlCleaner.cleanAndUnescape(rawDescription);
                }

                // stop early if we already have enough key fields
                if (!isBlank(jobTitle) && !isBlank(companyName) && !isBlank(jobLocation)) {
                    break;
                }
            }
        }

        return new JobPostingFields(jobTitle, companyName, jobLocation, salaryText, jobDescription);
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }

    private static String safeTrimText(JsonNode node) {
        if (node == null || node.isNull()) {
            return "";
        }

        String text = node.asText("");
        return text == null ? "" : text.trim();
    }

    private static List<JsonNode> flattenToNodes(JsonNode root) {
        List<JsonNode> nodes = new ArrayList<>();
        if (root == null || root.isNull()) {
            return nodes;
        }

        if (root.isArray()) {
            for (JsonNode item : root) {
                nodes.add(item);
            }
            return nodes;
        }

        nodes.add(root);
        return nodes;
    }

    private static boolean isJobPosting(JsonNode node) {
        if (node == null || node.isNull()) {
            return false;
        }

        JsonNode typeNode = node.get("@type");
        if (typeNode == null) {
            return false;
        }

        if (typeNode.isTextual()) {
            return "JobPosting".equalsIgnoreCase(typeNode.asText());
        }

        if (typeNode.isArray()) {
            for (JsonNode t : typeNode) {
                if (t != null && t.isTextual() && "JobPosting".equalsIgnoreCase(t.asText())) {
                    return true;
                }
            }
        }

        return false;
    }

    private static JsonNode findCompanyNameNode(JsonNode jobPosting) {
        if (jobPosting == null) {
            return null;
        }

        // hiringOrganization.name is the most common
        JsonNode hiringOrganization = jobPosting.get("hiringOrganization");
        if (hiringOrganization != null && !hiringOrganization.isNull()) {
            JsonNode name = hiringOrganization.get("name");
            if (name != null && !name.asText("").isBlank()) {
                return name;
            }

            // Sometimes hiringOrganization itself may be string
            if (hiringOrganization.isTextual() && !hiringOrganization.asText("").isBlank()) {
                return hiringOrganization;
            }
        }

        // Fallback
        JsonNode name = jobPosting.get("name");
        if (name != null && !name.asText("").isBlank()) {
            return name;
        }

        return null;
    }

    private static String extractJobLocationText(JsonNode jobLocationNode) {
        if (jobLocationNode == null || jobLocationNode.isNull()) {
            return "";
        }

        if (jobLocationNode.isTextual()) {
            return jobLocationNode.asText("");
        }

        JsonNode address = jobLocationNode.get("address");
        if (address != null && !address.isNull()) {
            String locality = safeTrimText(address.get("addressLocality"));
            String region = safeTrimText(address.get("addressRegion"));
            String country = safeTrimText(address.get("addressCountry"));

            if (!locality.isBlank() && !region.isBlank()) {
                return locality + ", " + region;
            }
            if (!locality.isBlank() && !country.isBlank()) {
                return locality + ", " + country;
            }
            if (!region.isBlank() && !country.isBlank()) {
                return region + ", " + country;
            }

            return !locality.isBlank()
                    ? locality
                    : (!region.isBlank() ? region : safeTrimText(address.get("streetAddress")));
        }

        return safeTrimText(jobLocationNode);
    }

    private static String extractSalaryText(JsonNode jobPosting) {
        if (jobPosting == null) {
            return "";
        }

        JsonNode baseSalary = jobPosting.get("baseSalary");
        if (baseSalary == null || baseSalary.isNull()) {
            return "";
        }

        String currency = safeTrimText(baseSalary.get("currency"));
        JsonNode value = baseSalary.get("value");

        if (value != null && value.isObject()) {
            String minValue = safeTrimText(value.get("minValue"));
            String maxValue = safeTrimText(value.get("maxValue"));
            String unitText = safeTrimText(value.get("unitText"));

            String min = minValue;
            String max = maxValue;

            if (min.isBlank() && max.isBlank()) {
                return safeTrimText(baseSalary.get("value"));
            }

            if (!min.isBlank() && !max.isBlank()) {
                return (min + " - " + max)
                        + (unitText.isBlank() ? "" : (" " + unitText))
                        + (currency.isBlank() ? "" : (" " + currency));
            }

            String only = !min.isBlank() ? min : max;
            return only
                    + (unitText.isBlank() ? "" : (" " + unitText))
                    + (currency.isBlank() ? "" : (" " + currency));
        }

        // Fallback if schema uses direct string/text
        return safeTrimText(baseSalary);
    }
}
