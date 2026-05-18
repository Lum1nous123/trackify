package vn.lum1nous.trackify.scrape.strategy;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import lombok.RequiredArgsConstructor;
import org.apache.commons.text.StringEscapeUtils;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
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
public class VietnamWorksScrapeStrategy implements ScrapeStrategy {

    private static final Pattern EXPIRED_ON_PATTERN = Pattern.compile("\"expiredOn\"\\s*:\\s*\"([^\"]+)\"");
    private static final Pattern COMPANY_LOGO_PATTERN = Pattern.compile("\"companyLogoURL\"\\s*:\\s*\"([^\"]+)\"");
    private static final Pattern JOB_TITLE_PATTERN = Pattern.compile("\"jobTitle\"\\s*:\\s*\"([^\"]+)\"");
    private static final Pattern COMPANY_NAME_PATTERN = Pattern.compile("\"companyName\"\\s*:\\s*\"([^\"]+)\"");
    private static final Pattern PRETTY_SALARY_PATTERN = Pattern.compile("\"prettySalary\"\\s*:\\s*\"([^\"]+)\"");
    private static final Pattern SALARY_MIN_PATTERN = Pattern.compile("\"salaryMin\"\\s*:\\s*(\\d+)");
    private static final Pattern SALARY_MAX_PATTERN = Pattern.compile("\"salaryMax\"\\s*:\\s*(\\d+)");
    private static final Pattern SALARY_CURRENCY_PATTERN = Pattern.compile("\"salaryCurrency\"\\s*:\\s*\"([^\"]+)\"");

    private static final Pattern JOB_DESCRIPTION_PATTERN = Pattern
            .compile("\"jobDescription\"\\s*:\\s*\"(.*?)\"\\s*,\\s*\"jobRequirement\"", Pattern.DOTALL);
    private static final Pattern JOB_REQUIREMENT_PATTERN = Pattern
            .compile("\"jobRequirement\"\\s*:\\s*\"(.*?)\"\\s*,\\s*\"jobLevelId\"", Pattern.DOTALL);

    // workingLocations: pick the first address found in the script payload
    private static final Pattern ADDRESS_PATTERN = Pattern.compile("\"workingLocations\"\\s*:\\s*\\[(.*?)\\]",
            Pattern.DOTALL);
    private static final Pattern ADDRESS_INSIDE_WORKING_LOCATIONS_PATTERN = Pattern
            .compile("\"address\"\\s*:\\s*\"([^\"]+)\"");

    private static final Pattern JSON_LD_SCRIPTS_PATTERN = Pattern.compile("type=['\"]application/ld\\+json['\"]");

    private final ScrapeProperties scrapeProperties;
    private final ScrapeHtmlCleaner htmlCleaner;
    private final JobPostingJsonLdExtractor jobPostingJsonLdExtractor;

    @Override
    public boolean supports(String url) {
        return url != null && url.contains("vietnamworks.com");
    }

    @Override
    public ScrapeResult scrape(String url) {
        String trimmed = validateUrl(url);

        try {
            Document doc = Jsoup.connect(trimmed)
                    .userAgent(scrapeProperties.getUserAgent())
                    .timeout((int) java.time.Duration.ofSeconds(20).toMillis())
                    .ignoreContentType(true)
                    .get();

            String title = safeTrim(doc.title());

            String metaDescription = safeTrim(selectMeta(doc, "name", "description"));
            String ogTitle = safeTrim(selectMeta(doc, "property", "og:title"));
            String ogDescription = safeTrim(selectMeta(doc, "property", "og:description"));
            String canonicalUrl = safeTrim(selectLinkHref(doc, "rel", "canonical"));

            String pageText = doc.outerHtml();

            // Next payload thường chứa chuỗi escape kiểu \"expiredOn\", \/... trong script
            // text.
            // Normalize để regex có thể match ổn định.
            String normalizedText = pageText
                    .replace("\\\"", "\"")
                    .replace("\\/", "/");

            String companyLogoUrl = extractAndUnescape(group1(normalizedText, COMPANY_LOGO_PATTERN));
            LocalDate jobDeadline = extractExpiredOnDate(normalizedText);

            String jobTitle = extractAndUnescape(group1(normalizedText, JOB_TITLE_PATTERN));
            String companyName = extractAndUnescape(group1(normalizedText, COMPANY_NAME_PATTERN));

            String address = extractJobLocationFromWorkingLocations(normalizedText);

            // jobDescription + jobRequirement (gộp)
            String jobDescriptionRaw = extractJobBlock(normalizedText, JOB_DESCRIPTION_PATTERN, true);
            String jobRequirementRaw = extractJobBlock(normalizedText, JOB_REQUIREMENT_PATTERN, false);

            String jobDescriptionCombined = combineAndCleanJobDescription(jobDescriptionRaw, jobRequirementRaw);

            String salaryText = extractSalaryText(normalizedText);

            // Best-effort JSON-LD extraction (if exists)
            // This keeps behavior similar to current selenium approach.
            List<String> jsonLdScripts = extractJsonLdScripts(doc);
            JobPostingFields jobFields = jobPostingJsonLdExtractor.extractFromJsonLd(jsonLdScripts);

            return new ScrapeResult(
                    trimmed,
                    title,
                    metaDescription,
                    ogTitle,
                    ogDescription,
                    canonicalUrl,
                    jsonLdScripts.size(),
                    jsonLdScripts.size() > 0 ? jsonLdScripts.subList(0, Math.min(3, jsonLdScripts.size())) : List.of(),
                    normalize(jobTitle, jobFields.getJobTitle()),
                    normalize(companyName, jobFields.getCompanyName()),
                    normalize(address, jobFields.getJobLocation()),
                    salaryText.isBlank() ? jobFields.getSalaryText() : salaryText,
                    jobDescriptionCombined.isBlank() ? jobFields.getJobDescription() : jobDescriptionCombined,
                    safeTrim(companyLogoUrl),
                    jobDeadline);
        } catch (TrackifyException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new TrackifyException(
                    ErrorCode.BAD_REQUEST,
                    400,
                    "Failed to scrape VietnamWorks page",
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

    private static String collectAllScriptsText(Document doc) {
        StringBuilder sb = new StringBuilder(16_384);
        Elements scripts = doc.getElementsByTag("script");

        for (Element script : scripts) {
            String text = script.data();
            if (text == null || text.isBlank()) {
                text = script.html();
            }
            if (text == null || text.isBlank()) {
                continue;
            }
            sb.append(text).append('\n');
        }

        return sb.toString();
    }

    private static String group1(String text, Pattern p) {
        if (text == null || text.isBlank()) {
            return "";
        }
        Matcher m = p.matcher(text);
        if (!m.find()) {
            return "";
        }
        String g = m.group(1);
        return g == null ? "" : g;
    }

    private static String extractAndUnescape(String raw) {
        if (raw == null) {
            return "";
        }
        String trimmed = raw.trim();
        if (trimmed.isEmpty()) {
            return "";
        }

        // raw likely contains \u003c etc
        try {
            return StringEscapeUtils.unescapeJava(trimmed);
        } catch (Exception ignored) {
            return trimmed;
        }
    }

    private static LocalDate extractExpiredOnDate(String scriptsText) {
        String expiredOn = group1(scriptsText, EXPIRED_ON_PATTERN);
        if (expiredOn.isBlank()) {
            return null;
        }

        // expiredOn example: 2026-05-25T23:59:59+07:00
        try {
            return OffsetDateTime.parse(expiredOn).toLocalDate();
        } catch (DateTimeParseException ignored) {
            // fallback: only take yyyy-MM-dd
            Matcher m = Pattern.compile("(\\d{4}-\\d{2}-\\d{2})").matcher(expiredOn);
            if (m.find()) {
                return LocalDate.parse(m.group(1));
            }
            return null;
        }
    }

    private static String extractJobLocationFromWorkingLocations(String scriptsText) {
        String workingLocationsBlock = group1(scriptsText, ADDRESS_PATTERN);
        if (workingLocationsBlock.isBlank()) {
            return "";
        }

        Matcher m = ADDRESS_INSIDE_WORKING_LOCATIONS_PATTERN.matcher(workingLocationsBlock);
        if (!m.find()) {
            return "";
        }

        return extractAndUnescape(m.group(1));
    }

    private String extractJobBlock(String scriptsText, Pattern blockPattern, boolean cleanHtml) {
        Matcher m = blockPattern.matcher(scriptsText);
        if (!m.find()) {
            return "";
        }
        String raw = m.group(1);
        String unescaped = extractAndUnescape(raw);
        if (!cleanHtml) {
            // still unescaped, but will be cleaned later
            return unescaped == null ? "" : unescaped;
        }
        return unescaped == null ? "" : unescaped;
    }

    private String combineAndCleanJobDescription(String jobDescriptionRaw, String jobRequirementRaw) {
        String d1 = safeTrim(jobDescriptionRaw);
        String d2 = safeTrim(jobRequirementRaw);

        String combinedHtml;
        if (d1.isBlank() && d2.isBlank()) {
            return "";
        }
        if (d1.isBlank()) {
            combinedHtml = d2;
        } else if (d2.isBlank()) {
            combinedHtml = d1;
        } else {
            combinedHtml = d1 + "\n" + d2;
        }

        // combinedHtml should contain real <p>...</p> after unescapeJava
        return htmlCleaner.cleanAndUnescape(combinedHtml);
    }

    private String extractSalaryText(String scriptsText) {
        String prettySalary = group1(scriptsText, PRETTY_SALARY_PATTERN);
        if (!prettySalary.isBlank()) {
            return extractAndUnescape(prettySalary);
        }

        String salaryMin = group1(scriptsText, SALARY_MIN_PATTERN);
        String salaryMax = group1(scriptsText, SALARY_MAX_PATTERN);
        String currency = group1(scriptsText, SALARY_CURRENCY_PATTERN);

        if (salaryMin.isBlank() && salaryMax.isBlank()) {
            return "";
        }

        if (!salaryMin.isBlank() && !salaryMax.isBlank()) {
            String cur = currency.isBlank() ? "" : (" " + extractAndUnescape(currency));
            return extractAndUnescape(salaryMin) + " - " + extractAndUnescape(salaryMax) + cur;
        }

        String single = !salaryMin.isBlank() ? salaryMin : salaryMax;
        String cur = currency.isBlank() ? "" : (" " + extractAndUnescape(currency));
        return extractAndUnescape(single) + cur;
    }

    private List<String> extractJsonLdScripts(Document doc) {
        // If site has JSON-LD scripts, we parse them using existing extractor
        // (fallback when Next payload doesn't contain jobDescription fields).
        return doc.select("script[type=application/ld+json]")
                .eachText();
    }

    private static String normalize(String primary, String fallback) {
        if (primary == null || primary.isBlank()) {
            return fallback == null ? "" : fallback;
        }
        return primary;
    }
}
