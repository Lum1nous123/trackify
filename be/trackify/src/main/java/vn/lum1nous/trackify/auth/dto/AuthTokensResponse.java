package vn.lum1nous.trackify.auth.dto;

public class AuthTokensResponse {

    private final String accessToken;
    private final String refreshToken;

    public AuthTokensResponse(String accessToken, String refreshToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }
}
