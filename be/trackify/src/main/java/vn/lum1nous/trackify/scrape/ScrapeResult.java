package vn.lum1nous.trackify.scrape;

import java.time.LocalDate;
import java.util.List;

public class ScrapeResult {
    private final String url;
    private final String title;
    private final String metaDescription;
    private final String ogTitle;
    private final String ogDescription;
    private final String canonicalUrl;
    private final int jsonLdCount;
    private final List<String> jsonLdSamples;

    // Job-specific fields extracted from JSON-LD (schema.org JobPosting) when
    // available
    private final String jobTitle;
    private final String companyName;
    private final String jobLocation;
    private final String salaryText;
    private final String jobDescription;

    // Best-effort fields parsed from HTML
    private final String companyLogoUrl;
    private final LocalDate jobDeadline;

    public ScrapeResult(
            String url,
            String title,
            String metaDescription,
            String ogTitle,
            String ogDescription,
            String canonicalUrl,
            int jsonLdCount,
            List<String> jsonLdSamples,
            String jobTitle,
            String companyName,
            String jobLocation,
            String salaryText,
            String jobDescription,
            String companyLogoUrl,
            LocalDate jobDeadline) {
        this.url = url;
        this.title = title;
        this.metaDescription = metaDescription;
        this.ogTitle = ogTitle;
        this.ogDescription = ogDescription;
        this.canonicalUrl = canonicalUrl;
        this.jsonLdCount = jsonLdCount;
        this.jsonLdSamples = jsonLdSamples;
        this.jobTitle = jobTitle;
        this.companyName = companyName;
        this.jobLocation = jobLocation;
        this.salaryText = salaryText;
        this.jobDescription = jobDescription;
        this.companyLogoUrl = companyLogoUrl;
        this.jobDeadline = jobDeadline;
    }

    public String getUrl() {
        return url;
    }

    public String getTitle() {
        return title;
    }

    public String getMetaDescription() {
        return metaDescription;
    }

    public String getOgTitle() {
        return ogTitle;
    }

    public String getOgDescription() {
        return ogDescription;
    }

    public String getCanonicalUrl() {
        return canonicalUrl;
    }

    public int getJsonLdCount() {
        return jsonLdCount;
    }

    public List<String> getJsonLdSamples() {
        return jsonLdSamples;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public String getCompanyName() {
        return companyName;
    }

    public String getJobLocation() {
        return jobLocation;
    }

    public String getSalaryText() {
        return salaryText;
    }

    public String getJobDescription() {
        return jobDescription;
    }

    public String getCompanyLogoUrl() {
        return companyLogoUrl;
    }

    public LocalDate getJobDeadline() {
        return jobDeadline;
    }
}
