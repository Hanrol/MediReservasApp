CREATE TABLE notifications (
    notification_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    notification_template_id BIGINT,
    notification_channel VARCHAR(30) NOT NULL,
    notification_title VARCHAR(100) NOT NULL,
    notification_message TEXT NOT NULL,
    notification_status VARCHAR(80) NOT NULL DEFAULT 'PENDING',
    sent_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notifications_template
        FOREIGN KEY (notification_template_id)
        REFERENCES notification_templates(notification_template_id)
);