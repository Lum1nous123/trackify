package vn.lum1nous.trackify.scrape.strategy;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.stereotype.Component;
import vn.lum1nous.trackify.error.ErrorCode;
import vn.lum1nous.trackify.error.TrackifyException;
import vn.lum1nous.trackify.scrape.JobPostingFields;
import vn.lum1nous.trackify.scrape.JobPostingJsonLdExtractor;
import vn.lum1nous.trackify.scrape.ScrapeDriverFactory;
import vn.lum1nous.trackify.scrape.ScrapeProperties;
import vn.lum1nous.trackify.scrape.ScrapeResult;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class TopCvScrapeStrategy implements ScrapeStrategy {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final DateTimeFormatter DEADLINE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final ScrapeDriverFactory scrapeDriverFactory;
    private final ScrapeProperties scrapeProperties;
    private final JobPostingJsonLdExtractor jobPostingJsonLdExtractor;

    @Override
    public boolean supports(String url) {
        return url != null && url.contains("topcv.vn");
    }

    @Override
    public ScrapeResult scrape(String url) {
        String trimmed = validateUrl(url);

        int retryCount = Math.max(0, scrapeProperties.getRetryCount());
        java.time.Duration retryDelay = java.time.Duration.ofMillis(Math.max(0, scrapeProperties.getRetryDelayMs()));

        TrackifyException lastException = null;

        for (int attempt = 0; attempt <= retryCount; attempt++) {
            WebDriver driver = null;
            try {
                driver = scrapeDriverFactory.createDriver();
                navigate(driver, trimmed);
                WebDriverWait wait = scrapeDriverFactory.newWait(driver);

                waitForPageReady(driver, wait);

                String title = safeTrim(driver.getTitle());

                String metaDescription = safeTrim(getMetaContent(driver, "name", "description"));
                String ogTitle = safeTrim(getMetaContent(driver, "property", "og:title"));
                String ogDescription = safeTrim(getMetaContent(driver, "property", "og:description"));
                String canonicalUrl = safeTrim(getLinkHref(driver, "rel", "canonical"));

                List<WebElement> jsonLdElements = driver
                        .findElements(By.cssSelector("script[type='application/ld+json']"));
                int jsonLdCount = jsonLdElements.size();

                List<String> jsonLdScripts = new ArrayList<>();
                List<String> jsonLdSamples = new ArrayList<>();

                for (WebElement el : jsonLdElements) {
                    String raw = el.getText();
                    if (raw == null || raw.isBlank()) {
                        raw = el.getAttribute("innerHTML");
                    }
                    if (raw == null || raw.isBlank()) {
                        continue;
                    }
                    String trimmedJson = raw.trim();
                    if (trimmedJson.isBlank()) {
                        continue;
                    }

                    jsonLdScripts.add(trimmedJson);

                    if (jsonLdSamples.size() < 3) {
                        jsonLdSamples.add(trimmedJson);
                    }
                }

                JobPostingFields jobFields = jobPostingJsonLdExtractor.extractFromJsonLd(jsonLdScripts);

                String companyLogoUrl = extractCompanyLogoUrl(driver);
                LocalDate jobDeadline = extractJobDeadline(driver);

                return new ScrapeResult(
                        trimmed,
                        title,
                        metaDescription,
                        ogTitle,
                        ogDescription,
                        canonicalUrl,
                        jsonLdCount,
                        jsonLdSamples,
                        safeTrim(jobFields.getJobTitle()),
                        safeTrim(jobFields.getCompanyName()),
                        safeTrim(jobFields.getJobLocation()),
                        safeTrim(jobFields.getSalaryText()),
                        safeTrim(jobFields.getJobDescription()),
                        safeTrim(companyLogoUrl),
                        jobDeadline);
            } catch (TrackifyException ex) {
                throw ex;
            } catch (TimeoutException | org.openqa.selenium.NoSuchElementException ex) {
                lastException = new TrackifyException(
                        ErrorCode.BAD_REQUEST,
                        400,
                        "Failed to scrape page (timeout / missing elements)",
                        Map.of("cause", ex.getMessage(), "attempt", attempt));
            } catch (Exception ex) {
                lastException = new TrackifyException(
                        ErrorCode.BAD_REQUEST,
                        400,
                        "Failed to scrape page",
                        Map.of("cause", ex.getMessage(), "attempt", attempt));
            } finally {
                scrapeDriverFactory.quitQuietly(driver);
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
                : new TrackifyException(ErrorCode.INTERNAL_SERVER_ERROR, 500, "Failed to scrape page");
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

    private void navigate(WebDriver driver, String url) {
        try {
            driver.navigate().to(url);
        } catch (Exception ex) {
            throw new TrackifyException(
                    ErrorCode.BAD_REQUEST,
                    400,
                    "Failed to fetch URL",
                    Map.of("cause", ex.getMessage()));
        }
    }

    private void waitForPageReady(WebDriver driver, WebDriverWait wait) {
        wait.until(
                webDriver -> {
                    Object readyStateObj = ((JavascriptExecutor) webDriver).executeScript("return document.readyState");
                    return readyStateObj != null && "complete".equalsIgnoreCase(String.valueOf(readyStateObj));
                });

        try {
            wait.until(ExpectedConditions.presenceOfElementLocated(By.cssSelector("meta[name='description']")));
        } catch (TimeoutException ignored) {
        }

        try {
            wait.until(ExpectedConditions.presenceOfElementLocated(By.cssSelector("meta[property='og:title']")));
        } catch (TimeoutException ignored) {
        }

        try {
            wait.until(ExpectedConditions.presenceOfElementLocated(By.cssSelector("meta[property='og:description']")));
        } catch (TimeoutException ignored) {
        }

        try {
            wait.until(ExpectedConditions.presenceOfElementLocated(By.cssSelector("link[rel='canonical']")));
        } catch (TimeoutException ignored) {
        }

        try {
            wait.until(ExpectedConditions.presenceOfElementLocated(By.cssSelector("title")));
        } catch (TimeoutException ignored) {
        }
    }

    private static String safeTrim(String s) {
        return s == null ? "" : s.trim();
    }

    private static String getMetaContent(WebDriver driver, String attrName, String attrValue) {
        String css = "meta[" + attrName + "='" + attrValue + "']";
        List<WebElement> els = driver.findElements(By.cssSelector(css));
        if (els.isEmpty()) {
            return "";
        }
        String content = els.get(0).getAttribute("content");
        return content == null ? "" : content;
    }

    private static String getLinkHref(WebDriver driver, String attrName, String attrValue) {
        String css = "link[" + attrName + "='" + attrValue + "']";
        List<WebElement> els = driver.findElements(By.cssSelector(css));
        if (els.isEmpty()) {
            return "";
        }
        String href = els.get(0).getAttribute("href");
        return href == null ? "" : href;
    }

    private static String extractCompanyLogoUrl(WebDriver driver) {
        List<WebElement> imgs = driver.findElements(By.cssSelector("img.img-responsive"));
        if (imgs == null || imgs.isEmpty()) {
            return "";
        }

        String best = "";

        for (WebElement img : imgs) {
            if (img == null) {
                continue;
            }

            String src = trimToNullAttr(img.getAttribute("src"));
            if (src == null) {
                src = trimToNullAttr(img.getAttribute("data-src"));
            }
            if (src == null) {
                src = trimToNullAttr(img.getAttribute("data-original"));
            }

            if (src == null) {
                continue;
            }

            if (src.contains("company_logos")) {
                return src;
            }

            if (best.isEmpty()) {
                best = src;
            }
        }

        return best;
    }

    private static LocalDate extractJobDeadline(WebDriver driver) {
        try {
            WebElement el = driver.findElement(By.cssSelector("div.job-detail__info--deadline-date"));
            String raw = el.getText();
            if (raw == null || raw.isBlank()) {
                return null;
            }

            String text = raw.trim();

            try {
                return LocalDate.parse(text, DEADLINE_FORMATTER);
            } catch (DateTimeParseException ignored) {
                java.util.regex.Matcher m = java.util.regex.Pattern
                        .compile("(\\d{2}/\\d{2}/\\d{4})")
                        .matcher(text);
                if (m.find()) {
                    return LocalDate.parse(m.group(1), DEADLINE_FORMATTER);
                }
                return null;
            }
        } catch (org.openqa.selenium.NoSuchElementException ignored) {
            return null;
        } catch (Exception ignored) {
            return null;
        }
    }

    private static String trimToNullAttr(String s) {
        if (s == null) {
            return null;
        }
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }
}
