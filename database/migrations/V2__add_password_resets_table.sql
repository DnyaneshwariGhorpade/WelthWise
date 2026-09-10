-- ==================================================================
-- WealthWise — V2: Password-reset tokens (supports forgot-password flow)
-- ==================================================================

CREATE TABLE password_resets (
  reset_id    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     BIGINT       NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  token_hash  VARCHAR(255) NOT NULL,
  expires_at  TIMESTAMP    NOT NULL,
  used        BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_password_resets_token ON password_resets(token_hash) WHERE used = FALSE;
CREATE INDEX idx_password_resets_user ON password_resets(user_id, created_at DESC);
