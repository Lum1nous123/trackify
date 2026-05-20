package vn.lum1nous.trackify.controller;

import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.lum1nous.trackify.dto.response.ReminderLogResponse;
import vn.lum1nous.trackify.error.ApiResponse;
import vn.lum1nous.trackify.service.reminder.ReminderLogsService;

@RestController
@RequestMapping("/api/reminder-logs")
@Validated
@RequiredArgsConstructor
public class ReminderLogsController {

    private final ReminderLogsService reminderLogsService;

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<List<ReminderLogResponse>> getLogs(
            @RequestParam(name = "limit", defaultValue = "20") int limit) {
        List<ReminderLogResponse> logs = reminderLogsService.getCurrentUserLogs(limit);
        return ApiResponse.success(200, logs);
    }
}
