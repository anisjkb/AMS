BEGIN;

-- Running upgrade 24ecddc8ffc5 -> b599332dee15

CREATE TABLE exit_meeting_minutes (
    minute_id SERIAL NOT NULL, 
    meeting_id INTEGER NOT NULL, 
    chairman_participant_id INTEGER NOT NULL, 
    is_locked BOOLEAN DEFAULT false NOT NULL, 
    locked_at TIMESTAMP WITH TIME ZONE, 
    locked_by_user_id VARCHAR(100), 
    template_key VARCHAR(100), 
    template_version VARCHAR(20), 
    snapshot_version INTEGER DEFAULT 1 NOT NULL, 
    snapshot_data JSONB, 
    snapshot_hash VARCHAR(64), 
    status VARCHAR(20) DEFAULT 'active' NOT NULL, 
    is_active BOOLEAN DEFAULT true NOT NULL, 
    created_by VARCHAR(100), 
    updated_by VARCHAR(100), 
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL, 
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL, 
    CONSTRAINT pk_exit_meeting_minutes PRIMARY KEY (minute_id), 
    CONSTRAINT fk_exit_meeting_minutes_meeting_id_meeting_master FOREIGN KEY(meeting_id) REFERENCES meeting_master (meeting_id) ON DELETE RESTRICT, 
    CONSTRAINT fk_exit_minute_chairman_participant FOREIGN KEY(chairman_participant_id) REFERENCES meeting_participants (participant_id) ON DELETE RESTRICT
);

CREATE INDEX ix_exit_meeting_minutes_minute_id ON exit_meeting_minutes (minute_id);

CREATE INDEX ix_exit_meeting_minutes_meeting_id ON exit_meeting_minutes (meeting_id);

CREATE INDEX ix_exit_meeting_minutes_chairman_participant_id ON exit_meeting_minutes (chairman_participant_id);

CREATE INDEX ix_exit_meeting_minutes_locked_by_user_id ON exit_meeting_minutes (locked_by_user_id);

CREATE INDEX ix_exit_meeting_minutes_status ON exit_meeting_minutes (status);

ALTER TABLE entrance_meeting_minutes ADD COLUMN is_locked BOOLEAN DEFAULT false NOT NULL;

ALTER TABLE entrance_meeting_minutes ADD COLUMN locked_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE entrance_meeting_minutes ADD COLUMN locked_by_user_id VARCHAR(100);

ALTER TABLE entrance_meeting_minutes ADD COLUMN template_key VARCHAR(100);

ALTER TABLE entrance_meeting_minutes ADD COLUMN template_version VARCHAR(20);

ALTER TABLE entrance_meeting_minutes ADD COLUMN snapshot_version INTEGER DEFAULT 1 NOT NULL;

ALTER TABLE entrance_meeting_minutes ADD COLUMN snapshot_data JSONB;

ALTER TABLE entrance_meeting_minutes ADD COLUMN snapshot_hash VARCHAR(64);

CREATE INDEX ix_entrance_meeting_minutes_locked_by_user_id ON entrance_meeting_minutes (locked_by_user_id);

ALTER TABLE meeting_master ADD COLUMN audit_id INTEGER;

CREATE INDEX ix_meeting_master_audit_id ON meeting_master (audit_id);

ALTER TABLE meeting_master ADD CONSTRAINT fk_meeting_master_audit_id_audit_master FOREIGN KEY(audit_id) REFERENCES audit_master (audit_id) ON DELETE RESTRICT;

UPDATE alembic_version SET version_num='b599332dee15' WHERE alembic_version.version_num = '24ecddc8ffc5';

COMMIT;

