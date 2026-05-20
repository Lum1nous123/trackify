package vn.lum1nous.trackify.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "reminder_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class ReminderSetting {

    @Id
    @UuidGenerator
    @GeneratedValue(generator = "uuid2")
    @Column(name = "id", columnDefinition = "uuid", updatable = false, nullable = false)
    @EqualsAndHashCode.Include
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "job_status", nullable = false)
    private String jobStatus;

    @Column(name = "reminder_type", nullable = false)
    private String reminderType;

    @Column(name = "enabled", nullable = false)
    private boolean enabled;

    @Column(name = "start_offset_days", nullable = false)
    private int startOffsetDays;

    @Column(name = "end_offset_days", nullable = false)
    private int endOffsetDays;

    @Column(name = "frequency_days", nullable = false)
    private int frequencyDays;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
