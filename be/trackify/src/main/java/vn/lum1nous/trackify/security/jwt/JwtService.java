package vn.lum1nous.trackify.security.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.DecodingException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import org.springframework.stereotype.Service;
import vn.lum1nous.trackify.error.ErrorCode;
import vn.lum1nous.trackify.error.TrackifyException;

@Service
public class JwtService {

    private final JwtProperties jwtProperties;

    public JwtService(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
    }

    public String generateAccessToken(String email) {
        return generateToken(
                email,
                jwtProperties.getAccessSecret(),
                jwtProperties.getAccessExpirationMs());
    }

    public String generateRefreshToken(String email) {
        return generateToken(
                email,
                jwtProperties.getRefreshSecret(),
                jwtProperties.getRefreshExpirationMs());
    }

    public boolean isAccessTokenValid(String token) {
        return isTokenValid(token, jwtProperties.getAccessSecret());
    }

    public boolean isRefreshTokenValid(String token) {
        return isTokenValid(token, jwtProperties.getRefreshSecret());
    }

    public String extractEmailFromAccessToken(String token) {
        return extractEmail(token, jwtProperties.getAccessSecret());
    }

    public String extractEmailFromRefreshToken(String token) {
        return extractEmail(token, jwtProperties.getRefreshSecret());
    }

    private boolean isTokenValid(String token, String secret) {
        try {
            extractAllClaims(token, secret);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private String extractEmail(String token, String secret) {
        Claims claims = extractAllClaims(token, secret);
        return claims.getSubject();
    }

    private Claims extractAllClaims(String token, String secret) {
        Key key = getHmacKey(secret);
        return Jwts.parser()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private String generateToken(String email, String secret, long expirationMs) {
        Key key = getHmacKey(secret);
        Date now = new Date();
        Date expiresAt = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(now)
                .setExpiration(expiresAt)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    private Key getHmacKey(String secret) {
        if (secret == null || secret.isBlank()) {
            throw new TrackifyException(
                    ErrorCode.INTERNAL_SERVER_ERROR,
                    500,
                    "JWT secret is not configured (empty). Please set TRACKIFY_JWT_ACCESS_SECRET and TRACKIFY_JWT_REFRESH_SECRET with a secure value (>= 256 bits).");
        }

        // Accept either:
        // - base64 / base64url secret
        // - raw string secret
        byte[] keyBytes;
        try {
            // Most JWT libraries generate base64url strings (contain '-'/'_')
            keyBytes = Decoders.BASE64URL.decode(secret);
        } catch (DecodingException e) {
            try {
                keyBytes = Decoders.BASE64.decode(secret);
            } catch (DecodingException ignored) {
                keyBytes = secret.getBytes(StandardCharsets.UTF_8);
            }
        }

        int bits = keyBytes.length * 8;
        if (bits < 256) {
            throw new TrackifyException(
                    ErrorCode.INTERNAL_SERVER_ERROR,
                    500,
                    "JWT secret is too short (" + bits
                            + " bits). Keys for HS256 must be >= 256 bits. Check TRACKIFY_JWT_ACCESS_SECRET / TRACKIFY_JWT_REFRESH_SECRET.");
        }

        try {
            return Keys.hmacShaKeyFor(keyBytes);
        } catch (IllegalArgumentException e) {
            throw new TrackifyException(
                    ErrorCode.INTERNAL_SERVER_ERROR,
                    500,
                    "JWT secret is invalid or too short for HS256. Check TRACKIFY_JWT_ACCESS_SECRET / TRACKIFY_JWT_REFRESH_SECRET.");
        }
    }
}
