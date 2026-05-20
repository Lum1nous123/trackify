package vn.lum1nous.trackify.service.reminder;

import java.util.List;
import java.util.UUID;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.lum1nous.trackify.dto.response.ReminderLogResponse;
import vn.lum1nous.trackify.entity.ReminderLog;
import vn.lum1nous.trackify.entity.User;
import vn.lum1nous.trackify.error.ErrorCode;
import vn.lum1nous.trackify.error.TrackifyException;
import vn.lum1nous.trackify.repository.ReminderLogRepository;
import vn.lum1nous.trackify.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class ReminderLogsService {

    private final ReminderLogRepository reminderLogRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ReminderLogResponse> getCurrentUserLogs(int limit) {
        if (limit <= 0) {
            throw new TrackifyException(ErrorCode.BAD_REQUEST, 400, "limit must be > 0");
        }

        User user = getCurrentUser();

        List<ReminderLog> logs = reminderLogRepository.findByUser_IdOrderByTriggerDateDesc(
                user.getId(),
                PageRequest.of(0, Math.min(limit, 100)));

        return logs.stream()
                .map(this::toResponse)
                .toList();
    }

    private ReminderLogResponse toResponse(ReminderLog log) {
        ReminderLogResponse res = new ReminderLogResponse();
        res.setId(log.getId());
        res.setJobId(log.getJob() != null ? log.getJob().getId() : null);
        res.setUserId(log.getUser() != null ? log.getUser().getId() : null);
        res.setReminderType(log.getReminderType());
        res.setTriggerDate(log.getTriggerDate());
        res.setSentAt(log.getSentAt());

        if (log.getJob() != null) {
            res.setCompanyName(log.getJob().getCompanyName());
            res.setPosition(log.getJob().getPosition());
        }
        return res;
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
