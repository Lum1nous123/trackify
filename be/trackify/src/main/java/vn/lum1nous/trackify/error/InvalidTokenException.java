package vn.lum1nous.trackify.error;

import java.util.Map;

public class InvalidTokenException extends TrackifyAuthenticationException {

    public InvalidTokenException(String message) {
        super(ErrorCode.INVALID_TOKEN, 401, message);
    }

    public InvalidTokenException(String message, Map<String, Object> details) {
        super(ErrorCode.INVALID_TOKEN, 401, message, details);
    }
}
