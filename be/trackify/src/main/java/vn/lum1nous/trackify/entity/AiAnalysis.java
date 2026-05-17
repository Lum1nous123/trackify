package vn.lum1nous.trackify.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcType;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.sql.ast.SqlTreePrinter;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "ai_analyses", indexes = {
                @jakarta.persistence.Index(name = "idx_ai_analyses_job_id", columnList = "job_id"),
                @jakarta.persistence.Index(name = "idx_ai_analyses_cv_id", columnList = "cv_id")
}, uniqueConstraints = {
                @jakarta.persistence.UniqueConstraint(name = "uk_ai_analyses_cache_key", columnNames = { "cache_key" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Builder
public class AiAnalysis {

        @Id
        @UuidGenerator
        @GeneratedValue(generator = "uuid2")
        @Column(name = "id", columnDefinition = "uuid", updatable = false, nullable = false)
        @EqualsAndHashCode.Include
        private UUID id;

        @ManyToOne(fetch = FetchType.LAZY, optional = false)
        @JoinColumn(name = "job_id", nullable = false)
        private Job job;

        @ManyToOne(fetch = FetchType.LAZY, optional = false)
        @JoinColumn(name = "cv_id", nullable = false)
        private Cv cv;

        @Column(name = "match_score", nullable = false)
        private int matchScore;

        @JdbcTypeCode(SqlTypes.JSON)
        @Column(name = "missing_skills", columnDefinition = "jsonb")
        private String missingSkills;

        @JdbcTypeCode(SqlTypes.JSON)
        @Column(name = "suggested_keywords", columnDefinition = "jsonb")
        private String suggestedKeywords;

        @Column(name = "summary", columnDefinition = "text")
        private String summary;

        @Column(name = "cache_key", nullable = false, unique = true)
        private String cacheKey;

        @CreationTimestamp
        @Column(name = "created_at", nullable = false, updatable = false)
        private Instant createdAt;
}
