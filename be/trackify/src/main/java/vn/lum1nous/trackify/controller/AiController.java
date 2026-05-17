package vn.lum1nous.trackify.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import java.util.UUID;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.lum1nous.trackify.dto.request.AnalyzeJobCvRequest;
import vn.lum1nous.trackify.dto.response.AiAnalysisResponse;
import vn.lum1nous.trackify.error.ApiResponse;
import vn.lum1nous.trackify.service.ai.AiAnalysisService;

@RestController
@RequestMapping("/api/ai")
@Validated
@RequiredArgsConstructor
@Slf4j
public class AiController {

    private final AiAnalysisService aiAnalysisService;

    @PostMapping(value = "/analyze", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<AiAnalysisResponse> analyzeJobCv(@Valid @RequestBody AnalyzeJobCvRequest request) {
        AiAnalysisResponse response = aiAnalysisService.analyzeJobCv(request.getJobId(), request.getCvId());
        return ApiResponse.success(200, response);
    }
}
