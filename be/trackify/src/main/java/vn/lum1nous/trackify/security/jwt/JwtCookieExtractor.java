package vn.lum1nous.trackify.security.jwt;

import java.util.Objects;
import org.springframework.stereotype.Component;

@Component
public class JwtCookieExtractor {

    public String getCookieValue(String cookieHeader, String cookieName) {
        if (cookieHeader == null || cookieHeader.isBlank() || cookieName == null || cookieName.isBlank()) {
            return null;
        }

        String[] parts = cookieHeader.split(";");
        for (String part : parts) {
            String trimmed = part.trim();
            if (trimmed.isEmpty()) {
                continue;
            }

            if (trimmed.startsWith(cookieName + "=")) {
                String value = trimmed.substring((cookieName + "=").length()).trim();
                return stripQuotes(value);
            }
        }

        return null;
    }

    private String stripQuotes(String value) {
        if (value == null) {
            return null;
        }
        String v = value.trim();
        if (v.length() >= 2 && v.startsWith("\"") && v.endsWith("\"")) {
            return v.substring(1, v.length() - 1);
        }
        return Objects.toString(v, null);
    }
}
