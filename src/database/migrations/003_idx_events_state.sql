-- Speed-only index on events.state (audit-justified). Changes query speed, not results.
CREATE INDEX idx_events_state ON events (state);
