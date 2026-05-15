package vn.lum1nous.trackify.scrape;

import java.io.IOException;
import java.time.Duration;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.stereotype.Service;
import vn.lum1nous.trackify.error.ErrorCode;
import vn.lum1nous.trackify.error.TrackifyException;

@Service
public class ScrapeService {

    // Keep small + configurable later
    private static final Duration DEFAULT_TIMEOUT = Duration.ofSeconds(10);
    private static final String DEFAULT_USER_AGENT = "Mozilla/5.0 (compatible; JobTrackrBot/1.0; +https://example.com)";

    /**
     * Scrape sơ bộ: lấy <title> của trang từ URL.
     * Chưa dùng backend persistence — chỉ phục vụ UI/logic sau này.
     */
    public String scrapePageTitle(String url) {
        if (url == null || url.trim().isEmpty()) {
            throw new TrackifyException(
                    ErrorCode.BAD_REQUEST,
                    400,
                    "URL is required");
        }

        String trimmed = url.trim();

        try {
            Document doc = Jsoup
                    .connect(trimmed)
                    .userAgent(DEFAULT_USER_AGENT)
                    .timeout((int) DEFAULT_TIMEOUT.toMillis())
                    .get();

            String title = doc.title();
            if (title == null || title.trim().isEmpty()) {
                return "";
            }

            return title.trim();
        } catch (IllegalArgumentException e) {
            // Jsoup throws IllegalArgumentException for malformed URL
            throw new TrackifyException(
                    ErrorCode.BAD_REQUEST,
                    400,
                    "Invalid URL",
                    java.util.Map.of("cause", e.getMessage()));
        } catch (IOException e) {
            throw new TrackifyException(
                    ErrorCode.INTERNAL_SERVER_ERROR,
                    502,
                    "Failed to fetch URL",
                    java.util.Map.of("cause", e.getMessage()));
        }
    }
}
