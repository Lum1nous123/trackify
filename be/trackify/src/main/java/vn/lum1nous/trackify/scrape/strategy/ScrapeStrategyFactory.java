package vn.lum1nous.trackify.scrape.strategy;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import vn.lum1nous.trackify.error.ErrorCode;
import vn.lum1nous.trackify.error.TrackifyException;

@Component
@RequiredArgsConstructor
public class ScrapeStrategyFactory {

    private final List<ScrapeStrategy> strategies;

    public ScrapeStrategy getStrategy(String url) {
        return strategies.stream()
                .filter(s -> s.supports(url))
                .findFirst()
                .orElseThrow(() -> new TrackifyException(
                        ErrorCode.BAD_REQUEST,
                        400,
                        "Unsupported job site: " + url));
    }
}
