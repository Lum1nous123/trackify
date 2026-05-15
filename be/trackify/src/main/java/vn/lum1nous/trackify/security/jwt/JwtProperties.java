package vn.lum1nous.trackify.security.jwt;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "trackify.jwt")
public class JwtProperties {

  private String accessSecret;
  private String refreshSecret;

  private long accessExpirationMs;
  private long refreshExpirationMs;

  private String accessCookieName;
  private String refreshCookieName;

  private boolean cookieSecure;

  public String getAccessSecret() {
    return accessSecret;
  }

  public void setAccessSecret(String accessSecret) {
    this.accessSecret = accessSecret;
  }

  public String getRefreshSecret() {
    return refreshSecret;
  }

  public void setRefreshSecret(String refreshSecret) {
    this.refreshSecret = refreshSecret;
  }

  public long getAccessExpirationMs() {
    return accessExpirationMs;
  }

  public void setAccessExpirationMs(long accessExpirationMs) {
    this.accessExpirationMs = accessExpirationMs;
  }

  public long getRefreshExpirationMs() {
    return refreshExpirationMs;
  }

  public void setRefreshExpirationMs(long refreshExpirationMs) {
    this.refreshExpirationMs = refreshExpirationMs;
  }

  public String getAccessCookieName() {
    return accessCookieName;
  }

  public void setAccessCookieName(String accessCookieName) {
    this.accessCookieName = accessCookieName;
  }

  public String getRefreshCookieName() {
    return refreshCookieName;
  }

  public void setRefreshCookieName(String refreshCookieName) {
    this.refreshCookieName = refreshCookieName;
  }

  public boolean isCookieSecure() {
    return cookieSecure;
  }

  public void setCookieSecure(boolean cookieSecure) {
    this.cookieSecure = cookieSecure;
  }
}
