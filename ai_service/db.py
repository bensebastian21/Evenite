"""
SQLite persistence layer for GenLoop AI service.
Tables: prompt_templates, generation_runs, content_variants, analytics_events
"""

import sqlite3
import json
import uuid
from pathlib import Path
from datetime import datetime, timezone
from contextlib import contextmanager

DB_PATH = Path(__file__).parent / "genloop.db"


def get_conn():
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


@contextmanager
def tx():
    conn = get_conn()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db():
    with tx() as conn:
        conn.executescript("""
        CREATE TABLE IF NOT EXISTS prompt_templates (
            template_id     TEXT PRIMARY KEY,
            tone            TEXT NOT NULL,
            prompt_text     TEXT NOT NULL,
            avg_viral_score REAL DEFAULT 0,
            usage_count     INTEGER DEFAULT 0,
            created_at      TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS generation_runs (
            run_id              TEXT PRIMARY KEY,
            event_id            TEXT,
            host_id             TEXT,
            variant_count       INTEGER DEFAULT 1,
            status              TEXT DEFAULT 'in_progress',
            prompt_template_id  TEXT,
            loop_iteration      INTEGER DEFAULT 1,
            created_at          TEXT DEFAULT (datetime('now')),
            completed_at        TEXT
        );

        CREATE TABLE IF NOT EXISTS content_variants (
            variant_id              TEXT PRIMARY KEY,
            run_id                  TEXT NOT NULL,
            event_id                TEXT,
            host_id                 TEXT,
            prompt_template_id      TEXT,
            poster_url              TEXT,
            image_fallback          INTEGER DEFAULT 0,
            text_copy               TEXT DEFAULT '{}',
            tone                    TEXT DEFAULT 'Professional',
            predicted_viral_score   INTEGER DEFAULT 0,
            status                  TEXT DEFAULT 'active',
            impressions             INTEGER DEFAULT 0,
            clicks                  INTEGER DEFAULT 0,
            shares                  INTEGER DEFAULT 0,
            registrations           INTEGER DEFAULT 0,
            ctr                     REAL DEFAULT 0,
            share_rate              REAL DEFAULT 0,
            reg_conv_rate           REAL DEFAULT 0,
            created_at              TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS analytics_events (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            variant_id      TEXT NOT NULL,
            event_id        TEXT,
            signal          TEXT NOT NULL,
            dedupe_key      TEXT,
            source          TEXT DEFAULT 'direct',
            created_at      TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS ml_weights (
            id      INTEGER PRIMARY KEY CHECK (id = 1),
            weights TEXT NOT NULL,
            mae     REAL DEFAULT 999,
            updated_at TEXT DEFAULT (datetime('now'))
        );

        CREATE UNIQUE INDEX IF NOT EXISTS idx_analytics_dedupe ON analytics_events(dedupe_key)
            WHERE dedupe_key IS NOT NULL;
        """)
    print("[DB] Initialized")
