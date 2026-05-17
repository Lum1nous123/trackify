package vn.lum1nous.trackify.dto.response;

import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CvUploadResponse {

    private UUID cvId;

    private String fileUrl;
}
