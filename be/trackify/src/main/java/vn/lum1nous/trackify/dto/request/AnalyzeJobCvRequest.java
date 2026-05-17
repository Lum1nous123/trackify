package vn.lum1nous.trackify.dto.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AnalyzeJobCvRequest {

    @NotNull(message = "jobId is required")
    private UUID jobId;

    @NotNull(message = "cvId is required")
    private UUID cvId;
}
