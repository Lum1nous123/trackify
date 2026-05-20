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
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "jobs")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Job {

  @Id
  @UuidGenerator
  @GeneratedValue(generator = "uuid2")
  @Column(name = "id", columnDefinition = "uuid", updatable = false, nullable = false)
  @EqualsAndHashCode.Include
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

  @Column(name = "interview_at")
  private LocalDate interviewAt;

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
}
