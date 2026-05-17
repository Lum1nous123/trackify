package vn.lum1nous.trackify.repository;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import vn.lum1nous.trackify.entity.Job;

public interface JobAnalyticsRepository extends JpaRepository<Job, UUID> {

    @Query(value = """
            WITH user_jobs AS (
                SELECT id, status
                FROM jobs
                WHERE user_id = :userId
            ),
            job_counts AS (
                SELECT
                    COUNT(*) AS total_applications,
                    COUNT(*) FILTER (WHERE status <> 'SAVED') AS responded_applications
                FROM user_jobs
            ),
            avg_match AS (
                SELECT AVG(a.match_score)::double precision AS avg_match_score
                FROM user_jobs uj
                JOIN ai_analyses a ON a.job_id = uj.id
            )
            SELECT
                jc.total_applications::bigint AS total_applications,
                CASE
                    WHEN jc.total_applications = 0 THEN 0
                    ELSE (jc.responded_applications::float / jc.total_applications)
                END AS response_rate,
                COALESCE(am.avg_match_score, 0)::double precision AS avg_match_score
            FROM job_counts jc
            CROSS JOIN avg_match am
            """, nativeQuery = true)
    Object[] getOverviewStats(@Param("userId") UUID userId);

    @Query(value = """
            SELECT
                j.status AS status,
                COUNT(*)::bigint AS count
            FROM jobs j
            WHERE j.user_id = :userId
            GROUP BY j.status
            """, nativeQuery = true)
    List<Object[]> getPipelineFunnel(@Param("userId") UUID userId);

    @Query(value = """
            SELECT
                elem AS skill_name,
                COUNT(*)::bigint AS count
            FROM jobs j
            JOIN ai_analyses a ON a.job_id = j.id
            CROSS JOIN LATERAL jsonb_array_elements_text(a.missing_skills) AS elem
            WHERE j.user_id = :userId
              AND a.missing_skills IS NOT NULL
            GROUP BY elem
            ORDER BY count DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<Object[]> getTopMissingSkills(@Param("userId") UUID userId, @Param("limit") int limit);

    @Query(value = """
            SELECT
                h.from_status AS from_status,
                h.to_status AS to_status,
                (
                    COUNT(*)::float
                    / NULLIF(SUM(COUNT(*)) OVER (PARTITION BY h.from_status), 0)
                ) AS rate,
                COUNT(*)::bigint AS count
            FROM job_status_histories h
            JOIN jobs j ON j.id = h.job_id
            WHERE j.user_id = :userId
            GROUP BY h.from_status, h.to_status
            ORDER BY count DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<Object[]> getStatusConversionRates(@Param("userId") UUID userId, @Param("limit") int limit);

    /**
     * Dashboard cards:
     * - interviewsThisWeek: jobs transitioned INTO INTERVIEW during current week
     * - pendingResponses: jobs currently waiting for a response (status=APPLIED)
     * - thisMonth: jobs created during current month
     */
    @Query(value = """
            SELECT COUNT(*)::bigint
            FROM job_status_histories h
            JOIN jobs j ON j.id = h.job_id
            WHERE j.user_id = :userId
              AND h.to_status = 'INTERVIEW'
              AND h.changed_at >= :fromTs
              AND h.changed_at < :toTs
            """, nativeQuery = true)
    long countInterviewsThisWeek(
            @Param("userId") UUID userId,
            @Param("fromTs") Instant fromTs,
            @Param("toTs") Instant toTs);

    @Query(value = """
            SELECT COUNT(*)::bigint
            FROM jobs j
            WHERE j.user_id = :userId
              AND j.status = 'APPLIED'
            """, nativeQuery = true)
    long countPendingResponses(@Param("userId") UUID userId);

    @Query(value = """
            SELECT COUNT(*)::bigint
            FROM jobs j
            WHERE j.user_id = :userId
              AND j.created_at >= :fromTs
              AND j.created_at < :toTs
            """, nativeQuery = true)
    long countThisMonth(
            @Param("userId") UUID userId,
            @Param("fromTs") Instant fromTs,
            @Param("toTs") Instant toTs);

    /**
     * Upcoming deadlines list (dashboard):
     * - uses jobs.deadline (LocalDate)
     * - returns items sorted by deadline asc
     */
    @Query(value = """
            SELECT
                j.id AS id,
                j.company_name AS company_name,
                j.position AS position,
                j.deadline AS deadline
            FROM jobs j
            WHERE j.user_id = :userId
              AND j.deadline IS NOT NULL
              AND j.deadline >= :fromDate
              AND j.deadline < :toDate
            ORDER BY j.deadline ASC, j.created_at DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<Object[]> getUpcomingDeadlines(
            @Param("userId") UUID userId,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            @Param("limit") int limit);
}
