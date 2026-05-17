package vn.lum1nous.trackify.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import java.util.List;
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
public class AiAnalysisResponse {

    private UUID id;

    private UUID jobId;

    private UUID cvId;

    private Integer matchScore;

    private List<String> missingSkills;

    private List<String> suggestedKeywords;

    private String summary;

    private Instant createdAt;
}
