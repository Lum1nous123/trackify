package vn.lum1nous.trackify.auth.service;

import java.security.SecureRandom;
import java.time.Instant;
import vn.lum1nous.trackify.auth.dto.AuthTokensResponse;
import vn.lum1nous.trackify.auth.dto.LoginRequest;
import vn.lum1nous.trackify.auth.dto.RegisterRequest;
import vn.lum1nous.trackify.auth.dto.VerifyRequest;
import vn.lum1nous.trackify.auth.dto.MeResponse;
import vn.lum1nous.trackify.error.ErrorCode;
import vn.lum1nous.trackify.error.RefreshTokenInvalidException;
import vn.lum1nous.trackify.error.TrackifyException;
import vn.lum1nous.trackify.entity.User;
import vn.lum1nous.trackify.repository.UserRepository;
import vn.lum1nous.trackify.security.jwt.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthService {

    private static final int VERIFICATION_CODE_LENGTH = 6;
    private static final long VERIFICATION_CODE_TTL_SECONDS = 10 * 60;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JavaMailSender javaMailSender;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthTokensResponse register(RegisterRequest request) {
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            throw new TrackifyException(ErrorCode.EMAIL_ALREADY_EXISTS, 409, "Email already exists");
        });

        userRepository.findByUsername(request.getUsername()).ifPresent(user -> {
            throw new TrackifyException(ErrorCode.USERNAME_ALREADY_EXISTS, 409, "Username already exists");
        });

        String verificationCode = generateVerificationCode();

        // Không log verification code ra console/log để tránh rò rỉ thông tin nhạy cảm.
        log.debug("Generated email verification code for {}", request.getEmail());

        // Send verification email synchronously so we can fail fast and NOT issue
        // tokens.
        String targetEmail = request.getEmail();
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(targetEmail);
        message.setSubject("[Trackify] Verify your email");

        long ttlMinutes = VERIFICATION_CODE_TTL_SECONDS / 60;
        message.setText(
                "Hi,\n\n"
                        + "Your Trackify verification code is: " + verificationCode + "\n"
                        + "This code expires in " + ttlMinutes + " minutes.\n\n"
                        + "Enter the code in the app to verify your account.\n\n"
                        + "— Trackify");

        try {
            javaMailSender.send(message);
            log.info("Verification email sent to {}", targetEmail);
        } catch (Exception ex) {
            log.warn("Failed to send email verification code to {}", targetEmail, ex);
            throw new TrackifyException(
                    ErrorCode.INTERNAL_SERVER_ERROR,
                    500,
                    "Failed to send verification email");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setUsername(request.getUsername());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setEmailVerified(false);

        user.setEmailVerificationCode(verificationCode);
        user.setEmailVerificationExpiresAt(
                Instant.now().plusSeconds(VERIFICATION_CODE_TTL_SECONDS));

        userRepository.save(user);

        // Register requires email verification before the user can use the account.
        // We intentionally do NOT issue JWT tokens here.
        // Frontend will redirect to /verify-email and only set cookies after
        // /verify-email succeeds.
        return new AuthTokensResponse(null, null);
    }

    public AuthTokensResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow(
                () -> new TrackifyException(
                        ErrorCode.INVALID_CREDENTIALS,
                        401,
                        "Invalid email or password"));

        boolean matches = passwordEncoder.matches(request.getPassword(), user.getPasswordHash());
        if (!matches) {
            throw new TrackifyException(ErrorCode.INVALID_CREDENTIALS, 401, "Invalid email or password");
        }

        String accessToken = jwtService.generateAccessToken(user.getEmail());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());
        return new AuthTokensResponse(accessToken, refreshToken);
    }

    public AuthTokensResponse verify(VerifyRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow(
                () -> new TrackifyException(
                        ErrorCode.VERIFICATION_CODE_INVALID,
                        401,
                        "Invalid verification request"));

        String expectedCode = user.getEmailVerificationCode();
        Instant expiresAt = user.getEmailVerificationExpiresAt();

        if (expectedCode == null || expiresAt == null) {
            throw new TrackifyException(ErrorCode.VERIFICATION_CODE_INVALID, 401, "Invalid verification code");
        }

        if (Instant.now().isAfter(expiresAt)) {
            throw new TrackifyException(ErrorCode.VERIFICATION_CODE_EXPIRED, 401, "Verification code expired");
        }

        if (!expectedCode.equals(request.getCode())) {
            throw new TrackifyException(ErrorCode.VERIFICATION_CODE_INVALID, 401, "Invalid verification code");
        }

        user.setEmailVerified(true);
        user.setEmailVerificationCode(null);
        user.setEmailVerificationExpiresAt(null);

        userRepository.save(user);

        String accessToken = jwtService.generateAccessToken(user.getEmail());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());
        return new AuthTokensResponse(accessToken, refreshToken);
    }

    public AuthTokensResponse refreshToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new RefreshTokenInvalidException("Refresh token is missing");
        }

        if (!jwtService.isRefreshTokenValid(refreshToken)) {
            throw new RefreshTokenInvalidException("Refresh token is invalid or expired");
        }

        String email = jwtService.extractEmailFromRefreshToken(refreshToken);

        // Optional: ensure user still exists (prevents refreshing for deleted accounts)
        userRepository.findByEmail(email).orElseThrow(
                () -> new TrackifyException(ErrorCode.UNAUTHORIZED, 401, "User not found"));

        String newAccessToken = jwtService.generateAccessToken(email);
        String newRefreshToken = jwtService.generateRefreshToken(email);
        return new AuthTokensResponse(newAccessToken, newRefreshToken);
    }

    public MeResponse me(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(
                () -> new TrackifyException(ErrorCode.UNAUTHORIZED, 401, "User not found"));

        return new MeResponse(
                user.getId(),
                user.getEmail(),
                user.getUsername(),
                user.getFullName(),
                user.getAvatarUrl(),
                user.isEmailVerified());
    }

    private String generateVerificationCode() {
        // 6 digits, left padded with zeros
        int bound = (int) Math.pow(10, VERIFICATION_CODE_LENGTH);
        int number = secureRandom.nextInt(bound);
        return String.format("%0" + VERIFICATION_CODE_LENGTH + "d", number);
    }
}
