package vn.lum1nous.trackify.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "jobs")
public class Job {

  @Id
  @UuidGenerator
  @GeneratedValue(generator = "uuid2")
  @Column(name = "id", columnDefinition = "uuid", updatable = false, nullable = false)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(name = "company_name", nullable = false)
  private String companyName;

  @Column(name = "position", nullable = false)
  private String position;

  @Column(name = "jd_url")
  private String jdUrl;

  @Column(name = "jd_text", columnDefinition = "text")
  private String jdText;

  @Column(name = "status", nullable = false)
  private String status;

  @Column(name = "deadline")
  private LocalDate deadline;

  @Column(name = "company_logo_url")
  private String companyLogoUrl;

  @Column(name = "notes", columnDefinition = "text")
  private String notes;

  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at")
  private Instant updatedAt;

  @OneToMany(mappedBy = "job", fetch = FetchType.LAZY)
  private List<AiAnalysis> aiAnalyses = new ArrayList<>();

  @OneToMany(mappedBy = "job", fetch = FetchType.LAZY)
  private List<ReminderLog> reminderLogs = new ArrayList<>();

  @OneToMany(mappedBy = "job", fetch = FetchType.LAZY)
  private List<JobStatusHistory> jobStatusHistories = new ArrayList<>();

  public UUID getId() {
    return id;
  }

  public User getUser() {
    return user;
  }

  public void setUser(User user) {
    this.user = user;
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

  public String getJdText() {
    return jdText;
  }

  public void setJdText(String jdText) {
    this.jdText = jdText;
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

  public String getCompanyLogoUrl() {
    return companyLogoUrl;
  }

  public void setCompanyLogoUrl(String companyLogoUrl) {
    this.companyLogoUrl = companyLogoUrl;
  }

  public String getNotes() {
    return notes;
  }

  public void setNotes(String notes) {
    this.notes = notes;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public Instant getUpdatedAt() {
    return updatedAt;
  }

  public List<AiAnalysis> getAiAnalyses() {
    return aiAnalyses;
  }

  public List<ReminderLog> getReminderLogs() {
    return reminderLogs;
  }

  public List<JobStatusHistory> getJobStatusHistories() {
    return jobStatusHistories;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o)
      return true;
    if (!(o instanceof Job job))
      return false;
    return id != null && id.equals(job.id);
  }

  @Override
  public int hashCode() {
    return Objects.hashCode(id);
  }
}
