package vn.lum1nous.trackify.service.cv;

import java.io.IOException;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import vn.lum1nous.trackify.error.ErrorCode;
import vn.lum1nous.trackify.error.TrackifyException;

@Component
public class PdfBoxCvTextExtractor {

    public String extractTextFromPdf(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new TrackifyException(ErrorCode.CV_MISSING, 400, "CV file is missing");
        }

        if (file.getContentType() == null || !file.getContentType().equals("application/pdf")) {
            throw new TrackifyException(ErrorCode.CV_INVALID, 400, "CV must be a PDF file");
        }

        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);

            String trimmed = text == null ? null : text.trim();
            if (trimmed == null || trimmed.isBlank()) {
                throw new TrackifyException(
                        ErrorCode.CV_EXTRACT_FAILED,
                        400,
                        "Failed to extract CV text (empty result)");
            }

            return text;
        } catch (TrackifyException ex) {
            throw ex;
        } catch (IOException ex) {
            throw new TrackifyException(
                    ErrorCode.CV_EXTRACT_FAILED,
                    500,
                    "Cannot extract PDF text",
                    java.util.Map.of("cause", ex.getMessage()));
        } catch (Exception ex) {
            throw new TrackifyException(
                    ErrorCode.CV_EXTRACT_FAILED,
                    500,
                    "Cannot extract PDF text",
                    java.util.Map.of("cause", ex.getMessage()));
        }
    }
}
