package vn.lum1nous.trackify.error;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(TrackifyException.class)
        public ResponseEntity<ErrorResponse> handleTrackifyException(
                        TrackifyException ex,
                        HttpServletRequest request) {
                ErrorResponse errorResponse = ErrorResponse.of(
                                ex.getHttpStatus(),
                                ex.getErrorCode(),
                                ex.getMessage() != null ? ex.getMessage() : ex.getErrorCode().getCode(),
                                request.getRequestURI(),
                                request.getMethod(),
                                ex.getDetails());

                return new ResponseEntity<>(errorResponse, HttpStatus.valueOf(ex.getHttpStatus()));
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ErrorResponse> handleValidationException(
                        MethodArgumentNotValidException ex,
                        HttpServletRequest request) {
                Map<String, Object> details = Map.of(
                                "validationErrors", ex.getBindingResult().getAllErrors().stream()
                                                .map(e -> e.getDefaultMessage())
                                                .filter(m -> m != null && !m.isBlank())
                                                .toList());

                ErrorResponse errorResponse = ErrorResponse.of(
                                400,
                                ErrorCode.BAD_REQUEST,
                                "Validation failed",
                                request.getRequestURI(),
                                request.getMethod(),
                                details);

                return ResponseEntity.badRequest().body(errorResponse);
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ErrorResponse> handleGenericException(
                        Exception ex,
                        HttpServletRequest request) {
                ErrorResponse errorResponse = ErrorResponse.of(
                                500,
                                ErrorCode.INTERNAL_SERVER_ERROR,
                                ex.getMessage() != null ? ex.getMessage() : "Internal server error",
                                request.getRequestURI(),
                                request.getMethod(),
                                Map.of());

                return ResponseEntity.status(500).body(errorResponse);
        }
}
