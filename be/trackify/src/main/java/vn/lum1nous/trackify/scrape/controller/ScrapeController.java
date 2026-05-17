package vn.lum1nous.trackify.scrape.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.lum1nous.trackify.error.ApiResponse;
import vn.lum1nous.trackify.scrape.ScrapeResult;
import vn.lum1nous.trackify.scrape.ScrapeService;

@RestController
@RequestMapping("/api/scrape")
@RequiredArgsConstructor
public class ScrapeController {

    private final ScrapeService scrapeService;

    @GetMapping
    public ApiResponse<ScrapeResult> scrape(@RequestParam(name = "url") String url) {
        ScrapeResult result = scrapeService.scrapePage(url);
        return ApiResponse.success(200, result);
    }
}
