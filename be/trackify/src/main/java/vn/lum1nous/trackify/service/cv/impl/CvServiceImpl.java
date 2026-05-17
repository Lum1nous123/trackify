package vn.lum1nous.trackify.service.cv.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import vn.lum1nous.trackify.cloudinary.CloudinaryService;
import vn.lum1nous.trackify.dto.response.CvActiveResponse;
import vn.lum1nous.trackify.dto.response.CvUploadResponse;
import vn.lum1nous.trackify.entity.Cv;
import vn.lum1nous.trackify.entity.User;
import vn.lum1nous.trackify.error.ErrorCode;
import vn.lum1nous.trackify.error.TrackifyException;
import vn.lum1nous.trackify.repository.CvRepository;
import vn.lum1nous.trackify.repository.UserRepository;
import vn.lum1nous.trackify.service.cv.CvService;
import vn.lum1nous.trackify.service.cv.PdfBoxCvTextExtractor;

@Service
@RequiredArgsConstructor
@Slf4j
public class CvServiceImpl implements CvService {

    private final CvRepository cvRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;
    private final PdfBoxCvTextExtractor pdfBoxCvTextExtractor;

    @Override
    @Transactional
    public CvUploadResponse uploadCv(MultipartFile cvFile) {
        User user = getCurrentUser();

        String fileUrl = cloudinaryService.uploadCv(cvFile, user.getId());
        String rawText = pdfBoxCvTextExtractor.extractTextFromPdf(cvFile);

        cvRepository.findByUser_IdAndIsActive(user.getId(), true).ifPresent(active -> {
            active.setActive(false);
            cvRepository.save(active);
        });

        Cv saved = cvRepository.save(
                Cv.builder()
                        .user(user)
                        .fileUrl(fileUrl)
                        .rawText(rawText)
                        .isActive(true)
                        .build());

        return new CvUploadResponse(saved.getId(), saved.getFileUrl());
    }

    @Override
    public CvActiveResponse getActiveCv() {
        User user = getCurrentUser();

        return cvRepository.findByUser_IdAndIsActive(user.getId(), true)
                .map(cv -> new CvActiveResponse(
                        cv.getId(),
                        cv.getFileUrl(),
                        cv.getUploadedAt()))
                .orElse(null);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            throw new TrackifyException(ErrorCode.UNAUTHORIZED, 401, "Unauthorized");
        }

        Object principal = authentication.getPrincipal();
        String email = principal != null ? principal.toString() : null;

        if (email == null || email.isBlank()) {
            throw new TrackifyException(ErrorCode.UNAUTHORIZED, 401, "Unauthorized");
        }

        return userRepository.findByEmail(email).orElseThrow(
                () -> new TrackifyException(ErrorCode.UNAUTHORIZED, 401, "User not found"));
    }
}
