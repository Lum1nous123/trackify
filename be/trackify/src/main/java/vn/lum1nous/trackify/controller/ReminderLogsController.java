package vn.lum1nous.trackify.controller;

import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
            @RequestParam(name = "limit", defaultValue = "20") int limit,
            @RequestParam(name = "offset", defaultValue = "0") int offset) {
        List<ReminderLogResponse> logs = reminderLogsService.getCurrentUserLogs(limit, offset);
        return ApiResponse.success(200, logs);
    }

    @GetMapping(value = "/unread", produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<List<ReminderLogResponse>> getUnreadLogs(
            @RequestParam(name = "limit", defaultValue = "10") int limit,
            @RequestParam(name = "offset", defaultValue = "0") int offset) {
        List<ReminderLogResponse> logs = reminderLogsService.getCurrentUnreadLogs(limit, offset);
        return ApiResponse.success(200, logs);
    }

    @GetMapping(value = "/unread/count", produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<Long> getUnreadCount() {
        long count = reminderLogsService.getCurrentUnreadCount();
        return ApiResponse.success(200, count);
    }

    @PostMapping(value = "/unread/mark-read", produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<Integer> markUnreadAsRead() {
        int marked = reminderLogsService.markCurrentUserAllUnreadAsRead();
        return ApiResponse.success(200, marked);
    }
}
