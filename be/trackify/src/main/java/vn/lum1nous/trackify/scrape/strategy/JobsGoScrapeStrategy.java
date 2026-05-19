package vn.lum1nous.trackify.scrape.strategy;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
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
import org.springframework.util.StringUtils;

import vn.lum1nous.trackify.error.ErrorCode;
import vn.lum1nous.trackify.error.TrackifyException;
import vn.lum1nous.trackify.scrape.JobPostingFields;
import vn.lum1nous.trackify.scrape.JobPostingJsonLdExtractor;
import vn.lum1nous.trackify.scrape.ScrapeDriverFactory;
import vn.lum1nous.trackify.scrape.ScrapeHtmlCleaner;
import vn.lum1nous.trackify.scrape.ScrapeProperties;
import vn.lum1nous.trackify.scrape.ScrapeResult;

@Component
@RequiredArgsConstructor
public class JobsGoScrapeStrategy implements ScrapeStrategy {

    private static final DateTimeFormatter DEADLINE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final Pattern DATE_DD_MM_YYYY_PATTERN = Pattern.compile("(\\d{2}/\\d{2}/\\d{4})");

    private final ScrapeDriverFactory scrapeDriverFactory;
    private final ScrapeProperties scrapeProperties;
    private final ScrapeHtmlCleaner htmlCleaner;
    private final JobPostingJsonLdExtractor jobPostingJsonLdExtractor;

    @Override
    public boolean supports(String url) {
        return url != null && url.contains("jobsgo.vn");
    }

    @Override
    public ScrapeResult scrape(String url) {
        String trimmed = validateUrl(url);

        int retryCount = Math.max(0, scrapeProperties.getRetryCount());
        java.time.Duration retryDelay = java.time.Duration.ofMillis(Math.max(0, scrapeProperties.getRetryDelayMs()));

        TrackifyException lastException = null;

        for (int attempt = 0; attempt <= retryCount; attempt++) {
            try {
                Document jsoupDoc;
                try {
                    // JSoup fetch may fail directly with HTTP 403 (Cloudflare),
                    // so we fallback to Selenium if that happens.
                    jsoupDoc = fetchWithJsoup(trimmed);
                } catch (TrackifyException jsoupEx) {
                    String renderedHtml = fetchWithSelenium(trimmed);
                    Document renderedDoc = Jsoup.parse(renderedHtml);
                    return buildResultFromDocument(trimmed, renderedDoc);
                }

                if (!isCloudflareChallenge(jsoupDoc)) {
                    return buildResultFromDocument(trimmed, jsoupDoc);
                }

                // Fallback: render with selenium if blocked (Cloudflare challenge page)
                String renderedHtml = fetchWithSelenium(trimmed);
                Document renderedDoc = Jsoup.parse(renderedHtml);
                return buildResultFromDocument(trimmed, renderedDoc);
            } catch (TrackifyException ex) {
                lastException = ex;
            } catch (Exception ex) {
                lastException = new TrackifyException(
                        ErrorCode.BAD_REQUEST,
                        400,
                        "Failed to scrape JobsGo page",
                        Map.of("cause", ex.getMessage(), "attempt", attempt));
            }

            if (attempt < retryCount && retryDelay.toMillis() > 0) {
                try {
                    Thread.sleep(retryDelay.toMillis());
                } catch (InterruptedException ignored) {
                    Thread.currentThread().interrupt();
                }
            }
        }

        throw lastException != null
                ? lastException
                : new TrackifyException(ErrorCode.INTERNAL_SERVER_ERROR, 500, "Failed to scrape JobsGo page");
    }

    private Document fetchWithJsoup(String url) {
        try {
            return Jsoup.connect(url)
                    .userAgent(scrapeProperties.getUserAgent())
                    .timeout(
                            (int) java.time.Duration.ofSeconds(scrapeProperties.getPageLoadTimeoutSeconds()).toMillis())
                    .ignoreContentType(true)
                    .get();
        } catch (Exception ex) {
            throw new TrackifyException(
                    ErrorCode.BAD_REQUEST,
                    400,
                    "Failed to fetch JobsGo URL (JSoup)",
                    Map.of("cause", ex.getMessage()));
        }
    }

    private String fetchWithSelenium(String url) {
        org.openqa.selenium.WebDriver driver = null;
        try {
            driver = scrapeDriverFactory.createDriver();
            driver.navigate().to(url);

            org.openqa.selenium.support.ui.WebDriverWait wait = scrapeDriverFactory.newWait(driver);
            waitForJobPageReady(driver, wait);

            return driver.getPageSource();
        } catch (Exception ex) {
            throw new TrackifyException(
                    ErrorCode.BAD_REQUEST,
                    400,
                    "Failed to scrape JobsGo page (Selenium)",
                    Map.of("cause", ex.getMessage()));
        } finally {
            scrapeDriverFactory.quitQuietly(driver);
        }
    }

    private void waitForJobPageReady(org.openqa.selenium.WebDriver driver,
            org.openqa.selenium.support.ui.WebDriverWait wait) {
        // "Just a moment" thường xuất hiện khi bị Cloudflare challenge.
        // Ta đợi cho tới khi thấy title job (h1.job-title) hoặc canonical/meta
        // description.
        wait.until(webDriver -> {
            String title = safeLower(webDriver.getTitle());
            if (title.contains("just a moment")) {
                return false;
            }

            try {
                return !webDriver.findElements(org.openqa.selenium.By.cssSelector("h1.job-title")).isEmpty()
                        || !webDriver.findElements(org.openqa.selenium.By.cssSelector("link[rel='canonical']"))
                                .isEmpty()
                        || !webDriver.findElements(org.openqa.selenium.By.cssSelector("meta[name='description']"))
                                .isEmpty();
            } catch (Exception ignored) {
                return false;
            }
        });
    }

    private ScrapeResult buildResultFromDocument(String url, Document doc) {
        String title = safeTrim(doc.title());
        String metaDescription = selectMetaContent(doc, "name", "description");
        String ogTitle = selectMetaContent(doc, "property", "og:title");
        String ogDescription = selectMetaContent(doc, "property", "og:description");
        String canonicalUrl = selectLinkHref(doc, "rel", "canonical");

        // JSON-LD (best-effort)
        List<String> jsonLdScripts = extractJsonLdScripts(doc);
        int jsonLdCount = jsonLdScripts.size();
        List<String> jsonLdSamples = jsonLdScripts.size() > 0
                ? jsonLdScripts.subList(0, Math.min(3, jsonLdScripts.size()))
                : List.of();

        JobPostingFields jsonLdFields = jobPostingJsonLdExtractor.extractFromJsonLd(jsonLdScripts);

        // HTML best-effort fields
        String jobTitle = selectText(doc, "h1.job-title");
        String companyName = selectText(doc, "div.card-company h6.fw-semibold");
        String companyLogoUrl = extractCompanyLogoUrl(doc);

        String jobLocation = extractJobLocation(doc);

        String salaryText = extractSalaryText(doc);
        String jobDeadlineText = extractDeadlineText(doc);
        LocalDate jobDeadline = parseDeadline(jobDeadlineText);

        String jobDescription = extractJobDescriptionCombined(doc);

        // Prefer JSON-LD for structured job fields if available
        String finalJobTitle = normalize(jobTitle, jsonLdFields.getJobTitle());
        String finalCompanyName = normalize(companyName, jsonLdFields.getCompanyName());
        String finalJobLocation = normalize(jobLocation, jsonLdFields.getJobLocation());
        String finalSalaryText = normalize(salaryText, jsonLdFields.getSalaryText());
        String finalJobDescription = combineDescription(jobDescription, jsonLdFields.getJobDescription());

        return new ScrapeResult(
                url,
                safeTrim(title),
                safeTrim(metaDescription),
                safeTrim(ogTitle),
                safeTrim(ogDescription),
                safeTrim(canonicalUrl),
                jsonLdCount,
                jsonLdSamples,
                safeTrim(finalJobTitle),
                safeTrim(finalCompanyName),
                safeTrim(finalJobLocation),
                safeTrim(finalSalaryText),
                safeTrim(finalJobDescription),
                safeTrim(companyLogoUrl),
                jobDeadline);
    }

    private static String safeLower(String s) {
        return s == null ? "" : s.toLowerCase();
    }

    private static String safeTrim(String s) {
        return s == null ? "" : s.trim();
    }

    private static String normalize(String primary, String fallback) {
        if (!StringUtils.hasText(primary)) {
            return StringUtils.hasText(fallback) ? fallback : "";
        }
        return primary;
    }

    private String combineDescription(String htmlFromDom, String fromJsonLd) {
        String d1 = safeTrim(htmlFromDom);
        String d2 = safeTrim(fromJsonLd);

        if (!StringUtils.hasText(d1) && !StringUtils.hasText(d2)) {
            return "";
        }
        if (!StringUtils.hasText(d1)) {
            return d2;
        }
        if (!StringUtils.hasText(d2)) {
            return d1;
        }
        // If both exist, prefer DOM (since it already merged mô tả + yêu cầu for
        // missing-skill analysis)
        return d1;
    }

    private Document fetchDocumentOrThrow(String url) {
        return fetchWithJsoup(url);
    }

    private boolean isCloudflareChallenge(Document doc) {
        if (doc == null) {
            return true;
        }

        String title = safeLower(doc.title());
        if (title.contains("just a moment")) {
            return true;
        }

        String text = safeLower(doc.text());
        return text.contains("enable javascript and cookies to continue");
    }

    private static String selectText(Document doc, String cssQuery) {
        Element el = doc.selectFirst(cssQuery);
        return el == null ? "" : el.text().trim();
    }

    private static String selectMetaContent(Document doc, String attrName, String attrValue) {
        Elements metas = doc.select("meta[" + attrName + "='" + attrValue + "']");
        if (metas.isEmpty()) {
            return "";
        }
        String content = metas.first().attr("content");
        return content == null ? "" : content.trim();
    }

    private static String selectLinkHref(Document doc, String attrName, String attrValue) {
        Elements links = doc.select("link[" + attrName + "='" + attrValue + "']");
        if (links.isEmpty()) {
            return "";
        }
        String href = links.first().attr("href");
        return href == null ? "" : href.trim();
    }

    private List<String> extractJsonLdScripts(Document doc) {
        Elements scripts = doc.select("script[type=application/ld+json]");
        if (scripts.isEmpty()) {
            return List.of();
        }

        return scripts.stream()
                .map(el -> {
                    String raw = el.text();
                    if (!StringUtils.hasText(raw)) {
                        raw = el.html();
                    }
                    return raw == null ? "" : raw.trim();
                })
                .filter(StringUtils::hasText)
                .toList();
    }

    private String extractCompanyLogoUrl(Document doc) {
        // Preferred: <img ... width="80" height="80" ... class="me-3 ...">
        Element img = doc.selectFirst("div.card-company img[width='80'][height='80']");
        if (img != null && StringUtils.hasText(img.attr("src"))) {
            return img.attr("src").trim();
        }

        // Fallback: -200x200 in src
        Elements imgs = doc.select("div.card-company img");
        for (Element candidate : imgs) {
            String src = safeTrim(candidate.attr("src"));
            if (src.contains("-200x200")) {
                return src;
            }
        }

        // Fallback: any employer image in card-company
        for (Element candidate : imgs) {
            String src = safeTrim(candidate.attr("src"));
            if (src.contains("media.jobsgo.vn/media/img/employer")) {
                return src;
            }
        }

        return "";
    }

    private String extractJobLocation(Document doc) {
        Element strong = doc.selectFirst("div#places strong.mb-1.d-block");
        String province = strong == null ? "" : strong.text().trim();

        // Location-extra span often contains the detailed address
        Element extraSpan = doc.selectFirst("div#places .location-extra.mt-2 span");
        String extra = extraSpan == null ? "" : extraSpan.text().trim();

        if (province.isBlank()) {
            return extra;
        }
        if (extra.isBlank()) {
            return province;
        }
        return province + " - " + extra;
    }

    private String extractDeadlineText(Document doc) {
        Elements ps = doc.select("p");
        for (Element p : ps) {
            if (p.text() != null && p.text().contains("Hạn nộp hồ sơ")) {
                Element strong = p.selectFirst("strong");
                String raw = strong == null ? "" : strong.text().trim();
                return raw;
            }
        }
        return "";
    }

    private LocalDate parseDeadline(String deadlineText) {
        if (!StringUtils.hasText(deadlineText)) {
            return null;
        }

        Matcher m = DATE_DD_MM_YYYY_PATTERN.matcher(deadlineText);
        if (!m.find()) {
            return null;
        }

        String dateStr = m.group(1);
        try {
            return LocalDate.parse(dateStr, DEADLINE_FORMATTER);
        } catch (Exception ignored) {
            return null;
        }
    }

    private String extractSalaryText(Document doc) {
        Elements lis = doc.select("li");
        for (Element li : lis) {
            String text = safeTrim(li.text());
            if (text.contains("Mức lương:")) {
                Element strong = li.selectFirst("strong");
                String raw = strong == null ? "" : strong.text().trim();
                return raw;
            }
        }
        return "";
    }

    private String extractJobDescriptionCombined(Document doc) {
        String desc = extractSectionList(doc, "Mô tả công việc");
        String req = extractSectionList(doc, "Yêu cầu công việc");

        if (!StringUtils.hasText(desc) && !StringUtils.hasText(req)) {
            return "";
        }
        if (!StringUtils.hasText(desc)) {
            return cleanTextHeader("Yêu cầu công việc", req);
        }
        if (!StringUtils.hasText(req)) {
            return cleanTextHeader("Mô tả công việc", desc);
        }

        String combined = "Mô tả công việc:\n" + desc + "\n\nYêu cầu công việc:\n" + req;
        return htmlCleaner.cleanAndUnescape(combined);
    }

    private String cleanTextHeader(String header, String body) {
        if (!StringUtils.hasText(body)) {
            return "";
        }
        return htmlCleaner.cleanAndUnescape(header + ":\n" + body);
    }

    private String extractSectionList(Document doc, String sectionTitle) {
        // JobsGo sometimes wraps the heading in different tags (h3/div/span) but the
        // class ".section-title" seems consistent.
        Elements headings = doc.select(".section-title");
        for (Element heading : headings) {
            String text = safeTrim(heading.text());
            if (!text.contains(sectionTitle)) {
                continue;
            }

            Element ul = findNextUlForSection(heading);
            if (ul == null) {
                continue;
            }

            Elements items = ul.select("li");
            if (items.isEmpty()) {
                continue;
            }

            StringBuilder sb = new StringBuilder(256);
            for (Element li : items) {
                String itemText = cleanListItemText(li.text());
                if (!itemText.isBlank()) {
                    sb.append("- ").append(itemText).append("\n");
                }
            }
            return sb.toString().trim();
        }

        return "";
    }

    private Element findNextUlForSection(Element sectionHeading) {
        // Walk following siblings until we find an UL (direct or nested) before
        // the next ".section-title".
        Element cursor = sectionHeading.nextElementSibling();
        int guard = 0;

        while (cursor != null && guard < 80) {
            guard++;

            if ("section-title".equalsIgnoreCase(cursor.className())) {
                return null;
            }
            if (cursor.hasClass("section-title")) {
                return null;
            }

            Element directUl = cursor.tagName() != null && "ul".equalsIgnoreCase(cursor.tagName())
                    ? cursor
                    : cursor.selectFirst("ul");

            if (directUl != null) {
                return directUl;
            }

            cursor = cursor.nextElementSibling();
        }

        // Fallback: within same parent, return first UL (best-effort).
        Element parent = sectionHeading.parent();
        if (parent == null) {
            return null;
        }

        Elements uls = parent.select("ul");
        return uls.isEmpty() ? null : uls.first();
    }

    private String cleanListItemText(String text) {
        if (text == null) {
            return "";
        }
        String t = text.trim();
        if (t.isEmpty()) {
            return "";
        }

        // Sometimes there are html entities left in text nodes; unescape safely.
        try {
            t = StringEscapeUtils.unescapeHtml4(t);
        } catch (Exception ignored) {
        }
        t = t.replaceAll("\\s+", " ").trim();
        return t;
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
            throw new TrackifyException(
                    ErrorCode.BAD_REQUEST,
                    400,
                    "Invalid URL",
                    Map.of("cause", ex.getMessage()));
        }

        return trimmed;
    }
}
