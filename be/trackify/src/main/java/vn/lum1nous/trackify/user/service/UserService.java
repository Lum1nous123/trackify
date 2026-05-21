package vn.lum1nous.trackify.user.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import vn.lum1nous.trackify.auth.dto.MeResponse;
import vn.lum1nous.trackify.cloudinary.CloudinaryService;
import vn.lum1nous.trackify.entity.User;
import vn.lum1nous.trackify.error.ErrorCode;
import vn.lum1nous.trackify.error.TrackifyException;
import vn.lum1nous.trackify.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;

    @Transactional
    public MeResponse updateMe(String fullName, MultipartFile avatarFile) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            throw new TrackifyException(ErrorCode.UNAUTHORIZED, 401, "Unauthorized");
        }

        Object principal = authentication.getPrincipal();
        String email = principal != null ? principal.toString() : null;

        if (email == null || email.isBlank()) {
            throw new TrackifyException(ErrorCode.UNAUTHORIZED, 401, "Unauthorized");
        }

        User user = userRepository.findByEmail(email).orElseThrow(
                () -> new TrackifyException(ErrorCode.UNAUTHORIZED, 401, "User not found"));

        boolean hasFullName = fullName != null;
        boolean hasAvatar = avatarFile != null && !avatarFile.isEmpty();

        if (!hasFullName && !hasAvatar) {
            throw new TrackifyException(
                    ErrorCode.BAD_REQUEST,
                    400,
                    "Nothing to update");
        }

        if (hasFullName) {
            user.setFullName(fullName);
        }

        if (hasAvatar) {
            String contentType = avatarFile.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new TrackifyException(ErrorCode.AVATAR_INVALID, 400, "Avatar must be an image");
            }

            String avatarUrl = cloudinaryService.uploadAvatar(avatarFile, user.getId());
            user.setAvatarUrl(avatarUrl);
        }

        userRepository.save(user);

        return new MeResponse(
                user.getId(),
                user.getEmail(),
                user.getUsername(),
                user.getFullName(),
                user.getAvatarUrl(),
                true);
    }
}
