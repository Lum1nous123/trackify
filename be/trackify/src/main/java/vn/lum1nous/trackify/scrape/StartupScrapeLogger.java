package vn.lum1nous.trackify.scrape;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class StartupScrapeLogger implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(StartupScrapeLogger.class);

    private static final String DEFAULT_STARTUP_URL = "https://www.topcv.vn/viec-lam/truong-nhom-kinh-doanh-giam-sat-kinh-doanh-giam-sat-vung-giam-sat-khu-vuc-kenh-mt-toan-mien-bac-thu-nhap-15-30-trieu/2148486.html?ta_source=BoxFeatureJob_LinkDetail";

    private final ScrapeService scrapeService;

    public StartupScrapeLogger(ScrapeService scrapeService) {
        this.scrapeService = scrapeService;
    }

    @Override
    public void run(ApplicationArguments args) {
        String enabled = getEnv("TRACKIFY_SCRAPE_ON_STARTUP", "false");
        if (!"true".equalsIgnoreCase(enabled)) {
            log.info("Startup scrape skipped. Set TRACKIFY_SCRAPE_ON_STARTUP=true to enable.");
            return;
        }

        String url = getEnv("TRACKIFY_SCRAPE_STARTUP_URL", DEFAULT_STARTUP_URL);

        try {
            ScrapeResult result = scrapeService.scrapePage(url);

            log.info(
                    "Startup scrape result: url={}, title='{}', metaDescription='{}', ogTitle='{}', ogDescription='{}', canonical='{}', jsonLdCount={}",
                    url,
                    truncate(result.getTitle(), 180),
                    truncate(result.getMetaDescription(), 180),
                    truncate(result.getOgTitle(), 180),
                    truncate(result.getOgDescription(), 180),
                    truncate(result.getCanonicalUrl(), 180),
                    result.getJsonLdCount());

            if (result.getJsonLdSamples() != null && !result.getJsonLdSamples().isEmpty()) {
                int sampleCount = Math.min(2, result.getJsonLdSamples().size());
                for (int i = 0; i < sampleCount; i++) {
                    log.info(
                            "Startup scrape JSON-LD sample[{}]: {}",
                            i,
                            truncate(result.getJsonLdSamples().get(i), 500));
                }
            } else {
                log.info("Startup scrape JSON-LD samples: none found.");
            }
        } catch (Exception e) {
            // Không crash app: chỉ log để bạn test scrape được / không được.
            log.error("Startup scrape failed for url={}", url, e);
        }
    }

    private static String getEnv(String key, String defaultValue) {
        String sysProp = System.getProperty(key);
        String env = System.getenv(key);

        log.info("Startup scrape config {}: sysProp='{}', env='{}'", key, sysProp, env);

        if (sysProp != null && !sysProp.trim().isEmpty()) {
            return sysProp.trim();
        }

        return (env == null || env.trim().isEmpty()) ? defaultValue : env.trim();
    }

    private static String truncate(String s, int max) {
        if (s == null)
            return "";
        if (s.length() <= max)
            return s;
        return s.substring(0, max) + "...";
    }
}
