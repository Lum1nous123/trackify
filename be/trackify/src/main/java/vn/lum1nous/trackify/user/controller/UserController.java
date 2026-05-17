package vn.lum1nous.trackify.user.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import vn.lum1nous.trackify.auth.dto.MeResponse;
import vn.lum1nous.trackify.error.ApiResponse;
import vn.lum1nous.trackify.user.service.UserService;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PatchMapping(path = "/me", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<MeResponse> updateMe(
            @RequestParam(name = "fullName", required = false) String fullName,
            @RequestPart(name = "avatar", required = false) MultipartFile avatar) {

        String normalizedFullName = fullName != null ? fullName.trim() : null;
        return ApiResponse.success(200, userService.updateMe(normalizedFullName, avatar));
    }
}
