package vn.lum1nous.trackify.error;

import java.time.Instant;
import java.util.Map;

public class ErrorResponse {

    private final Instant timestamp;
    private final int status;
    private final String errorCode;
    private final String message;

    private final String path;
    private final String method;

    private final Map<String, Object> details;

    private ErrorResponse(
            Instant timestamp,
            int status,
            String errorCode,
            String message,
            String path,
            String method,
            Map<String, Object> details) {
        this.timestamp = timestamp;
        this.status = status;
        this.errorCode = errorCode;
        this.message = message;
        this.path = path;
        this.method = method;
        this.details = details;
    }

    public static ErrorResponse of(
            int status,
            ErrorCode errorCode,
            String message,
            String path,
            String method,
            Map<String, Object> details) {
        return new ErrorResponse(
                Instant.now(),
                status,
                errorCode.getCode(),
                message,
                path,
                method,
                details);
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public int getStatus() {
        return status;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public String getMessage() {
        return message;
    }

    public String getPath() {
        return path;
    }

    public String getMethod() {
        return method;
    }

    public Map<String, Object> getDetails() {
        return details;
    }
}
