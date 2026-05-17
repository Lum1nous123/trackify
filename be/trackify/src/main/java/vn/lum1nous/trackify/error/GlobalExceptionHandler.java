package vn.lum1nous.trackify.error;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Map;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(TrackifyException.class)
        public ApiResponse<Void> handleTrackifyException(
                        TrackifyException ex,
                        HttpServletRequest request,
                        HttpServletResponse response) {

                response.setStatus(ex.getHttpStatus());

                return ApiResponse.error(
                                ex.getHttpStatus(),
                                ex.getErrorCode(),
                                ex.getMessage() != null ? ex.getMessage() : ex.getErrorCode().getCode(),
                                request.getRequestURI(),
                                request.getMethod(),
                                ex.getDetails());
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ApiResponse<Void> handleValidationException(
                        MethodArgumentNotValidException ex,
                        HttpServletRequest request,
                        HttpServletResponse response) {

                Map<String, Object> details = Map.of(
                                "validationErrors",
                                ex.getBindingResult().getAllErrors().stream()
                                                .map(e -> e.getDefaultMessage())
                                                .filter(m -> m != null && !m.isBlank())
                                                .toList());

                response.setStatus(400);

                return ApiResponse.error(
                                400,
                                ErrorCode.BAD_REQUEST,
                                "Validation failed",
                                request.getRequestURI(),
                                request.getMethod(),
                                details);
        }

        @ExceptionHandler(Exception.class)
        public ApiResponse<Void> handleGenericException(
                        Exception ex,
                        HttpServletRequest request,
                        HttpServletResponse response) {

                response.setStatus(500);

                return ApiResponse.error(
                                500,
                                ErrorCode.INTERNAL_SERVER_ERROR,
                                ex.getMessage() != null ? ex.getMessage() : "Internal server error",
                                request.getRequestURI(),
                                request.getMethod(),
                                Map.of());
        }
}
