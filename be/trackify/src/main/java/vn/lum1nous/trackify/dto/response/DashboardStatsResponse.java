package vn.lum1nous.trackify.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsResponse {

    /**
     * Jobs that transitioned INTO INTERVIEW during current week.
     */
    private long interviewsThisWeek;

    /**
     * Jobs currently waiting for a response (status = APPLIED).
     */
    private long pendingResponses;

    /**
     * Jobs created during current month.
     */
    private long thisMonth;

    /**
     * Jobs with deadlines in the upcoming window (see backend).
     */
    private long upcomingDeadlines;
}
