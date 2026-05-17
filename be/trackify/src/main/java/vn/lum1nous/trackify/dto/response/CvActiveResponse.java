package vn.lum1nous.trackify.dto.response;

import java.time.Instant;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CvActiveResponse {

    private UUID cvId;

    private String fileUrl;

    private Instant uploadedAt;
}
