package vn.lum1nous.trackify.controller;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.lum1nous.trackify.dto.request.UpsertReminderSettingsItemRequest;
import vn.lum1nous.trackify.dto.response.ReminderSettingResponse;
import vn.lum1nous.trackify.entity.ReminderSetting;
import vn.lum1nous.trackify.error.ApiResponse;
import vn.lum1nous.trackify.service.reminder.ReminderSettingsService;

@RestController
@RequestMapping("/api/reminder-settings")
@Validated
@RequiredArgsConstructor
public class ReminderSettingsController {

    private final ReminderSettingsService reminderSettingsService;

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<List<ReminderSettingResponse>> getSettings() {
        List<ReminderSetting> items = reminderSettingsService.getCurrentUserSettings();
        List<ReminderSettingResponse> res = items.stream()
                .map(this::toResponse)
                .toList();
        return ApiResponse.success(200, res);
    }

    @PutMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<String> upsert(
            @Valid @RequestBody List<UpsertReminderSettingsItemRequest> items) {
        reminderSettingsService.upsertSettings(items);
        return ApiResponse.success(200, "OK");
    }

    private ReminderSettingResponse toResponse(ReminderSetting s) {
        ReminderSettingResponse r = new ReminderSettingResponse();
        r.setId(s.getId());
        r.setJobStatus(s.getJobStatus());
        r.setReminderType(s.getReminderType());
        r.setEnabled(s.isEnabled());
        r.setStartOffsetDays(s.getStartOffsetDays());
        r.setEndOffsetDays(s.getEndOffsetDays());
        r.setFrequencyDays(s.getFrequencyDays());
        r.setCreatedAt(s.getCreatedAt());
        r.setUpdatedAt(s.getUpdatedAt());
        return r;
    }
}
