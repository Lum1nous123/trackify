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
public class OverviewStatsResponse {

    private long totalApplications;

    /**
     * Ratio in [0..1]. Example: 0.4 means 40%.
     */
    private double responseRate;

    private double avgMatchScore;
}
