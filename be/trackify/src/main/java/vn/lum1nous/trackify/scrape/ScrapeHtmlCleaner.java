package vn.lum1nous.trackify.scrape;

import org.apache.commons.text.StringEscapeUtils;
import org.springframework.stereotype.Component;

@Component
public class ScrapeHtmlCleaner {

    /**
     * Strip tags cơ bản bằng regex (không dùng jsoup).
     * Lưu ý: đây là best-effort cho mô tả job, không nhằm render HTML chính xác.
     */
    public String cleanAndUnescape(String html) {
        if (html == null || html.isBlank()) {
            return "";
        }

        // remove tags
        String text = html.replaceAll("&nbsp;", " ");
        text = text.replaceAll("<[^>]+>", " ");

        text = text.replaceAll("\\s+", " ").trim();

        // unescape html entities
        try {
            text = StringEscapeUtils.unescapeHtml4(text);
        } catch (Exception ignored) {
            // best-effort
        }

        return text;
    }

    private ScrapeHtmlCleaner() {
    }
}
