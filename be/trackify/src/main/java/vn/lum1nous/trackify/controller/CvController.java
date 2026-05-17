package vn.lum1nous.trackify.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import vn.lum1nous.trackify.dto.response.CvActiveResponse;
import vn.lum1nous.trackify.dto.response.CvUploadResponse;
import vn.lum1nous.trackify.error.ApiResponse;
import vn.lum1nous.trackify.service.cv.CvService;

@RestController
@RequestMapping("/api/cvs")
@Validated
@RequiredArgsConstructor
public class CvController {

    private final CvService cvService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<CvUploadResponse> uploadCv(
            @RequestPart(name = "cv") MultipartFile cvFile) {
        CvUploadResponse response = cvService.uploadCv(cvFile);
        return ApiResponse.success(200, response);
    }

    @GetMapping("/active")
    public ApiResponse<CvActiveResponse> getActiveCv() {
        CvActiveResponse activeCv = cvService.getActiveCv();
        return ApiResponse.success(200, activeCv);
    }
}
