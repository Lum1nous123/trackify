package vn.lum1nous.trackify.service.job.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.lum1nous.trackify.dto.request.CreateJobRequest;
import vn.lum1nous.trackify.dto.request.PatchJobStatusRequest;
import vn.lum1nous.trackify.dto.request.UpdateJobRequest;
import vn.lum1nous.trackify.dto.response.CreateJobResponse;
import vn.lum1nous.trackify.dto.response.JobKanbanCardResponse;
import vn.lum1nous.trackify.dto.response.JobKanbanResponse;
import vn.lum1nous.trackify.dto.response.JobStatusActivityResponse;
import vn.lum1nous.trackify.domain.job.JobStatus;
import vn.lum1nous.trackify.entity.AiAnalysis;
import vn.lum1nous.trackify.entity.Job;
import vn.lum1nous.trackify.entity.JobStatusHistory;
import vn.lum1nous.trackify.entity.User;
import vn.lum1nous.trackify.error.ErrorCode;
import vn.lum1nous.trackify.error.TrackifyException;
import vn.lum1nous.trackify.repository.JobAnalyticsRepository;
import vn.lum1nous.trackify.repository.JobRepository;
import vn.lum1nous.trackify.repository.JobStatusHistoryRepository;
import vn.lum1nous.trackify.repository.UserRepository;
import vn.lum1nous.trackify.scrape.ScrapeResult;
import vn.lum1nous.trackify.scrape.ScrapeService;
import vn.lum1nous.trackify.service.ai.AiAnalysisService;
import vn.lum1nous.trackify.service.cv.CvService;
import vn.lum1nous.trackify.service.job.JobService;
import vn.lum1nous.trackify.dto.response.AiAnalysisResponse;
import vn.lum1nous.trackify.dto.response.CvActiveResponse;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final ScrapeService scrapeService;
    private final JobStatusHistoryRepository jobStatusHistoryRepository;
    private final JobAnalyticsRepository jobAnalyticsRepository;
    private final ObjectMapper objectMapper;
    private final CvService cvService;
    private final AiAnalysisService aiAnalysisService;

    @Override
    @Transactional
    public CreateJobResponse addJob(CreateJobRequest request) {
        validateBasic(request);

        String jdUrl = trimToNull(request.getJobDescriptionUrl());
        String jdText = trimToNull(request.getJobDescriptionText());

        String companyName = trimToNull(request.getCompanyName());
        String position = trimToNull(request.getPosition());
        String companyLogoUrl = trimToNull(request.getCompanyLogoUrl());

        LocalDate applicationDeadline = request.getApplicationDeadline();

        // Scrape best-effort when URL is provided, so FE can send only jdUrl.
        if (jdUrl != null) {
            ScrapeResult scraped = scrapeService.scrapePage(jdUrl);

            String scrapedJobDescription = scraped.getJobDescription();
            int scrapedJobDescriptionLen = scrapedJobDescription == null ? 0 : scrapedJobDescription.length();
            String scrapedJobDescriptionPreview = scrapedJobDescription == null
                    ? null
                    : scrapedJobDescription.substring(0, Math.min(200, scrapedJobDescription.length()));

            log.info(
                    "Scrape jobUrl={} | title={} | canonicalUrl={} | jsonLdCount={} | companyName={} | jobTitle={} | jobLocation={} | salaryText={} | jobDescriptionLen={} | jobDescriptionPreview={}",
                    scraped.getUrl(),
                    scraped.getTitle(),
                    scraped.getCanonicalUrl(),
                    scraped.getJsonLdCount(),
                    scraped.getCompanyName(),
                    scraped.getJobTitle(),
                    scraped.getJobLocation(),
                    scraped.getSalaryText(),
                    scrapedJobDescriptionLen,
                    scrapedJobDescriptionPreview);

            if (companyName == null) {
                companyName = trimToNull(scraped.getCompanyName());
            }
            if (position == null) {
                position = trimToNull(scraped.getJobTitle());
            }
            if (companyLogoUrl == null) {
                companyLogoUrl = trimToNull(scraped.getCompanyLogoUrl());
            }
            if (jdText == null) {
                jdText = trimToNull(scraped.getJobDescription());
            }
            if (applicationDeadline == null) {
                applicationDeadline = scraped.getJobDeadline();
            }
        }

        if (companyName == null) {
            throw new TrackifyException(
                    ErrorCode.BAD_REQUEST,
                    400,
                    "companyName is required (or provide jobDescriptionUrl)");
        }
        if (position == null) {
            throw new TrackifyException(
                    ErrorCode.BAD_REQUEST,
                    400,
                    "position is required (or provide jobDescriptionUrl)");
        }

        User user = getCurrentUser();

        Job job = new Job();
        job.setUser(user);

        job.setCompanyName(companyName);
        job.setPosition(position);

        // Optional fields (FE optional, with scrape fallback above)
        job.setCompanyLogoUrl(companyLogoUrl);
        job.setNotes(trimToNull(request.getPersonalNotes()));
        job.setDeadline(applicationDeadline);

        job.setStatus(JobStatus.SAVED.name());

        job.setJdUrl(jdUrl);
        job.setJdText(jdText);

        Job saved = jobRepository.save(job);

        CreateJobResponse res = new CreateJobResponse();
        res.setId(saved.getId());
        res.setCompanyName(saved.getCompanyName());
        res.setPosition(saved.getPosition());
        res.setJdUrl(saved.getJdUrl());
        res.setJdText(saved.getJdText());
        res.setStatus(saved.getStatus());
        res.setDeadline(saved.getDeadline());
        res.setCompanyLogoUrl(saved.getCompanyLogoUrl());
        res.setNotes(saved.getNotes());

        CvActiveResponse activeCv = cvService.getActiveCv();
        if (activeCv == null || activeCv.getCvId() == null) {
            throw new TrackifyException(ErrorCode.CV_MISSING, 400, "Active CV is required to analyze job");
        }

        if (res.getJdText() == null) {
            throw new TrackifyException(ErrorCode.BAD_REQUEST, 400, "Job.jdText is required for AI analysis");
        }

        AiAnalysisResponse analysis = aiAnalysisService.analyzeJobCv(saved.getId(), activeCv.getCvId());
        res.setAiAnalysis(analysis);

        return res;
    }

    @Override
    @Transactional(readOnly = true)
    public JobKanbanResponse getKanban() {
        User user = getCurrentUser();

        List<Job> jobs = jobRepository.findByUserId(user.getId());

        JobKanbanResponse response = new JobKanbanResponse();
        response.setCards(
                jobs.stream()
                        .map(this::toKanbanCard)
                        .toList());

        return response;
    }

    @Override
    @Transactional
    public void patchJobStatus(UUID id, PatchJobStatusRequest request) {
        if (id == null) {
            throw new TrackifyException(ErrorCode.BAD_REQUEST, 400, "id is required");
        }
        if (request == null || trimToNull(request.getStatus()) == null) {
            throw new TrackifyException(ErrorCode.BAD_REQUEST, 400, "status is required");
        }

        Job job = jobRepository.findById(id).orElseThrow(
                () -> new TrackifyException(ErrorCode.NOT_FOUND, 404, "Job not found"));

        User currentUser = getCurrentUser();
        UUID jobUserId = job.getUser() == null ? null : job.getUser().getId();
        if (jobUserId == null || !jobUserId.equals(currentUser.getId())) {
            throw new TrackifyException(ErrorCode.FORBIDDEN, 403, "Forbidden");
        }

        String nextStatusRaw = trimToNull(request.getStatus());
        JobStatus nextStatus;
        try {
            nextStatus = JobStatus.valueOf(nextStatusRaw);
        } catch (IllegalArgumentException ex) {
            throw new TrackifyException(ErrorCode.BAD_REQUEST, 400, "Invalid status: " + nextStatusRaw);
        }

        String fromStatus = job.getStatus();
        String toStatus = nextStatus.name();

        if (fromStatus != null && fromStatus.equals(toStatus)) {
            return;
        }

        // interviewAt handling (yyyy-MM-dd)
        LocalDate interviewAt = null;
        String interviewAtRaw = trimToNull(request.getInterviewAt());
        if (interviewAtRaw != null) {
            try {
                interviewAt = LocalDate.parse(interviewAtRaw);
            } catch (Exception ex) {
                throw new TrackifyException(ErrorCode.BAD_REQUEST, 400,
                        "Invalid interviewAt format. Expected YYYY-MM-DD");
            }
        }

        if (nextStatus == JobStatus.INTERVIEW) {
            if (interviewAt == null) {
                throw new TrackifyException(ErrorCode.BAD_REQUEST, 400,
                        "interviewAt is required when status is INTERVIEW");
            }
            if (job.getDeadline() == null) {
                throw new TrackifyException(ErrorCode.BAD_REQUEST, 400, "deadline is required to validate interviewAt");
            }
            if (interviewAt.isAfter(job.getDeadline())) {
                throw new TrackifyException(ErrorCode.BAD_REQUEST, 400, "interviewAt must be <= deadline");
            }
            job.setInterviewAt(interviewAt);
        } else {
            job.setInterviewAt(null);
        }

        job.setStatus(toStatus);
        Job saved = jobRepository.save(job);

        JobStatusHistory history = JobStatusHistory.builder()
                .job(saved)
                .fromStatus(fromStatus)
                .toStatus(toStatus)
                .build();

        jobStatusHistoryRepository.save(history);
    }

    @Override
    @Transactional
    public void updateJob(UUID id, UpdateJobRequest request) {
        if (id == null) {
            throw new TrackifyException(ErrorCode.BAD_REQUEST, 400, "id is required");
        }
        if (request == null) {
            throw new TrackifyException(ErrorCode.BAD_REQUEST, 400, "request is required");
        }

        Job job = jobRepository.findById(id).orElseThrow(
                () -> new TrackifyException(ErrorCode.NOT_FOUND, 404, "Job not found"));

        User currentUser = getCurrentUser();
        UUID jobUserId = job.getUser() == null ? null : job.getUser().getId();
        if (jobUserId == null || !jobUserId.equals(currentUser.getId())) {
            throw new TrackifyException(ErrorCode.FORBIDDEN, 403, "Forbidden");
        }

        String companyName = trimToNull(request.getCompanyName());
        String position = trimToNull(request.getPosition());
        String jdUrl = trimToNull(request.getJobDescriptionUrl());
        String jdText = trimToNull(request.getJobDescriptionText());
        LocalDate applicationDeadline = request.getApplicationDeadline();
        String companyLogoUrl = trimToNull(request.getCompanyLogoUrl());
        String personalNotes = trimToNull(request.getPersonalNotes());

        if (jdUrl != null) {
            // Best-effort scrape when url changes.
            ScrapeResult scraped = scrapeService.scrapePage(jdUrl);

            if (companyName == null) {
                companyName = trimToNull(scraped.getCompanyName());
            }
            if (position == null) {
                position = trimToNull(scraped.getJobTitle());
            }
            if (companyLogoUrl == null) {
                companyLogoUrl = trimToNull(scraped.getCompanyLogoUrl());
            }
            if (jdText == null) {
                jdText = trimToNull(scraped.getJobDescription());
            }
            if (applicationDeadline == null) {
                applicationDeadline = scraped.getJobDeadline();
            }
        }

        if (companyName != null) {
            job.setCompanyName(companyName);
        }
        if (position != null) {
            job.setPosition(position);
        }
        if (jdUrl != null) {
            job.setJdUrl(jdUrl);
        }
        if (jdText != null) {
            job.setJdText(jdText);
        }
        if (applicationDeadline != null || request.getApplicationDeadline() == null) {
            // allow null deadline to be set explicitly if request includes null
            // (UpdateJobRequest.applicationDeadline is nullable, Jackson will set null if
            // provided as null)
            job.setDeadline(applicationDeadline);
        }
        if (companyLogoUrl != null) {
            job.setCompanyLogoUrl(companyLogoUrl);
        }
        if (personalNotes != null || request.getPersonalNotes() == null) {
            job.setNotes(personalNotes);
        }

        // must have required fields at the end
        if (trimToNull(job.getCompanyName()) == null) {
            throw new TrackifyException(ErrorCode.BAD_REQUEST, 400, "companyName is required");
        }
        if (trimToNull(job.getPosition()) == null) {
            throw new TrackifyException(ErrorCode.BAD_REQUEST, 400, "position is required");
        }

        jobRepository.save(job);
    }

    @Override
    @Transactional(readOnly = true)
    public vn.lum1nous.trackify.dto.response.OverviewStatsResponse getOverviewStats(UUID userId) {
        if (userId == null) {
            throw new TrackifyException(ErrorCode.BAD_REQUEST, 400, "userId is required");
        }

        User currentUser = getCurrentUser();
        if (!userId.equals(currentUser.getId())) {
            throw new TrackifyException(ErrorCode.FORBIDDEN, 403, "Forbidden");
        }

        // Compute entirely from entity to avoid native-query / mapping issues.
        List<Job> jobs = jobRepository.findByUserId(userId);
        long totalApplicationsJava = jobs == null ? 0L : jobs.size();

        long respondedApplicationsJava = 0L;
        long aiAnalysesCount = 0L;
        double matchScoreSum = 0d;
        java.util.List<Double> sampleMatchScores = new java.util.ArrayList<>();

        if (jobs != null) {
            for (Job j : jobs) {
                if (j == null) {
                    continue;
                }

                if (j.getStatus() != null && !"SAVED".equals(j.getStatus())) {
                    respondedApplicationsJava += 1;
                }

                List<AiAnalysis> analyses = j.getAiAnalyses();
                if (analyses == null || analyses.isEmpty()) {
                    continue;
                }

                for (AiAnalysis a : analyses) {
                    if (a == null) {
                        continue;
                    }
                    int ms = a.getMatchScore();
                    aiAnalysesCount += 1;
                    matchScoreSum += ms;

                    if (sampleMatchScores.size() < 5) {
                        sampleMatchScores.add((double) ms);
                    }
                }
            }
        }

        double responseRateJava = totalApplicationsJava == 0 ? 0d
                : (respondedApplicationsJava / (double) totalApplicationsJava);
        double avgMatchScoreJava = aiAnalysesCount == 0 ? 0d : (matchScoreSum / aiAnalysesCount);

        log.info(
                "getOverviewStats userId={} | totalApplications={} | responseRate={} | aiAnalysesCount={} | avgMatchScore={} | samples={}",
                userId,
                totalApplicationsJava,
                responseRateJava,
                aiAnalysesCount,
                avgMatchScoreJava,
                sampleMatchScores);

        return vn.lum1nous.trackify.dto.response.OverviewStatsResponse.builder()
                .totalApplications(totalApplicationsJava)
                .responseRate(responseRateJava)
                .avgMatchScore(avgMatchScoreJava)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Long> getPipelineFunnel(UUID userId) {
        if (userId == null) {
            throw new TrackifyException(ErrorCode.BAD_REQUEST, 400, "userId is required");
        }

        User currentUser = getCurrentUser();
        if (!userId.equals(currentUser.getId())) {
            throw new TrackifyException(ErrorCode.FORBIDDEN, 403, "Forbidden");
        }

        List<Object[]> rows = jobAnalyticsRepository.getPipelineFunnel(userId);
        if (rows == null || rows.isEmpty()) {
            return Collections.emptyMap();
        }

        return rows.stream()
                .filter(r -> r != null && r.length >= 2)
                .collect(java.util.stream.Collectors.toMap(
                        r -> (String) r[0],
                        r -> r[1] == null ? 0L : ((Number) r[1]).longValue(),
                        (a, b) -> a));
    }

    @Override
    @Transactional(readOnly = true)
    public List<vn.lum1nous.trackify.dto.response.TopMissingSkillResponse> getTopMissingSkills(
            UUID userId, int limit) {
        if (userId == null) {
            throw new TrackifyException(ErrorCode.BAD_REQUEST, 400, "userId is required");
        }
        if (limit <= 0) {
            throw new TrackifyException(ErrorCode.BAD_REQUEST, 400, "limit must be > 0");
        }

        User currentUser = getCurrentUser();
        if (!userId.equals(currentUser.getId())) {
            throw new TrackifyException(ErrorCode.FORBIDDEN, 403, "Forbidden");
        }

        List<Object[]> rows = jobAnalyticsRepository.getTopMissingSkills(userId, limit);
        if (rows == null || rows.isEmpty()) {
            return Collections.emptyList();
        }

        return rows.stream()
                .filter(r -> r != null && r.length >= 2)
                .map(r -> vn.lum1nous.trackify.dto.response.TopMissingSkillResponse.builder()
                        .skillName(r[0] == null ? null : r[0].toString())
                        .count(r[1] == null ? 0L : ((Number) r[1]).longValue())
                        .build())
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<vn.lum1nous.trackify.dto.response.StatusConversionResponse> getStatusConversionRates(
            UUID userId, int limit) {
        if (userId == null) {
            throw new TrackifyException(ErrorCode.BAD_REQUEST, 400, "userId is required");
        }
        if (limit <= 0) {
            throw new TrackifyException(ErrorCode.BAD_REQUEST, 400, "limit must be > 0");
        }

        User currentUser = getCurrentUser();
        if (!userId.equals(currentUser.getId())) {
            throw new TrackifyException(ErrorCode.FORBIDDEN, 403, "Forbidden");
        }

        List<Object[]> rows = jobAnalyticsRepository.getStatusConversionRates(userId, limit);
        if (rows == null || rows.isEmpty()) {
            return Collections.emptyList();
        }

        return rows.stream()
                .filter(r -> r != null && r.length >= 4)
                .map(r -> vn.lum1nous.trackify.dto.response.StatusConversionResponse.builder()
                        .fromStatus(r[0] == null ? null : r[0].toString())
                        .toStatus(r[1] == null ? null : r[1].toString())
                        .rate(r[2] == null ? 0d : ((Number) r[2]).doubleValue())
                        .count(r[3] == null ? 0L : ((Number) r[3]).longValue())
                        .build())
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public vn.lum1nous.trackify.dto.response.DashboardStatsResponse getDashboardStats(UUID userId) {
        if (userId == null) {
            throw new TrackifyException(ErrorCode.BAD_REQUEST, 400, "userId is required");
        }

        User currentUser = getCurrentUser();
        if (!userId.equals(currentUser.getId())) {
            throw new TrackifyException(ErrorCode.FORBIDDEN, 403, "Forbidden");
        }

        java.time.ZoneId zone = java.time.ZoneId.systemDefault();
        java.time.LocalDate today = java.time.LocalDate.now(zone);

        java.time.LocalDate weekStartDate = today.with(java.time.DayOfWeek.MONDAY);
        java.time.Instant fromWeek = weekStartDate.atStartOfDay(zone).toInstant();
        java.time.Instant toWeek = weekStartDate.plusWeeks(1).atStartOfDay(zone).toInstant();

        java.time.LocalDate monthStartDate = today.withDayOfMonth(1);
        java.time.Instant fromMonth = monthStartDate.atStartOfDay(zone).toInstant();
        java.time.Instant toMonth = monthStartDate.plusMonths(1).atStartOfDay(zone).toInstant();

        long interviewsThisWeek = jobAnalyticsRepository.countInterviewsThisWeek(userId, fromWeek, toWeek);
        long pendingResponses = jobAnalyticsRepository.countPendingResponses(userId);
        long thisMonth = jobAnalyticsRepository.countThisMonth(userId, fromMonth, toMonth);

        // Upcoming deadlines window:
        // - from today (inclusive) to +14 days (exclusive)
        java.time.LocalDate fromDate = today;
        java.time.LocalDate toDate = today.plusDays(14);

        // keep this in sync with FE "Upcoming Deadlines (4)" default window
        int upcomingLimit = 4;
        long upcomingDeadlines = jobAnalyticsRepository.getUpcomingDeadlines(userId, fromDate, toDate, upcomingLimit)
                .size();

        return vn.lum1nous.trackify.dto.response.DashboardStatsResponse.builder()
                .interviewsThisWeek(interviewsThisWeek)
                .pendingResponses(pendingResponses)
                .thisMonth(thisMonth)
                .upcomingDeadlines(upcomingDeadlines)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<vn.lum1nous.trackify.dto.response.UpcomingDeadlineItemResponse> getUpcomingDeadlines(UUID userId,
            int limit) {
        if (userId == null) {
            throw new TrackifyException(ErrorCode.BAD_REQUEST, 400, "userId is required");
        }
        if (limit <= 0) {
            throw new TrackifyException(ErrorCode.BAD_REQUEST, 400, "limit must be > 0");
        }

        User currentUser = getCurrentUser();
        if (!userId.equals(currentUser.getId())) {
            throw new TrackifyException(ErrorCode.FORBIDDEN, 403, "Forbidden");
        }

        java.time.ZoneId zone = java.time.ZoneId.systemDefault();
        java.time.LocalDate today = java.time.LocalDate.now(zone);
        java.time.LocalDate fromDate = today;
        java.time.LocalDate toDate = today.plusDays(14);

        List<Object[]> rows = jobAnalyticsRepository.getUpcomingDeadlines(userId, fromDate, toDate, limit);
        if (rows == null || rows.isEmpty()) {
            return Collections.emptyList();
        }

        return rows.stream()
                .filter(r -> r != null && r.length >= 4)
                .map(r -> vn.lum1nous.trackify.dto.response.UpcomingDeadlineItemResponse.builder()
                        .id(r[0] == null ? null : (UUID) r[0])
                        .companyName(r[1] == null ? null : r[1].toString())
                        .position(r[2] == null ? null : r[2].toString())
                        .deadline(r[3] == null ? null : (java.time.LocalDate) r[3])
                        .build())
                .toList();
    }

    private JobKanbanCardResponse toKanbanCard(Job job) {
        JobKanbanCardResponse card = new JobKanbanCardResponse();
        card.setId(job.getId());
        card.setCompanyName(job.getCompanyName());
        card.setPosition(job.getPosition());
        card.setJdUrl(job.getJdUrl());
        card.setStatus(job.getStatus());
        card.setDeadline(job.getDeadline());
        card.setInterviewAt(job.getInterviewAt());
        card.setCompanyLogoUrl(job.getCompanyLogoUrl());
        card.setCreatedAt(job.getCreatedAt());
        card.setUpdatedAt(job.getUpdatedAt());

        // AI (best-effort: use first analysis if multiple exist)
        List<AiAnalysis> analyses = job.getAiAnalyses();
        if (analyses != null && !analyses.isEmpty()) {
            AiAnalysis analysis = analyses.get(0);

            card.setMatchScore(analysis.getMatchScore());

            card.setMissingSkills(parseJsonStringToStringList(analysis.getMissingSkills()));
            card.setSuggestedKeywords(parseJsonStringToStringList(analysis.getSuggestedKeywords()));
        } else {
            card.setMatchScore(null);
            card.setMissingSkills(Collections.emptyList());
            card.setSuggestedKeywords(Collections.emptyList());
        }

        // Timeline: map status history
        List<JobStatusActivityResponse> activity = job.getJobStatusHistories() == null
                ? Collections.emptyList()
                : job.getJobStatusHistories().stream()
                        .map(h -> toActivity(h))
                        .toList();

        card.setActivity(activity);
        return card;
    }

    private JobStatusActivityResponse toActivity(JobStatusHistory h) {
        JobStatusActivityResponse res = new JobStatusActivityResponse();
        res.setId(h.getId());

        String from = h.getFromStatus() == null ? "" : h.getFromStatus();
        String to = h.getToStatus() == null ? "" : h.getToStatus();

        // expose statuses for FE usage (pill correctness & dedupe)
        res.setFromStatus(from.isBlank() ? null : from);
        res.setToStatus(to.isBlank() ? null : to);

        String text;
        if (from.isBlank()) {
            text = "Moved to " + to;
        } else if (to.isBlank()) {
            text = "Moved from " + from;
        } else {
            text = from + " → " + to;
        }

        res.setText(text);
        res.setChangedAt(h.getChangedAt());
        return res;
    }

    private List<String> parseJsonStringToStringList(String json) {
        String trimmed = trimToNull(json);
        if (trimmed == null) {
            return Collections.emptyList();
        }

        try {
            // stored as jsonb; expecting array-of-strings
            return objectMapper.readValue(trimmed, new TypeReference<List<String>>() {
            });
        } catch (Exception ex) {
            log.warn("Failed to parse json array from jsonb. jsonLen={}", trimmed.length());
            return Collections.emptyList();
        }
    }

    private static void validateBasic(CreateJobRequest request) {
        if (request == null) {
            throw new TrackifyException(ErrorCode.BAD_REQUEST, 400, "Request is required");
        }

        String jdUrl = trimToNull(request.getJobDescriptionUrl());

        // If jdUrl exists, validate it looks like a URL
        if (jdUrl != null) {
            try {
                URI uri = URI.create(jdUrl);
                if (uri.getScheme() == null || uri.getHost() == null) {
                    throw new TrackifyException(ErrorCode.BAD_REQUEST, 400, "Invalid jobDescriptionUrl");
                }
            } catch (IllegalArgumentException ex) {
                throw new TrackifyException(ErrorCode.BAD_REQUEST, 400, "Invalid jobDescriptionUrl");
            }
        }

        // Must provide at least one way to fill JD
        boolean hasAnyCompanyAndPosition = trimToNull(request.getCompanyName()) != null
                && trimToNull(request.getPosition()) != null;

        boolean hasAnyJd = trimToNull(request.getJobDescriptionUrl()) != null
                || trimToNull(request.getJobDescriptionText()) != null;

        if (!hasAnyCompanyAndPosition && !hasAnyJd) {
            throw new TrackifyException(
                    ErrorCode.BAD_REQUEST,
                    400,
                    "Must provide companyName+position or jobDescriptionUrl/jobDescriptionText");
        }
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

    private static String trimToNull(String s) {
        if (s == null) {
            return null;
        }
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }
}
