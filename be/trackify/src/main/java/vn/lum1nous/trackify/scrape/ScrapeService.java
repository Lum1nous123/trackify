package vn.lum1nous.trackify.scrape;

import java.net.URI;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.lum1nous.trackify.error.ErrorCode;
import vn.lum1nous.trackify.error.TrackifyException;
import vn.lum1nous.trackify.scrape.strategy.ScrapeStrategyFactory;

@Service
@RequiredArgsConstructor
public class ScrapeService {

    private final ScrapeStrategyFactory strategyFactory;

    /**
     * Scrape sơ bộ: validate URL rồi delegate sang strategy theo từng job site.
     */
    public ScrapeResult scrapePage(String url) {
        String trimmed = validateUrl(url);
        return strategyFactory.getStrategy(trimmed).scrape(trimmed);
    }

    public String scrapePageTitle(String url) {
        return scrapePage(url).getTitle();
    }

    private static String validateUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            throw new TrackifyException(ErrorCode.BAD_REQUEST, 400, "URL is required");
        }

        String trimmed = url.trim();

        try {
            URI uri = URI.create(trimmed);
            if (uri.getScheme() == null || uri.getHost() == null) {
                throw new TrackifyException(
                        ErrorCode.BAD_REQUEST,
                        400,
                        "Invalid URL",
                        java.util.Map.of("cause", "Missing scheme/host"));
            }
        } catch (IllegalArgumentException ex) {
            throw new TrackifyException(ErrorCode.BAD_REQUEST, 400, "Invalid URL",
                    java.util.Map.of("cause", ex.getMessage()));
        }

        return trimmed;
    }
}
