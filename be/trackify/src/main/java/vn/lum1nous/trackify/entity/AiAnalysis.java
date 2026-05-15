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
import java.util.Objects;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "ai_analyses", indexes = {
        @jakarta.persistence.Index(name = "idx_ai_analyses_job_id", columnList = "job_id"),
        @jakarta.persistence.Index(name = "idx_ai_analyses_cv_id", columnList = "cv_id")
}, uniqueConstraints = {
        @jakarta.persistence.UniqueConstraint(name = "uk_ai_analyses_cache_key", columnNames = { "cache_key" })
})
public class AiAnalysis {

    @Id
    @UuidGenerator
    @GeneratedValue(generator = "uuid2")
    @Column(name = "id", columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cv_id", nullable = false)
    private Cv cv;

    @Column(name = "match_score", nullable = false)
    private int matchScore;

    @Column(name = "missing_skills", columnDefinition = "jsonb")
    private String missingSkills;

    @Column(name = "suggested_keywords", columnDefinition = "jsonb")
    private String suggestedKeywords;

    @Column(name = "summary", columnDefinition = "text")
    private String summary;

    @Column(name = "cache_key", nullable = false, unique = true)
    private String cacheKey;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public UUID getId() {
        return id;
    }

    public Job getJob() {
        return job;
    }

    public void setJob(Job job) {
        this.job = job;
    }

    public Cv getCv() {
        return cv;
    }

    public void setCv(Cv cv) {
        this.cv = cv;
    }

    public int getMatchScore() {
        return matchScore;
    }

    public void setMatchScore(int matchScore) {
        this.matchScore = matchScore;
    }

    public String getMissingSkills() {
        return missingSkills;
    }

    public void setMissingSkills(String missingSkills) {
        this.missingSkills = missingSkills;
    }

    public String getSuggestedKeywords() {
        return suggestedKeywords;
    }

    public void setSuggestedKeywords(String suggestedKeywords) {
        this.suggestedKeywords = suggestedKeywords;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getCacheKey() {
        return cacheKey;
    }

    public void setCacheKey(String cacheKey) {
        this.cacheKey = cacheKey;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof AiAnalysis that))
            return false;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
