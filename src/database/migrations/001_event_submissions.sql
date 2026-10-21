-- event_submissions: normalized inscriptions/assists with a monotonic append order (seq).
-- IMPORTANT: event_id MUST match events.id charset AND collation exactly or the FK fails. The
-- migration runner (002) reads `SHOW FULL COLUMNS FROM events LIKE 'id'` and rewrites the CHARACTER
-- SET / COLLATE below to the effective values before executing. The utf8mb4 / utf8mb4_0900_ai_ci
-- here is the MySQL-8 default assumption.
CREATE TABLE IF NOT EXISTS event_submissions (
  seq        BIGINT NOT NULL AUTO_INCREMENT,
  id         VARCHAR(255) NOT NULL,
  event_id   VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  type       ENUM('inscription','assist') NOT NULL,
  data       JSON NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (seq),
  UNIQUE KEY uq_submission_id (id),
  CONSTRAINT fk_event_submissions_event FOREIGN KEY (event_id)
    REFERENCES events(id) ON DELETE CASCADE,
  KEY idx_event_type_seq (event_id, type, seq)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
