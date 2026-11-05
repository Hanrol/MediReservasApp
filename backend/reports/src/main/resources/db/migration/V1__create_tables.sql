CREATE TABLE report_requests (
    report_request_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    report_type VARCHAR(80) NOT NULL,
    requested_by_user_id BIGINT NOT NULL,
    start_date DATE,
    end_date DATE,
    request_status VARCHAR(30) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE generated_reports (
    generated_report_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    report_request_id BIGINT,
    generated_by_user_id BIGINT NOT NULL,
    report_type VARCHAR(80) NOT NULL,
    generated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    report_format VARCHAR(20) NOT NULL,
    file_path VARCHAR(255),
    report_status VARCHAR(30) NOT NULL,

    CONSTRAINT fk_generated_reports_report_request
        FOREIGN KEY (report_request_id)
        REFERENCES report_requests(report_request_id)
);