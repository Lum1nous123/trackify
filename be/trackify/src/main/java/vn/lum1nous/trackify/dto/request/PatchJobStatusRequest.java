package vn.lum1nous.trackify.dto.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class PatchJobStatusRequest {

    @NotBlank(message = "status is required")
    private String status;

    // ISO-8601 date string: YYYY-MM-DD
    private String interviewAt;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getInterviewAt() {
        return interviewAt;
    }

    public void setInterviewAt(String interviewAt) {
        this.interviewAt = interviewAt;
    }
}
