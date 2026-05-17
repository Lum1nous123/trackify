package vn.lum1nous.trackify.controller;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.lum1nous.trackify.dto.request.CreateJobRequest;
import vn.lum1nous.trackify.dto.request.PatchJobStatusRequest;
import vn.lum1nous.trackify.dto.request.UpdateJobRequest;
import vn.lum1nous.trackify.dto.response.CreateJobResponse;
import vn.lum1nous.trackify.dto.response.DashboardStatsResponse;
import vn.lum1nous.trackify.dto.response.JobKanbanResponse;
import vn.lum1nous.trackify.dto.response.OverviewStatsResponse;
import vn.lum1nous.trackify.dto.response.StatusConversionResponse;
import vn.lum1nous.trackify.dto.response.TopMissingSkillResponse;
import vn.lum1nous.trackify.dto.response.UpcomingDeadlineItemResponse;
import vn.lum1nous.trackify.error.ApiResponse;
import vn.lum1nous.trackify.service.job.JobService;

@RestController
@RequestMapping("/api/jobs")
@Validated
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    @PostMapping(value = "/add", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<CreateJobResponse> addJob(
            @Valid @RequestBody CreateJobRequest request) {
        return ApiResponse.success(200, jobService.addJob(request));
    }

    @GetMapping(value = "/kanban", produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<JobKanbanResponse> getKanban() {
        return ApiResponse.success(200, jobService.getKanban());
    }

    @GetMapping(value = "/applications", produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<JobKanbanResponse> getApplications() {
        // Applications page reuses the same cards shape as Kanban:
        // includes AI match score + missing skills + suggested keywords (best-effort)
        return ApiResponse.success(200, jobService.getKanban());
    }

    @PatchMapping(value = "/{id}/status", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<String> patchJobStatus(
            @PathVariable("id") UUID id,
            @Valid @RequestBody PatchJobStatusRequest request) {
        jobService.patchJobStatus(id, request);
        return ApiResponse.success(200, "OK");
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<String> updateJob(
            @PathVariable("id") UUID id,
            @Valid @RequestBody UpdateJobRequest request) {
        jobService.updateJob(id, request);
        return ApiResponse.success(200, "OK");
    }

    @GetMapping(value = "/overview-stats", produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<OverviewStatsResponse> getOverviewStats(
            @RequestParam("userId") UUID userId) {
        return ApiResponse.success(200, jobService.getOverviewStats(userId));
    }

    @GetMapping(value = "/pipeline-funnel", produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<Map<String, Long>> getPipelineFunnel(
            @RequestParam("userId") UUID userId) {
        return ApiResponse.success(200, jobService.getPipelineFunnel(userId));
    }

    @GetMapping(value = "/top-missing-skills", produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<List<TopMissingSkillResponse>> getTopMissingSkills(
            @RequestParam("userId") UUID userId,
            @RequestParam("limit") int limit) {
        return ApiResponse.success(200, jobService.getTopMissingSkills(userId, limit));
    }

    @GetMapping(value = "/status-conversion-rates", produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<List<StatusConversionResponse>> getStatusConversionRates(
            @RequestParam("userId") UUID userId,
            @RequestParam("limit") int limit) {
        return ApiResponse.success(200, jobService.getStatusConversionRates(userId, limit));
    }

    @GetMapping(value = "/dashboard-stats", produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<DashboardStatsResponse> getDashboardStats(@RequestParam("userId") UUID userId) {
        return ApiResponse.success(200, jobService.getDashboardStats(userId));
    }

    @GetMapping(value = "/upcoming-deadlines", produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<List<UpcomingDeadlineItemResponse>> getUpcomingDeadlines(
            @RequestParam("userId") UUID userId,
            @RequestParam("limit") int limit) {
        return ApiResponse.success(200, jobService.getUpcomingDeadlines(userId, limit));
    }
}
