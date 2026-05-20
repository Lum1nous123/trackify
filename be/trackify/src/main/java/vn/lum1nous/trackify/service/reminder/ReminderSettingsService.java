package vn.lum1nous.trackify.service.reminder;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.lum1nous.trackify.dto.request.UpsertReminderSettingsItemRequest;
import vn.lum1nous.trackify.entity.ReminderSetting;
import vn.lum1nous.trackify.entity.User;
import vn.lum1nous.trackify.error.ErrorCode;
import vn.lum1nous.trackify.error.TrackifyException;
import vn.lum1nous.trackify.repository.ReminderSettingRepository;
import vn.lum1nous.trackify.repository.UserRepository;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReminderSettingsService {

    private final ReminderSettingRepository reminderSettingRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ReminderSetting> getCurrentUserSettings() {
        User user = getCurrentUser();
        return reminderSettingRepository.findByUser_Id(user.getId());
    }

    @Transactional
    public void upsertSettings(List<UpsertReminderSettingsItemRequest> items) {
        User user = getCurrentUser();
        if (items == null) {
            throw new TrackifyException(ErrorCode.BAD_REQUEST, 400, "settings is required");
        }

        // MVP: delete existing by (jobStatus, reminderType) and re-insert
        // enabled/offsets.
        for (UpsertReminderSettingsItemRequest item : items) {
            if (item == null) {
                continue;
            }

            String jobStatus = item.getJobStatus();
            String reminderType = item.getReminderType();

            if (jobStatus == null || jobStatus.isBlank()) {
                continue;
            }
            if (reminderType == null || reminderType.isBlank()) {
                continue;
            }

            reminderSettingRepository.deleteByUser_IdAndJobStatusAndReminderType(
                    user.getId(), jobStatus, reminderType);
        }

        List<ReminderSetting> toSave = items.stream()
                .filter(i -> i != null)
                .filter(i -> i.getJobStatus() != null && !i.getJobStatus().isBlank())
                .filter(i -> i.getReminderType() != null && !i.getReminderType().isBlank())
                .map(i -> {
                    int startOffsetDays = i.getStartOffsetDays();
                    int endOffsetDays = i.getEndOffsetDays();
                    int frequencyDays = i.getFrequencyDays();

                    // Backend can't distinguish "not provided" vs "0" because request DTO uses
                    // primitive int.
                    // So we interpret "0/0" as "not set", and apply system defaults by
                    // reminderType.
                    if (startOffsetDays == 0 && endOffsetDays == 0) {
                        if ("DEADLINE_REMINDER".equals(i.getReminderType())) {
                            startOffsetDays = 3;
                            endOffsetDays = 0;
                        } else if ("FOLLOW_UP_APPLIED".equals(i.getReminderType())) {
                            startOffsetDays = 7;
                            endOffsetDays = 14;
                        } else if ("INTERVIEW_PREP".equals(i.getReminderType())) {
                            startOffsetDays = 2;
                            endOffsetDays = 0;
                        }
                    }

                    if (frequencyDays == 0) {
                        frequencyDays = 1;
                    }

                    return ReminderSetting.builder()
                            .user(user)
                            .jobStatus(i.getJobStatus())
                            .reminderType(i.getReminderType())
                            .enabled(i.isEnabled())
                            .startOffsetDays(startOffsetDays)
                            .endOffsetDays(endOffsetDays)
                            .frequencyDays(frequencyDays)
                            .build();
                })
                .collect(Collectors.toList());

        if (!toSave.isEmpty()) {
            reminderSettingRepository.saveAll(toSave);
        }
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            throw new TrackifyException(ErrorCode.UNAUTHORIZED, 401, "Unauthorized");
        }

        Object principal = authentication.getPrincipal();
        String email = principal != null ? principal.toString() : null;

        if (email == null || email.isBlank()) {
            throw new TrackifyException(ErrorCode.UNAUTHORIZED, 401, "Unauthorized");
        }

        return userRepository.findByEmail(email).orElseThrow(
                () -> new TrackifyException(ErrorCode.UNAUTHORIZED, 401, "User not found"));
    }
}
