package vn.lum1nous.trackify.scrape;

public class JobPostingFields {

    private final String jobTitle;
    private final String companyName;
    private final String jobLocation;
    private final String salaryText;
    private final String jobDescription;

    public JobPostingFields(
            String jobTitle,
            String companyName,
            String jobLocation,
            String salaryText,
            String jobDescription) {
        this.jobTitle = jobTitle;
        this.companyName = companyName;
        this.jobLocation = jobLocation;
        this.salaryText = salaryText;
        this.jobDescription = jobDescription;
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
}
