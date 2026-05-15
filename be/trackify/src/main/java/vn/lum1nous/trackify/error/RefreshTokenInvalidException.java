package vn.lum1nous.trackify.error;

import java.util.Map;

public class RefreshTokenInvalidException extends TrackifyAuthenticationException {

    public RefreshTokenInvalidException(String message) {
        super(ErrorCode.REFRESH_TOKEN_INVALID, 401, message);
    }

    public RefreshTokenInvalidException(String message, Map<String, Object> details) {
        super(ErrorCode.REFRESH_TOKEN_INVALID, 401, message, details);
    }
}
