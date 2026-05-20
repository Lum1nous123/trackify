package vn.lum1nous.trackify.service.reminder;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.lum1nous.trackify.entity.Job;
import vn.lum1nous.trackify.entity.JobStatusHistory;
import vn.lum1nous.trackify.entity.ReminderLog;
import vn.lum1nous.trackify.entity.ReminderSetting;
import vn.lum1nous.trackify.entity.User;
import vn.lum1nous.trackify.domain.job.JobStatus;
import vn.lum1nous.trackify.repository.JobRepository;
import vn.lum1nous.trackify.repository.JobStatusHistoryRepository;
import vn.lum1nous.trackify.repository.ReminderLogRepository;
import vn.lum1nous.trackify.repository.ReminderSettingRepository;
import vn.lum1nous.trackify.repository.UserRepository;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReminderSchedulerService {

    private final ReminderSettingRepository reminderSettingRepository;
    private final ReminderLogRepository reminderLogRepository;
    private final JobRepository jobRepository;
    private final JobStatusHistoryRepository jobStatusHistoryRepository;
    private final UserRepository userRepository;
    private final ReminderEmailService reminderEmailService;

    /**
     * MVP: run once/day (server timezone).
     * 09:00 local server time.
     */
    @Scheduled(cron = "0 0 9 * * *")
    public void runDailyReminders() {
        ZoneId zone = ZoneId.systemDefault();
        LocalDate today = LocalDate.now(zone);
        triggerForToday(today);
    }

    @Transactional
    public void triggerForToday(LocalDate today) {
        if (today == null)
            return;

        List<ReminderSetting> allSettings = reminderSettingRepository.findAll();

        // Group by userId
        Map<UUID, List<ReminderSetting>> byUser = new HashMap<>();
        for (ReminderSetting s : allSettings) {
            if (s == null)
                continue;
            if (!s.isEnabled())
                continue;
            if (s.getUser() == null)
                continue;
            if (s.getJobStatus() == null || s.getJobStatus().isBlank())
                continue;
            if (s.getReminderType() == null || s.getReminderType().isBlank())
                continue;

            UUID userId = s.getUser().getId();
            byUser.computeIfAbsent(userId, k -> new java.util.ArrayList<>()).add(s);
        }

        for (Map.Entry<UUID, List<ReminderSetting>> e : byUser.entrySet()) {
            UUID userId = e.getKey();
            List<ReminderSetting> rules = e.getValue();

            User user = userRepository.findById(userId).orElse(null);
            if (user == null)
                continue;

            List<Job> jobs = jobRepository.findByUserId(userId);

            for (ReminderSetting rule : rules) {
                evaluateRuleForUserAndJobs(today, user, rule, jobs);
            }
        }
    }

    private void evaluateRuleForUserAndJobs(
            LocalDate today,
            User user,
            ReminderSetting rule,
            List<Job> jobs) {
        if (jobs == null || jobs.isEmpty())
            return;

        String ruleJobStatus = rule.getJobStatus();

        for (Job job : jobs) {
            if (job == null)
                continue;

            // Only consider jobs currently in the selected status
            if (job.getStatus() == null || !job.getStatus().equals(ruleJobStatus)) {
                continue;
            }

            LocalDate triggerDate = computeTriggerDate(today, user, job, rule);
            if (triggerDate == null)
                continue;

            // Dedupe: job+user+reminderType+triggerDate
            boolean exists = reminderLogRepository.existsByJob_IdAndUser_IdAndReminderTypeAndTriggerDate(
                    job.getId(),
                    user.getId(),
                    rule.getReminderType(),
                    today);

            if (exists)
                continue;

            ReminderLog reminderLog = ReminderLog.builder()
                    .job(job)
                    .user(user)
                    .reminderType(rule.getReminderType())
                    .sentAt(Instant.now())
                    .triggerDate(today)
                    .build();

            reminderLogRepository.save(reminderLog);

            try {
                reminderEmailService.sendReminderEmail(reminderLog);
            } catch (Exception ex) {
                log.error(
                        "Failed to send reminder email. reminderLogId={} userEmail={} reminderType={}",
                        reminderLog.getId(),
                        reminderLog.getUser() != null ? reminderLog.getUser().getEmail() : null,
                        reminderLog.getReminderType(),
                        ex);
            }

            log.info("ReminderLog created: userId={} jobId={} type={} triggerDate={}",
                    user.getId(), job.getId(), rule.getReminderType(), today);
        }
    }

    /**
     * Returns whether today is within the rule window and based on rule type data
     * source.
     * If eligible => returns today, else null.
     */
    private LocalDate computeTriggerDate(
            LocalDate today,
            User user,
            Job job,
            ReminderSetting rule) {
        String jobStatus = rule.getJobStatus();

        int startOffsetDays = rule.getStartOffsetDays();
        int endOffsetDays = rule.getEndOffsetDays();

        // Window: [todayOffsetStart..todayOffsetEnd] relative to a base date.
        // Rule says: user sets start/end offsets as "days before today" effectively:
        // We'll interpret the window as:
        // - for baseDate: trigger if today in [baseDate - startOffsetDays, baseDate -
        // endOffsetDays]
        // but for APPLIED baseDate we use transition date t0 directly.
        //
        // So we always compute:
        // windowStart = baseDate.minusDays(startOffsetDays)
        // windowEnd = baseDate.minusDays(endOffsetDays)
        // (both inclusive)
        LocalDate baseDate = null;

        if (JobStatus.SAVED.name().equals(jobStatus)) {
            baseDate = job.getDeadline();
        } else if (JobStatus.APPLIED.name().equals(jobStatus)) {
            baseDate = getLatestTransitionDate(job.getId(), "APPLIED");
        } else if (JobStatus.INTERVIEW.name().equals(jobStatus)) {
            baseDate = job.getInterviewAt();
        } else {
            // MVP: only handle SAVED/APPLIED/INTERVIEW
            return null;
        }

        if (baseDate == null)
            return null;

        LocalDate windowStart = baseDate.minusDays(startOffsetDays);
        LocalDate windowEnd = baseDate.minusDays(endOffsetDays);

        if (windowStart.isAfter(windowEnd)) {
            // If user inverted offsets, normalize
            LocalDate tmp = windowStart;
            windowStart = windowEnd;
            windowEnd = tmp;
        }

        if (today.isBefore(windowStart) || today.isAfter(windowEnd)) {
            return null;
        }

        return today;
    }

    private LocalDate getLatestTransitionDate(UUID jobId, String toStatus) {
        if (jobId == null || toStatus == null)
            return null;

        List<JobStatusHistory> histories = jobStatusHistoryRepository.findByJobIdOrderByChangedAtDesc(jobId);
        if (histories == null || histories.isEmpty())
            return null;

        for (JobStatusHistory h : histories) {
            if (h == null)
                continue;
            if (h.getToStatus() != null && h.getToStatus().equals(toStatus)) {
                Instant changedAt = h.getChangedAt();
                if (changedAt == null)
                    return null;

                ZoneId zone = ZoneId.systemDefault();
                return changedAt.atZone(zone).toLocalDate();
            }
        }
        return null;
    }
}
