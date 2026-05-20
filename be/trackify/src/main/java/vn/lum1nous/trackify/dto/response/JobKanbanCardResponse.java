package vn.lum1nous.trackify.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class JobKanbanCardResponse {

    private UUID id;

    private String companyName;

    private String position;

    private String jdUrl;

    private String status;

    private LocalDate deadline;

    private LocalDate interviewAt;

    private String companyLogoUrl;

    private Instant createdAt;

    private Instant updatedAt;

    // JD + Notes for edit modal
    private String jdText;

    private String notes;

    // AI
    private Integer matchScore;

    private List<String> missingSkills;

    private List<String> suggestedKeywords;

    // Timeline
    private List<JobStatusActivityResponse> activity;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public String getJdUrl() {
        return jdUrl;
    }

    public void setJdUrl(String jdUrl) {
        this.jdUrl = jdUrl;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDate deadline) {
        this.deadline = deadline;
    }

    public LocalDate getInterviewAt() {
        return interviewAt;
    }

    public void setInterviewAt(LocalDate interviewAt) {
        this.interviewAt = interviewAt;
    }

    public String getCompanyLogoUrl() {
        return companyLogoUrl;
    }

    public void setCompanyLogoUrl(String companyLogoUrl) {
        this.companyLogoUrl = companyLogoUrl;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getJdText() {
        return jdText;
    }

    public void setJdText(String jdText) {
        this.jdText = jdText;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Integer getMatchScore() {
        return matchScore;
    }

    public void setMatchScore(Integer matchScore) {
        this.matchScore = matchScore;
    }

    public List<String> getMissingSkills() {
        return missingSkills;
    }

    public void setMissingSkills(List<String> missingSkills) {
        this.missingSkills = missingSkills;
    }

    public List<String> getSuggestedKeywords() {
        return suggestedKeywords;
    }

    public void setSuggestedKeywords(List<String> suggestedKeywords) {
        this.suggestedKeywords = suggestedKeywords;
    }

    public List<JobStatusActivityResponse> getActivity() {
        return activity;
    }

    public void setActivity(List<JobStatusActivityResponse> activity) {
        this.activity = activity;
    }
}
