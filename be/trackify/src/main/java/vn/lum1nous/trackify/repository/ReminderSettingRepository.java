package vn.lum1nous.trackify.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import vn.lum1nous.trackify.entity.ReminderSetting;

public interface ReminderSettingRepository extends JpaRepository<ReminderSetting, UUID> {

    List<ReminderSetting> findByUser_Id(UUID userId);

    void deleteByUser_IdAndJobStatusAndReminderType(UUID userId, String jobStatus, String reminderType);
}
