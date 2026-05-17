package vn.lum1nous.trackify.cloudinary;

import com.cloudinary.Cloudinary;
import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import vn.lum1nous.trackify.error.ErrorCode;
import vn.lum1nous.trackify.error.TrackifyException;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(CloudinaryProperties properties) {
        Map<String, String> config = Map.of(
                "cloud_name", properties.getCloudName(),
                "api_key", properties.getApiKey(),
                "api_secret", properties.getApiSecret());

        this.cloudinary = new Cloudinary(config);
    }

    public String uploadAvatar(MultipartFile file, UUID userId) {
        if (file == null || file.isEmpty()) {
            throw new TrackifyException(
                    ErrorCode.AVATAR_MISSING,
                    400,
                    "Avatar file is missing");
        }

        if (file.getContentType() == null || !file.getContentType().startsWith("image/")) {
            throw new TrackifyException(
                    ErrorCode.AVATAR_INVALID,
                    400,
                    "Avatar must be an image");
        }

        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw new TrackifyException(
                    ErrorCode.AVATAR_INVALID,
                    400,
                    "Failed to read avatar file",
                    Map.of("cause", e.getMessage()));
        }

        try {
            Map<String, Object> uploadOptions = Map.of(
                    "folder", "trackify/avatars",
                    "public_id", userId.toString(),
                    "overwrite", true);

            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader()
                    .upload(bytes, uploadOptions);

            Object secureUrl = uploadResult.get("secure_url");
            if (secureUrl == null) {
                throw new TrackifyException(
                        ErrorCode.CLOUDINARY_UPLOAD_FAILED,
                        502,
                        "Cloudinary did not return secure_url");
            }

            return secureUrl.toString();
        } catch (TrackifyException e) {
            throw e;
        } catch (Exception e) {
            throw new TrackifyException(
                    ErrorCode.CLOUDINARY_UPLOAD_FAILED,
                    502,
                    "Cloudinary upload failed",
                    Map.of("cause", e.getMessage()));
        }
    }

    public String uploadCv(MultipartFile file, UUID userId) {
        if (file == null || file.isEmpty()) {
            throw new TrackifyException(
                    ErrorCode.CV_MISSING,
                    400,
                    "CV file is missing");
        }

        // Validate PDF
        String contentType = file.getContentType();
        if (contentType == null || !contentType.equals("application/pdf")) {
            throw new TrackifyException(
                    ErrorCode.CV_INVALID,
                    400,
                    "CV must be a PDF file");
        }

        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw new TrackifyException(
                    ErrorCode.CV_INVALID,
                    400,
                    "Failed to read CV file",
                    Map.of("cause", e.getMessage()));
        }

        try {
            Map<String, Object> uploadOptions = Map.of(
                    "folder", "trackify/cvs",
                    "public_id", userId.toString() + "_" + System.currentTimeMillis(),

                    // Khác với avatar: không overwrite vì user có thể có nhiều CV
                    "resource_type", "raw" // <-- quan trọng! PDF phải dùng raw
            );

            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader()
                    .upload(bytes, uploadOptions);

            Object secureUrl = uploadResult.get("secure_url");
            if (secureUrl == null) {
                throw new TrackifyException(
                        ErrorCode.CLOUDINARY_UPLOAD_FAILED,
                        502,
                        "Cloudinary did not return secure_url");
            }
            return secureUrl.toString();

        } catch (TrackifyException e) {
            throw e;
        } catch (Exception e) {
            throw new TrackifyException(
                    ErrorCode.CLOUDINARY_UPLOAD_FAILED,
                    502,
                    "Cloudinary upload failed",
                    Map.of("cause", e.getMessage()));
        }
    }
}
