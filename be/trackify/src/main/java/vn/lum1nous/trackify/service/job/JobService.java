package vn.lum1nous.trackify.service.job;

import java.util.List;
import java.util.Map;
import java.util.UUID;

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

public interface JobService {

    CreateJobResponse addJob(CreateJobRequest request);

    JobKanbanResponse getKanban();

    void patchJobStatus(UUID id, PatchJobStatusRequest request);

    void updateJob(UUID id, UpdateJobRequest request);

    OverviewStatsResponse getOverviewStats(UUID userId);

    /**
     * Pipeline funnel: status -> count
     */
    Map<String, Long> getPipelineFunnel(UUID userId);

    List<TopMissingSkillResponse> getTopMissingSkills(UUID userId, int limit);

    /**
     * Conversion insights: rate(from_status -> to_status) + raw count
     */
    List<StatusConversionResponse> getStatusConversionRates(UUID userId, int limit);

    DashboardStatsResponse getDashboardStats(UUID userId);

    /**
     * Upcoming deadlines list for dashboard.
     * Uses Job.deadline window (computed in repository).
     */
    List<UpcomingDeadlineItemResponse> getUpcomingDeadlines(UUID userId, int limit);
}
