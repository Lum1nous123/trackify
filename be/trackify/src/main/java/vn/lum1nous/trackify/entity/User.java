package vn.lum1nous.trackify.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "users", uniqueConstraints = {
    @UniqueConstraint(name = "uk_users_email", columnNames = { "email" }),
    @UniqueConstraint(name = "uk_users_username", columnNames = { "username" })
})
public class User {

  @Id
  @UuidGenerator
  @GeneratedValue(generator = "uuid2")
  @Column(name = "id", columnDefinition = "uuid", updatable = false, nullable = false)
  private UUID id;

  @Column(name = "email", nullable = false, unique = true)
  private String email;

  @Column(name = "username", nullable = false, unique = true)
  private String username;

  @Column(name = "password_hash", nullable = false)
  private String passwordHash;

  @Column(name = "full_name")
  private String fullName;

  @Column(name = "avatar_url")
  private String avatarUrl;

  @Column(name = "email_verified", nullable = false)
  private boolean emailVerified;

  @Column(name = "email_verification_code")
  private String emailVerificationCode;

  @Column(name = "email_verification_expires_at")
  private Instant emailVerificationExpiresAt;

  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at")
  private Instant updatedAt;

  @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
  private List<Cv> cvs = new ArrayList<>();

  @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
  private List<Job> jobs = new ArrayList<>();

  @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
  private List<ReminderLog> reminderLogs = new ArrayList<>();

  public UUID getId() {
    return id;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public String getPasswordHash() {
    return passwordHash;
  }

  public void setPasswordHash(String passwordHash) {
    this.passwordHash = passwordHash;
  }

  public String getFullName() {
    return fullName;
  }

  public String getAvatarUrl() {
    return avatarUrl;
  }

  public void setAvatarUrl(String avatarUrl) {
    this.avatarUrl = avatarUrl;
  }

  public void setFullName(String fullName) {
    this.fullName = fullName;
  }

  public boolean isEmailVerified() {
    return emailVerified;
  }

  public void setEmailVerified(boolean emailVerified) {
    this.emailVerified = emailVerified;
  }

  public String getEmailVerificationCode() {
    return emailVerificationCode;
  }

  public void setEmailVerificationCode(String emailVerificationCode) {
    this.emailVerificationCode = emailVerificationCode;
  }

  public Instant getEmailVerificationExpiresAt() {
    return emailVerificationExpiresAt;
  }

  public void setEmailVerificationExpiresAt(Instant emailVerificationExpiresAt) {
    this.emailVerificationExpiresAt = emailVerificationExpiresAt;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public Instant getUpdatedAt() {
    return updatedAt;
  }

  public List<Cv> getCvs() {
    return cvs;
  }

  public List<Job> getJobs() {
    return jobs;
  }

  public List<ReminderLog> getReminderLogs() {
    return reminderLogs;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o)
      return true;
    if (!(o instanceof User user))
      return false;
    return id != null && id.equals(user.id);
  }

  @Override
  public int hashCode() {
    return Objects.hashCode(id);
  }
}
