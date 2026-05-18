package vn.lum1nous.trackify.scrape.strategy;

import vn.lum1nous.trackify.scrape.ScrapeResult;

public interface ScrapeStrategy {
    boolean supports(String url);

    ScrapeResult scrape(String url);
}
