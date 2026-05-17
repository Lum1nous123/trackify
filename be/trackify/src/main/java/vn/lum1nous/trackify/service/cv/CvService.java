package vn.lum1nous.trackify.service.cv;

import org.springframework.web.multipart.MultipartFile;
import vn.lum1nous.trackify.dto.response.CvActiveResponse;
import vn.lum1nous.trackify.dto.response.CvUploadResponse;

public interface CvService {

    CvUploadResponse uploadCv(MultipartFile cvFile);

    CvActiveResponse getActiveCv();
}
