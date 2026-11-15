ALTER TABLE admin_invitations
    ADD COLUMN canceled_at DATETIME NULL AFTER accepted_at;

CREATE INDEX idx_admin_invitations_canceled ON admin_invitations (canceled_at, accepted_at);
