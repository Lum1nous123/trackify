package vn.lum1nous.trackify.auth.dto;

public class MeResponse {

    private final String email;
    private final String username;
    private final String fullName;
    private final String avatarUrl;

    public MeResponse(String email, String username, String fullName, String avatarUrl) {
        this.email = email;
        this.username = username;
        this.fullName = fullName;
        this.avatarUrl = avatarUrl;
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
