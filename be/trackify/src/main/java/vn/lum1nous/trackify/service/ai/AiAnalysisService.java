package vn.lum1nous.trackify.service.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import vn.lum1nous.trackify.dto.response.AiAnalysisResponse;
import vn.lum1nous.trackify.entity.AiAnalysis;
import vn.lum1nous.trackify.entity.Cv;
import vn.lum1nous.trackify.entity.Job;
import vn.lum1nous.trackify.error.ErrorCode;
import vn.lum1nous.trackify.error.TrackifyException;
import vn.lum1nous.trackify.repository.AiAnalysisRepository;
import vn.lum1nous.trackify.repository.CvRepository;
import vn.lum1nous.trackify.repository.JobRepository;
import vn.lum1nous.trackify.repository.UserRepository;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiAnalysisService {

    private static final int MAX_JD_CHARS = 6000;
    private static final int MAX_CV_CHARS = 15000;

    private final JobRepository jobRepository;
    private final CvRepository cvRepository;
    private final AiAnalysisRepository aiAnalysisRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final ChatClient.Builder chatClientBuilder;

    public AiAnalysisResponse analyzeJobCv(UUID jobId, UUID cvId) {
        if (jobId == null) {
            throw new TrackifyException(ErrorCode.BAD_REQUEST, 400, "jobId is required");
        }
        if (cvId == null) {
            throw new TrackifyException(ErrorCode.BAD_REQUEST, 400, "cvId is required");
        }

        var currentUser = getCurrentUser();
        Job job = jobRepository.findById(jobId).orElseThrow(
                () -> new TrackifyException(ErrorCode.NOT_FOUND, 404, "Job not found"));

        if (job.getUser() == null || !Objects.equals(job.getUser().getId(), currentUser.getId())) {
            throw new TrackifyException(ErrorCode.FORBIDDEN, 403, "Forbidden");
        }

        Cv cv = cvRepository.findByIdAndUser_Id(cvId, currentUser.getId()).orElseThrow(
                () -> new TrackifyException(ErrorCode.NOT_FOUND, 404, "CV not found"));

        String cacheKey = buildCacheKey(jobId, cvId);
        AiAnalysis existing = aiAnalysisRepository.findByCacheKey(cacheKey).orElse(null);
        if (existing != null) {
            return toResponse(existing);
        }

        String jdText = trimToNull(job.getJdText());
        if (jdText == null) {
            throw new TrackifyException(ErrorCode.BAD_REQUEST, 400, "Job.jdText is required");
        }

        String cvText = trimToNull(cv.getRawText());
        if (cvText == null) {
            throw new TrackifyException(ErrorCode.BAD_REQUEST, 400, "CV.rawText is required");
        }

        String limitedJdText = limitChars(jdText, MAX_JD_CHARS);
        String limitedCvText = limitChars(cvText, MAX_CV_CHARS);

        AiAnalysisJson result = callGemini(limitedJdText, limitedCvText);

        log.info("AI result: matchScore={} | missingSkills={} | suggestedKeywords={} | summary={}",
                result.matchScore(),
                result.missingSkills(),
                result.suggestedKeywords(),
                result.summary());

        log.info("Converted: missingSkills={} | suggestedKeywords={}",
                toJsonArrayString(result.missingSkills()),
                toJsonArrayString(result.suggestedKeywords()));

        AiAnalysis analysis = AiAnalysis.builder()
                .job(job)
                .cv(cv)
                .matchScore(sanitizeMatchScore(result.matchScore()))
                .missingSkills(toJsonArrayString(result.missingSkills()))
                .suggestedKeywords(toJsonArrayString(result.suggestedKeywords()))
                .summary(result.summary())
                .cacheKey(cacheKey)
                .build();

        AiAnalysis saved = aiAnalysisRepository.save(analysis);
        return toResponse(saved);
    }

    private AiAnalysisJson callGemini(String jdText, String cvText) {
        String prompt = """
                You are a recruitment analyst. Analyze the match between this CV and the Job Description.

                === CV ===
                %s

                === JOB DESCRIPTION ===
                %s

                Return ONLY a valid JSON object, no explanation, no markdown, no extra text.
                Exact structure:
                {
                  "matchScore": <integer 0-100>,
                  "missingSkills": [<max 5 short strings>],
                  "suggestedKeywords": [<max 5 short strings>],
                  "summary": "<max 80 words, Vietnamese>"
                }
                """.formatted(cvText, jdText);

        try {
            String content = chatClientBuilder.build()
                    .prompt()
                    .system("Bạn là trợ lý phân tích tuyển dụng cho ứng dụng Trackify.")
                    .user(prompt)
                    .call()
                    .content();

            if (content == null || content.isBlank()) {
                throw new TrackifyException(ErrorCode.INTERNAL_SERVER_ERROR, 500, "AI returned empty content");
            }

            // Clean markdown fence nếu Gemini vẫn trả về
            String cleaned = content
                    .replaceAll("(?s)```json\\s*", "")
                    .replaceAll("(?s)```\\s*", "")
                    .trim();

            return objectMapper.readValue(cleaned, AiAnalysisJson.class);

        } catch (TrackifyException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Gemini analysis failed: {}", ex.getMessage(), ex);
            throw new TrackifyException(
                    ErrorCode.INTERNAL_SERVER_ERROR,
                    500,
                    "AI analysis failed: " + ex.getMessage());
        }
    }

    private AiAnalysisResponse toResponse(AiAnalysis analysis) {
        List<String> missingSkills = parseJsonArrayString(analysis.getMissingSkills());
        List<String> suggestedKeywords = parseJsonArrayString(analysis.getSuggestedKeywords());

        return new AiAnalysisResponse(
                analysis.getId(),
                analysis.getJob() != null ? analysis.getJob().getId() : null,
                analysis.getCv() != null ? analysis.getCv().getId() : null,
                analysis.getMatchScore(),
                missingSkills,
                suggestedKeywords,
                analysis.getSummary(),
                analysis.getCreatedAt());
    }

    private static String buildCacheKey(UUID jobId, UUID cvId) {
        return jobId + ":" + cvId;
    }

    private String trimToNull(String s) {
        if (s == null) {
            return null;
        }
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    private static String limitChars(String s, int max) {
        if (s == null) {
            return null;
        }
        return s.length() <= max ? s : s.substring(0, max);
    }

    private List<String> parseJsonArrayString(String json) {
        String trimmed = trimToNull(json);
        if (trimmed == null) {
            return List.of();
        }
        try {
            return objectMapper.readValue(trimmed,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, String.class));
        } catch (Exception ex) {
            log.warn("Failed to parse AI json array string, len={}", trimmed.length());
            return List.of();
        }
    }

    private String toJsonArrayString(List<String> items) {
        try {
            return objectMapper.writeValueAsString(items == null ? List.of() : items);
        } catch (Exception ex) {
            throw new TrackifyException(ErrorCode.INTERNAL_SERVER_ERROR, 500, "Failed to serialize AI json array");
        }
    }

    private int sanitizeMatchScore(Integer score) {
        int s = score == null ? 0 : score;
        if (s < 0) {
            return 0;
        }
        if (s > 100) {
            return 100;
        }
        return s;
    }

    private static record AiAnalysisJson(
            Integer matchScore,
            List<String> missingSkills,
            List<String> suggestedKeywords,
            String summary) {
    }

    private vn.lum1nous.trackify.entity.User getCurrentUser() {
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
