package vn.lum1nous.trackify.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import vn.lum1nous.trackify.entity.ReminderLog;

public interface ReminderLogRepository extends JpaRepository<ReminderLog, UUID> {

    boolean existsByJob_IdAndUser_IdAndReminderTypeAndTriggerDate(
            UUID jobId,
            UUID userId,
            String reminderType,
            LocalDate triggerDate);

    List<ReminderLog> findTop20ByUser_IdOrderByTriggerDateDesc(UUID userId);

    List<ReminderLog> findByUser_IdOrderByTriggerDateDesc(UUID userId, Pageable pageable);
}
