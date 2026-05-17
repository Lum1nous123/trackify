package vn.lum1nous.trackify.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import vn.lum1nous.trackify.entity.Job;

public interface JobRepository extends JpaRepository<Job, UUID> {

    List<Job> findByUserId(UUID userId);
}
