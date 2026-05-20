package vn.lum1nous.trackify.dto.request;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class UpsertReminderSettingsItemRequest {

    // Example: SAVED / APPLIED / INTERVIEW
    private String jobStatus;

    // Example: DEADLINE_REMINDER / FOLLOW_UP_APPLIED / INTERVIEW_PREP
    private String reminderType;

    private boolean enabled;

    // Window: [today - startOffsetDays, today - endOffsetDays]
    private int startOffsetDays;
    private int endOffsetDays;

    // MVP: always 1 (daily), but keep it for flexibility
    private int frequencyDays;

    public String getJobStatus() {
        return jobStatus;
    }

    public void setJobStatus(String jobStatus) {
        this.jobStatus = jobStatus;
    }

    public String getReminderType() {
        return reminderType;
    }

    public void setReminderType(String reminderType) {
        this.reminderType = reminderType;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public int getStartOffsetDays() {
        return startOffsetDays;
    }

    public void setStartOffsetDays(int startOffsetDays) {
        this.startOffsetDays = startOffsetDays;
    }

    public int getEndOffsetDays() {
        return endOffsetDays;
    }

    public void setEndOffsetDays(int endOffsetDays) {
        this.endOffsetDays = endOffsetDays;
    }

    public int getFrequencyDays() {
        return frequencyDays;
    }

    public void setFrequencyDays(int frequencyDays) {
        this.frequencyDays = frequencyDays;
    }
}
