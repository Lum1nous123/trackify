package vn.lum1nous.trackify.error;

import java.time.Instant;
import java.util.Map;

public final class ApiResponse<T> {

    private final Instant timestamp;
    private final int status;

    private final boolean success;

    private final String errorCode;
    private final String message;

    private final String path;
    private final String method;

    private final Map<String, Object> details;
    private final T data;

    private ApiResponse(
            Instant timestamp,
            int status,
            boolean success,
            String errorCode,
            String message,
            String path,
            String method,
            Map<String, Object> details,
            T data) {
        this.timestamp = timestamp;
        this.status = status;
        this.success = success;
        this.errorCode = errorCode;
        this.message = message;
        this.path = path;
        this.method = method;
        this.details = details;
        this.data = data;
    }

    public static <T> ApiResponse<T> success(int status, T data) {
        return new ApiResponse<>(
                Instant.now(),
                status,
                true,
                null,
                null,
                null,
                null,
                Map.of(),
                data);
    }

    public static <T> ApiResponse<T> error(
            int status,
            ErrorCode errorCode,
            String message,
            String path,
            String method,
            Map<String, Object> details) {
        return new ApiResponse<>(
                Instant.now(),
                status,
                false,
                errorCode != null ? errorCode.getCode() : null,
                message,
                path,
                method,
                details != null ? details : Map.of(),
                null);
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public int getStatus() {
        return status;
    }

    public boolean isSuccess() {
        return success;
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

    public T getData() {
        return data;
    }
}
