package vn.lum1nous.trackify.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import vn.lum1nous.trackify.entity.JobStatusHistory;

public interface JobStatusHistoryRepository extends JpaRepository<JobStatusHistory, UUID> {

    List<JobStatusHistory> findByJobIdOrderByChangedAtDesc(UUID jobId);
}
