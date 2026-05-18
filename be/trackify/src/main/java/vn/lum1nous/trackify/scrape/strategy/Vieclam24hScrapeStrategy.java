package vn.lum1nous.trackify.scrape.strategy;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import org.apache.commons.text.StringEscapeUtils;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Component;
import vn.lum1nous.trackify.error.ErrorCode;
import vn.lum1nous.trackify.error.TrackifyException;
import vn.lum1nous.trackify.scrape.JobPostingFields;
import vn.lum1nous.trackify.scrape.JobPostingJsonLdExtractor;
import vn.lum1nous.trackify.scrape.ScrapeHtmlCleaner;
import vn.lum1nous.trackify.scrape.ScrapeProperties;
import vn.lum1nous.trackify.scrape.ScrapeResult;

@Component
@RequiredArgsConstructor
public class Vieclam24hScrapeStrategy implements ScrapeStrategy {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private static final ZoneId VN_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private static final Pattern VALID_THROUGH_PATTERN = Pattern.compile("\"validThrough\"\\s*:\\s*\"([^\"]+)\"");

    private static final Pattern JOB_BENEFITS_PATTERN = Pattern.compile("\"jobBenefits\"\\s*:\\s*\"(.*?)\"\\s*(,|})",
            Pattern.DOTALL);

    private static final Pattern HIRING_ORG_LOGO_PATTERN = Pattern.compile(
            "\"hiringOrganization\"\\s*:\\s*\\{.*?\"logo\"\\s*:\\s*\"([^\"]+)\"",
            Pattern.DOTALL);

    private final ScrapeProperties scrapeProperties;
    private final ScrapeHtmlCleaner htmlCleaner;
    private final JobPostingJsonLdExtractor jobPostingJsonLdExtractor;

    @Override
    public boolean supports(String url) {
        return url != null && url.contains("vieclam24h.vn");
    }

    @Override
    public ScrapeResult scrape(String url) {
        String trimmed = validateUrl(url);

        try {
            String html = fetchHtmlUtf8(trimmed);
            Document doc = Jsoup.parse(html, trimmed);

            String title = safeTrim(doc.title());

            String metaDescription = safeTrim(selectMeta(doc, "name", "description"));
            String ogTitle = safeTrim(selectMeta(doc, "property", "og:title"));
            String ogDescription = safeTrim(selectMeta(doc, "property", "og:description"));
            String canonicalUrl = safeTrim(selectLinkHref(doc, "rel", "canonical"));

            List<String> jsonLdScripts = extractJsonLdScripts(doc);
            int jsonLdCount = jsonLdScripts.size();
            List<String> jsonLdSamples = jsonLdScripts.size() > 0
                    ? jsonLdScripts.subList(0, Math.min(3, jsonLdScripts.size()))
                    : List.of();

            // 1) Best-effort extract job fields from JSON-LD (if present)
            JobPostingFields jobFields = jobPostingJsonLdExtractor.extractFromJsonLd(jsonLdScripts);

            String jobTitleFromJsonLd = normalize(jobFields.getJobTitle());
            String companyNameFromJsonLd = normalize(jobFields.getCompanyName());
            String jobLocationFromJsonLd = normalize(jobFields.getJobLocation());
            String salaryTextFromJsonLd = normalize(jobFields.getSalaryText());
            String jobDescriptionFromJsonLd = normalize(jobFields.getJobDescription());

            String companyLogoUrl = extractCompanyLogoUrlFromJsonLd(jsonLdScripts);
            LocalDate jobDeadline = extractJobDeadlineFromJsonLd(jsonLdScripts);

            // 2) Backup / enhancement: extract rich text from __NEXT_DATA__
            NextDataJobSnapshot nextData = extractFromNextData(doc);

            String jobTitle = pickFirstNonBlank(jobTitleFromJsonLd, nextData.jobTitle);
            String companyName = pickFirstNonBlank(companyNameFromJsonLd, nextData.companyName);
            String jobLocation = pickFirstNonBlank(jobLocationFromJsonLd, nextData.jobLocation);
            String salaryText = pickFirstNonBlank(nextData.salaryText, salaryTextFromJsonLd);

            String jobBenefitsFromJsonLd = extractJobBenefitsFromJsonLd(jsonLdScripts);

            String jobDescription = buildJobDescription(jobDescriptionFromJsonLd, nextData, jobBenefitsFromJsonLd);

            // 3) Deadline fallback from timestamp (if validThrough not found)
            if (jobDeadline == null) {
                jobDeadline = nextData.deadlineDate;
            }

            // Logo fallback: JSON-LD <-> __NEXT_DATA__
            String companyLogo = pickFirstNonBlank(companyLogoUrl, nextData.companyLogoUrl);

            return new ScrapeResult(
                    trimmed,
                    title,
                    metaDescription,
                    ogTitle,
                    ogDescription,
                    canonicalUrl,
                    jsonLdCount,
                    jsonLdSamples,
                    safeTrim(jobTitle),
                    safeTrim(companyName),
                    safeTrim(jobLocation),
                    safeTrim(salaryText),
                    safeTrim(jobDescription),
                    safeTrim(companyLogo),
                    jobDeadline);
        } catch (TrackifyException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new TrackifyException(
                    ErrorCode.BAD_REQUEST,
                    400,
                    "Failed to scrape Vieclam24h page",
                    Map.of("cause", ex.getMessage()));
        }
    }

    private static String validateUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            throw new TrackifyException(ErrorCode.BAD_REQUEST, 400, "URL is required");
        }

        String trimmed = url.trim();

        try {
            java.net.URI uri = java.net.URI.create(trimmed);
            if (uri.getScheme() == null || uri.getHost() == null) {
                throw new TrackifyException(
                        ErrorCode.BAD_REQUEST,
                        400,
                        "Invalid URL",
                        Map.of("cause", "Missing scheme/host"));
            }
        } catch (IllegalArgumentException ex) {
            throw new TrackifyException(ErrorCode.BAD_REQUEST, 400, "Invalid URL", Map.of("cause", ex.getMessage()));
        }

        return trimmed;
    }

    private static String safeTrim(String s) {
        return s == null ? "" : s.trim();
    }

    private static String selectMeta(Document doc, String attrName, String attrValue) {
        Elements metas = doc.select("meta[" + attrName + "='" + attrValue + "']");
        if (metas.isEmpty()) {
            return "";
        }
        return metas.first().attr("content");
    }

    private static String selectLinkHref(Document doc, String attrName, String attrValue) {
        Elements links = doc.select("link[" + attrName + "='" + attrValue + "']");
        if (links.isEmpty()) {
            return "";
        }
        return links.first().attr("href");
    }

    private static List<String> extractJsonLdScripts(Document doc) {
        // Using text() because in head script tag it should contain valid JSON
        return doc.select("script[type=application/ld+json]")
                .eachText();
    }

    private static String normalize(String s) {
        if (s == null) {
            return "";
        }
        return s.trim();
    }

    private static String pickFirstNonBlank(String primary, String fallback) {
        if (primary != null && !primary.isBlank()) {
            return primary;
        }
        return fallback == null ? "" : fallback;
    }

    private String extractCompanyLogoUrlFromJsonLd(List<String> jsonLdScripts) {
        if (jsonLdScripts == null || jsonLdScripts.isEmpty()) {
            return "";
        }

        for (String script : jsonLdScripts) {
            if (script == null || script.isBlank()) {
                continue;
            }

            String raw = script;
            try {
                Matcher m = HIRING_ORG_LOGO_PATTERN.matcher(raw);
                if (m.find()) {
                    String logo = m.group(1);
                    if (logo != null && !logo.isBlank()) {
                        return StringEscapeUtils.unescapeJava(logo.trim());
                    }
                }
            } catch (Exception ignored) {
                // best-effort
            }
        }

        return "";
    }

    private static LocalDate extractJobDeadlineFromJsonLd(List<String> jsonLdScripts) {
        if (jsonLdScripts == null || jsonLdScripts.isEmpty()) {
            return null;
        }

        for (String script : jsonLdScripts) {
            if (script == null || script.isBlank()) {
                continue;
            }

            String text = script;
            Matcher m = VALID_THROUGH_PATTERN.matcher(text);
            if (m.find()) {
                String validThrough = m.group(1);
                if (validThrough == null || validThrough.isBlank()) {
                    continue;
                }

                // sample: 2026-06-04T23:59:59+07:00
                try {
                    return OffsetDateTime.parse(validThrough).toLocalDate();
                } catch (DateTimeParseException ignored) {
                    // fallback yyyy-MM-dd
                    Matcher m2 = Pattern.compile("(\\d{4}-\\d{2}-\\d{2})").matcher(validThrough);
                    if (m2.find()) {
                        return LocalDate.parse(m2.group(1));
                    }
                }
            }
        }

        return null;
    }

    private String buildJobDescription(String jobDescriptionFromJsonLd, NextDataJobSnapshot nextData,
            String jobBenefitsFromJsonLd) {
        // Prefer __NEXT_DATA__ rich fields (description + other_requirement + benefit)
        // because it usually matches the rendered sections on page.
        if (nextData.hasAnyRichFields()) {
            return nextData.combinedJobDescription;
        }

        // Fallback to JSON-LD description, plus best-effort jobBenefits extraction.
        String cleaned = jobDescriptionFromJsonLd == null ? "" : jobDescriptionFromJsonLd;
        if (cleaned.isBlank()) {
            cleaned = "";
        }

        String benefits = jobBenefitsFromJsonLd == null ? "" : jobBenefitsFromJsonLd;
        if (!benefits.isBlank()) {
            if (!cleaned.isBlank()) {
                return cleaned + "\n" + benefits;
            }
            return benefits;
        }

        return cleaned;
    }

    private String extractJobBenefitsFromJsonLd(List<String> jsonLdScripts) {
        if (jsonLdScripts == null || jsonLdScripts.isEmpty()) {
            return "";
        }

        for (String script : jsonLdScripts) {
            if (script == null || script.isBlank()) {
                continue;
            }

            Matcher m = JOB_BENEFITS_PATTERN.matcher(script);
            if (!m.find()) {
                continue;
            }

            String rawJobBenefits = m.group(1);
            if (rawJobBenefits == null || rawJobBenefits.isBlank()) {
                continue;
            }

            String unescaped = "";
            try {
                unescaped = StringEscapeUtils.unescapeJava(rawJobBenefits.trim());
            } catch (Exception ignored) {
                unescaped = rawJobBenefits.trim();
            }

            // jobBenefits field is usually HTML-ish; strip tags to text
            String cleaned = htmlCleaner.cleanAndUnescape(unescaped);
            if (!cleaned.isBlank()) {
                return cleaned;
            }
        }

        return "";
    }

    private NextDataJobSnapshot extractFromNextData(Document doc) {
        NextDataJobSnapshot snapshot = new NextDataJobSnapshot();

        try {
            String nextDataJson = doc.select("script#__NEXT_DATA__")
                    .first()
                    .data();

            if (nextDataJson == null || nextDataJson.isBlank()) {
                return snapshot;
            }

            JsonNode root = OBJECT_MAPPER.readTree(nextDataJson);

            // props.initialState.api.jobDetailHiddenContact.data
            JsonNode jobData = root.at("/props/initialState/api/jobDetailHiddenContact/data");
            if (jobData == null || jobData.isMissingNode()) {
                return snapshot;
            }

            snapshot.jobTitle = safeTrim(jobData.path("title").asText(""));
            snapshot.companyName = safeTrim(jobData.path("employer_info").path("name").asText(""));

            // places: [{address: ...}, ...]
            JsonNode places = jobData.path("places");
            if (places.isArray()) {
                List<String> addresses = new ArrayList<>();
                for (JsonNode place : places) {
                    String addr = place.path("address").asText("");
                    if (addr != null && !addr.isBlank()) {
                        addresses.add(addr.trim());
                    }
                }
                snapshot.jobLocation = String.join("; ", addresses);
            }

            long salaryMin = jobData.path("salary_min").asLong(0);
            long salaryMax = jobData.path("salary_max").asLong(0);
            snapshot.salaryText = formatSalaryInTriệu(salaryMin, salaryMax);

            // description fields
            String descriptionHtml = jobData.path("description").asText("");
            String otherRequirementHtml = jobData.path("other_requirement").asText("");
            String benefitHtml = jobData.path("benefit").asText("");

            String combined = joinNonBlank(descriptionHtml, otherRequirementHtml, benefitHtml);
            snapshot.combinedJobDescription = htmlCleaner.cleanAndUnescape(combined);

            // deadline
            // resume_apply_expired: epoch seconds
            long deadlineEpochSeconds = jobData.path("resume_apply_expired").asLong(0);
            if (deadlineEpochSeconds > 0) {
                snapshot.deadlineDate = Instant.ofEpochSecond(deadlineEpochSeconds)
                        .atZone(VN_ZONE)
                        .toLocalDate();
            }

            // company logo: props.initialState.api.employerDetailHiddenContact.data.logo
            JsonNode employerLogo = root.at("/props/initialState/api/employerDetailHiddenContact/data/logo");
            if (employerLogo != null && employerLogo.isMissingNode() == false) {
                snapshot.companyLogoUrl = safeTrim(employerLogo.asText(""));
            }
        } catch (Exception ignored) {
            // best-effort only
        }

        return snapshot;
    }

    private static String joinNonBlank(String... parts) {
        StringBuilder sb = new StringBuilder();
        for (String p : parts) {
            if (p == null || p.trim().isEmpty()) {
                continue;
            }
            if (sb.length() > 0) {
                sb.append("\n");
            }
            sb.append(p);
        }
        return sb.toString();
    }

    private String formatSalaryInTriệu(long salaryMin, long salaryMax) {
        if (salaryMin <= 0 && salaryMax <= 0) {
            return "";
        }

        // Convert VND to "triệu" (million VND): 1 triệu = 1,000,000 VND
        final long MILLION = 1_000_000L;

        if (salaryMin > 0 && salaryMax > 0) {
            long minTri = Math.round(salaryMin / (double) MILLION);
            long maxTri = Math.round(salaryMax / (double) MILLION);

            if (minTri == 0 || maxTri == 0) {
                return "";
            }

            return minTri + " - " + maxTri + " triệu";
        }

        long only = salaryMin > 0 ? salaryMin : salaryMax;
        long tri = Math.round(only / (double) MILLION);
        if (tri <= 0) {
            return "";
        }
        return tri + " triệu";
    }

    private String fetchHtmlUtf8(String url) {
        if (url == null || url.isBlank()) {
            return "";
        }

        try {
            HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(20_000);
            conn.setReadTimeout(20_000);

            if (scrapeProperties.getUserAgent() != null && !scrapeProperties.getUserAgent().isBlank()) {
                conn.setRequestProperty("User-Agent", scrapeProperties.getUserAgent().trim());
            }
            conn.setRequestProperty("Accept-Charset", "utf-8");

            try (InputStream in = conn.getInputStream()) {
                byte[] bytes = in.readAllBytes();
                return new String(bytes, StandardCharsets.UTF_8);
            }
        } catch (Exception ex) {
            // fallback: best-effort empty; upper layer sẽ vẫn parse JSON-LD nếu có
            return "";
        }
    }

    private static final class NextDataJobSnapshot {
        private String jobTitle = "";
        private String companyName = "";
        private String jobLocation = "";
        private String salaryText = "";
        private String combinedJobDescription = "";
        private LocalDate deadlineDate = null;
        private String companyLogoUrl = "";

        private boolean hasAnyRichFields() {
            return (combinedJobDescription != null && !combinedJobDescription.isBlank());
        }
    }
}
