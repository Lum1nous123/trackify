package vn.lum1nous.trackify.scrape;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "trackify.scrape")
public class ScrapeProperties {

    /**
     * Timeout cho phần "load" trang.
     */
    private int pageLoadTimeoutSeconds = 15;

    /**
     * Timeout chờ các element cần thiết (title/meta/json-ld).
     */
    private int waitTimeoutSeconds = 10;

    /**
     * Retry khi gặp lỗi transient (timeout, selenium error).
     */
    private int retryCount = 1;

    /**
     * Delay giữa các lần retry (ms).
     */
    private long retryDelayMs = 500;

    /**
     * Dùng headless Chrome.
     */
    private boolean headless = true;

    /**
     * User-Agent giả lập cho browser.
     */
    private String userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

    public int getPageLoadTimeoutSeconds() {
        return pageLoadTimeoutSeconds;
    }

    public void setPageLoadTimeoutSeconds(int pageLoadTimeoutSeconds) {
        this.pageLoadTimeoutSeconds = pageLoadTimeoutSeconds;
    }

    public int getWaitTimeoutSeconds() {
        return waitTimeoutSeconds;
    }

    public void setWaitTimeoutSeconds(int waitTimeoutSeconds) {
        this.waitTimeoutSeconds = waitTimeoutSeconds;
    }

    public int getRetryCount() {
        return retryCount;
    }

    public void setRetryCount(int retryCount) {
        this.retryCount = retryCount;
    }

    public long getRetryDelayMs() {
        return retryDelayMs;
    }

    public void setRetryDelayMs(long retryDelayMs) {
        this.retryDelayMs = retryDelayMs;
    }

    public boolean isHeadless() {
        return headless;
    }

    public void setHeadless(boolean headless) {
        this.headless = headless;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }
}
