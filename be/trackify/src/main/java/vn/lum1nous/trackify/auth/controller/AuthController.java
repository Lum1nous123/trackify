package vn.lum1nous.trackify.auth.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import vn.lum1nous.trackify.auth.dto.AuthTokensResponse;
import vn.lum1nous.trackify.auth.dto.LoginRequest;
import vn.lum1nous.trackify.auth.dto.MeResponse;
import vn.lum1nous.trackify.auth.dto.RegisterRequest;
import vn.lum1nous.trackify.auth.dto.VerifyRequest;
import vn.lum1nous.trackify.auth.service.AuthService;
import vn.lum1nous.trackify.error.ApiResponse;
import vn.lum1nous.trackify.error.ErrorCode;
import vn.lum1nous.trackify.error.TrackifyException;
import vn.lum1nous.trackify.security.jwt.JwtCookieExtractor;
import vn.lum1nous.trackify.security.jwt.JwtProperties;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Validated
public class AuthController {

    private final AuthService authService;
    private final JwtCookieExtractor jwtCookieExtractor;
    private final JwtProperties jwtProperties;

    public AuthController(
            AuthService authService,
            JwtCookieExtractor jwtCookieExtractor,
            JwtProperties jwtProperties) {
        this.authService = authService;
        this.jwtCookieExtractor = jwtCookieExtractor;
        this.jwtProperties = jwtProperties;
    }

    @PostMapping("/register")
    public ApiResponse<AuthTokensResponse> register(
            @Valid @RequestBody RegisterRequest request) {
        return ApiResponse.success(200, authService.register(request));
    }

    @PostMapping("/login")
    public ApiResponse<AuthTokensResponse> login(
            @Valid @RequestBody LoginRequest request) {
        return ApiResponse.success(200, authService.login(request));
    }

    @PostMapping("/verify")
    public ApiResponse<AuthTokensResponse> verify(
            @Valid @RequestBody VerifyRequest request) {
        return ApiResponse.success(200, authService.verify(request));
    }

    @PostMapping("/verify-email")
    public ApiResponse<AuthTokensResponse> verifyEmail(
            @Valid @RequestBody VerifyRequest request) {
        return ApiResponse.success(200, authService.verify(request));
    }

    @PostMapping("/refresh")
    public ApiResponse<AuthTokensResponse> refresh(HttpServletRequest request) {
        String cookieHeader = request.getHeader("Cookie");

        String refreshToken = jwtCookieExtractor.getCookieValue(
                cookieHeader,
                jwtProperties.getRefreshCookieName());

        return ApiResponse.success(200, authService.refreshToken(refreshToken));
    }

    @GetMapping("/me")
    public ApiResponse<MeResponse> me() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            throw new TrackifyException(ErrorCode.UNAUTHORIZED, 401, "Unauthorized");
        }

        Object principal = authentication.getPrincipal();
        String email = principal != null ? principal.toString() : null;

        if (email == null || email.isBlank()) {
            throw new TrackifyException(ErrorCode.UNAUTHORIZED, 401, "Unauthorized");
        }

        return ApiResponse.success(200, authService.me(email));
    }
}
