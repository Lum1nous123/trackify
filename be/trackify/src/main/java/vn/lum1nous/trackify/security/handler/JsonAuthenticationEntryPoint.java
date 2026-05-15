package vn.lum1nous.trackify.security.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;
import vn.lum1nous.trackify.error.ErrorCode;
import vn.lum1nous.trackify.error.ErrorResponse;
import vn.lum1nous.trackify.error.TrackifyAuthenticationException;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

@Component
public class JsonAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    public JsonAuthenticationEntryPoint(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException) throws IOException {

        TrackifyAuthenticationException trackifyAuthException = (authException instanceof TrackifyAuthenticationException)
                ? (TrackifyAuthenticationException) authException
                : null;

        ErrorCode errorCode = trackifyAuthException != null
                ? trackifyAuthException.getErrorCode()
                : ErrorCode.UNAUTHORIZED;

        int status = trackifyAuthException != null
                ? trackifyAuthException.getHttpStatus()
                : 401;

        String message = trackifyAuthException != null
                ? trackifyAuthException.getMessage()
                : "Unauthorized";

        Map<String, Object> details = trackifyAuthException != null
                ? trackifyAuthException.getDetails()
                : Map.of();

        ErrorResponse errorResponse = ErrorResponse.of(
                status,
                errorCode,
                message,
                request.getRequestURI(),
                request.getMethod(),
                details);

        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getOutputStream(), errorResponse);
    }
}
