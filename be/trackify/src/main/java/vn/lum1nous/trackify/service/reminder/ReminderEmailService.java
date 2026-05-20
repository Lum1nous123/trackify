package vn.lum1nous.trackify.service.reminder;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import vn.lum1nous.trackify.entity.ReminderLog;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReminderEmailService {

    private final JavaMailSender javaMailSender;

    @Value("${trackify.reminder.email.enabled:true}")
    private boolean emailEnabled;

    public void sendReminderEmail(ReminderLog reminderLog) {
        if (!emailEnabled) {
            log.info(
                    "Reminder email disabled. Skip send. reminderType={} user={}",
                    reminderLog != null ? reminderLog.getReminderType() : null,
                    reminderLog != null && reminderLog.getUser() != null ? reminderLog.getUser().getEmail() : null);
            return;
        }

        if (reminderLog == null)
            return;

        String to = reminderLog.getUser() != null ? reminderLog.getUser().getEmail() : null;
        if (to == null || to.isBlank()) {
            log.warn(
                    "Reminder email skipped: missing user email. reminderLogId={}",
                    reminderLog.getId());
            return;
        }

        String subject = "[Trackify] Reminder: " + safeType(reminderLog.getReminderType());
        String body = buildBody(reminderLog);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);

        javaMailSender.send(message);

        log.info("Reminder email sent. reminderLogId={} to={} reminderType={}",
                reminderLog.getId(), to, reminderLog.getReminderType());
    }

    private String buildBody(ReminderLog log) {
        String reminderType = safeType(log.getReminderType());
        String company = log.getJob() != null ? safeNullable(log.getJob().getCompanyName()) : "—";
        String position = log.getJob() != null ? safeNullable(log.getJob().getPosition()) : "—";

        String triggerDate = log.getTriggerDate() != null ? log.getTriggerDate().toString() : "—";

        return "Hi,\n\n"
                + "Trackify has a reminder for you.\n\n"
                + "Type: " + reminderType + "\n"
                + "Company: " + company + "\n"
                + "Position: " + position + "\n"
                + "Trigger date: " + triggerDate + "\n\n"
                + "Sent at: " + (log.getSentAt() != null ? log.getSentAt().toString() : "—") + "\n\n"
                + "— Trackify";
    }

    private String safeType(String value) {
        return (value == null || value.isBlank()) ? "REMINDER" : value;
    }

    private String safeNullable(String value) {
        return (value == null || value.isBlank()) ? "—" : value;
    }
}
