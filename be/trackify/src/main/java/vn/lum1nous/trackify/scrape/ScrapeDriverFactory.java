package vn.lum1nous.trackify.scrape;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.springframework.stereotype.Component;
import org.openqa.selenium.support.ui.WebDriverWait;
import io.github.bonigarcia.wdm.WebDriverManager;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class ScrapeDriverFactory {

    private final ScrapeProperties scrapeProperties;

    @PostConstruct
    public void initDriverManager() {
        log.info("INIT WEB DRIVER MANAGER");
        WebDriverManager.chromedriver().setup();
    }

    public WebDriver createDriver() {
        ChromeOptions options = new ChromeOptions();

        if (scrapeProperties.isHeadless()) {
            // new headless mode for newer chrome
            options.addArguments("--headless=new");
        }

        options.addArguments(
                "--no-sandbox",
                "--disable-dev-shm-usage", // fix typo: "devm" -> "dev"
                "--disable-gpu",
                "--disable-infobars",
                "--disable-extensions",
                "--disable-background-networking",
                "--disable-default-apps",
                "--disable-sync",
                "--disable-translate",
                "--hide-scrollbars",
                "--metrics-recording-only",
                "--mute-audio",
                "--no-first-run",
                "--safebrowsing-disable-auto-update");

        Map<String, Object> prefs = new HashMap<>();
        prefs.put("profile.managed_default_content_settings.images", 2);
        prefs.put("profile.managed_default_content_settings.stylesheets", 2);
        prefs.put("profile.managed_default_content_settings.fonts", 2);
        prefs.put("profile.managed_default_content_settings.media_stream", 2);
        options.setExperimentalOption("prefs", prefs);

        if (scrapeProperties.getUserAgent() != null && !scrapeProperties.getUserAgent().isBlank()) {
            options.addArguments("--user-agent=" + scrapeProperties.getUserAgent().trim());
        }

        WebDriver driver = new ChromeDriver(options);

        Duration pageLoadTimeout = Duration.ofSeconds(Math.max(1, scrapeProperties.getPageLoadTimeoutSeconds()));
        driver.manage().timeouts().pageLoadTimeout(pageLoadTimeout);

        // implicit wait giữ nhỏ để tránh làm chậm test; chờ element dùng WebDriverWait
        // ở service/extractor
        driver.manage().timeouts().implicitlyWait(Duration.ofMillis(0));

        return driver;
    }

    public void quitQuietly(WebDriver driver) {
        if (driver == null) {
            return;
        }
        try {
            driver.quit();
        } catch (Exception ignored) {
            // ignore
        }
    }

    public WebDriverWait newWait(WebDriver driver) {
        Duration waitTimeout = Duration.ofSeconds(Math.max(1, scrapeProperties.getWaitTimeoutSeconds()));
        return new WebDriverWait(driver, waitTimeout);
    }
}
