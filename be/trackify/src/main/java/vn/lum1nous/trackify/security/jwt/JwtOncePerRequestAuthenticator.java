package vn.lum1nous.trackify.security.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.util.Collections;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import vn.lum1nous.trackify.error.InvalidTokenException;
import vn.lum1nous.trackify.error.RefreshTokenInvalidException;

@Component
@Slf4j
public class JwtOncePerRequestAuthenticator extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final JwtCookieExtractor jwtCookieExtractor;
    private final JwtProperties jwtProperties;

    public JwtOncePerRequestAuthenticator(
            JwtService jwtService,
            JwtCookieExtractor jwtCookieExtractor,
            JwtProperties jwtProperties) {
        this.jwtService = jwtService;
        this.jwtCookieExtractor = jwtCookieExtractor;
        this.jwtProperties = jwtProperties;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();

        if (path == null)
            return false;

        // Những endpoint này không cần SecurityContext từ JWT filter.
        // Riêng /api/auth/me cần filter để đọc cookie và set Authentication.
        if (method == null)
            return false;

        return (path.equals("/api/auth/login")
                || path.equals("/api/auth/register")
                || path.equals("/api/auth/verify")
                || (path.equals("/api/auth/refresh") && "POST".equalsIgnoreCase(method)));
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            filterChain.doFilter(request, response);
            return;
        }

        String cookieHeader = request.getHeader(HttpHeaders.COOKIE);

        String email = resolveEmailFromCookies(cookieHeader);

        if (email != null && !email.isBlank()) {
            var authentication = new UsernamePasswordAuthenticationToken(
                    email,
                    null,
                    Collections.emptyList());
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }

    private String resolveEmailFromCookies(String cookieHeader) {
        String accessToken = jwtCookieExtractor.getCookieValue(
                cookieHeader,
                jwtProperties.getAccessCookieName());

        String refreshToken = jwtCookieExtractor.getCookieValue(
                cookieHeader,
                jwtProperties.getRefreshCookieName());

        // Ưu tiên access token nếu hợp lệ
        if (accessToken != null) {
            if (jwtService.isAccessTokenValid(accessToken)) {
                return jwtService.extractEmailFromAccessToken(accessToken);
            }

            // Access invalid -> nếu refresh hợp lệ thì dùng refresh thay vì throw luôn
            if (refreshToken != null && jwtService.isRefreshTokenValid(refreshToken)) {
                return jwtService.extractEmailFromRefreshToken(refreshToken);
            }

            // Nếu refresh có nhưng invalid thì throw refresh invalid để client clear đúng
            if (refreshToken != null && !jwtService.isRefreshTokenValid(refreshToken)) {
                throw new RefreshTokenInvalidException("Refresh token is invalid or expired");
            }

            // Còn lại: access invalid và không có refresh hợp lệ
            throw new InvalidTokenException("Access token is invalid or expired");
        }

        // Nếu không có access token -> dựa vào refresh
        if (refreshToken != null) {
            if (!jwtService.isRefreshTokenValid(refreshToken)) {
                throw new RefreshTokenInvalidException("Refresh token is invalid or expired");
            }
            return jwtService.extractEmailFromRefreshToken(refreshToken);
        }

        return null;
    }
}
