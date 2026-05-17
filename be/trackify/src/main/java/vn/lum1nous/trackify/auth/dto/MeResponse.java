package vn.lum1nous.trackify.auth.dto;

import java.util.UUID;

public class MeResponse {

    private final UUID id;
    private final String email;
    private final String username;
    private final String fullName;
    private final String avatarUrl;

    public MeResponse(
            UUID id,
            String email,
            String username,
            String fullName,
            String avatarUrl) {
        this.id = id;
        this.email = email;
        this.username = username;
        this.fullName = fullName;
        this.avatarUrl = avatarUrl;
    }

    public UUID getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getUsername() {
        return username;
    }

    public String getFullName() {
        return fullName;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }
}
