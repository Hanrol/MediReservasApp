CREATE TABLE notification_templates (
    notification_template_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    template_code VARCHAR(80) NOT NULL UNIQUE,
    template_title VARCHAR(100) NOT NULL,
    template_body TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);