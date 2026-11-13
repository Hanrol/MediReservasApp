CREATE TABLE admin_invitations (
    invitation_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    role_name VARCHAR(30) NOT NULL,
    token_hash CHAR(64) NOT NULL UNIQUE,
    invited_by_email VARCHAR(100) NOT NULL,
    expires_at DATETIME NOT NULL,
    accepted_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_admin_invitations_email (email),
    INDEX idx_admin_invitations_pending (accepted_at, expires_at)
);
