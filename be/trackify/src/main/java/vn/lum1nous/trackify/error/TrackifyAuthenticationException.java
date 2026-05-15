package vn.lum1nous.trackify.error;

import java.util.Collections;
import java.util.Map;
import org.springframework.security.core.AuthenticationException;

public class TrackifyAuthenticationException extends AuthenticationException {

    private final ErrorCode errorCode;
    private final int httpStatus;
    private final Map<String, Object> details;

    public TrackifyAuthenticationException(
            ErrorCode errorCode,
            int httpStatus,
            String message) {
        this(errorCode, httpStatus, message, Collections.emptyMap());
    }

    public TrackifyAuthenticationException(
            ErrorCode errorCode,
            int httpStatus,
            String message,
            Map<String, Object> details) {
        super(message);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
        this.details = details == null ? Collections.emptyMap() : details;
    }

    public ErrorCode getErrorCode() {
        return errorCode;
    }

    public int getHttpStatus() {
        return httpStatus;
    }

    public Map<String, Object> getDetails() {
        return details;
    }
}
