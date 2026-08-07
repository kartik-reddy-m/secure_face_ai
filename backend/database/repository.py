"""SQLite storage for locally registered face embeddings."""

from __future__ import annotations

import sqlite3
from pathlib import Path

import numpy as np

DATABASE_PATH = Path(__file__).resolve().parent / "face_users.db"


def initialize_database() -> None:
    """Create the registrations table if it does not yet exist."""
    with sqlite3.connect(DATABASE_PATH) as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS registrations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE COLLATE NOCASE,
                embedding BLOB NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )


def save_registration(name: str, embedding: np.ndarray) -> int:
    """Save one normalized embedding and return its registration ID."""
    with sqlite3.connect(DATABASE_PATH) as connection:
        cursor = connection.execute(
            "INSERT INTO registrations (name, embedding) VALUES (?, ?)",
            (name, embedding.astype(np.float32).tobytes()),
        )
        return int(cursor.lastrowid)


def get_registrations() -> list[tuple[int, str, np.ndarray]]:
    """Return all stored registrations and their face descriptors."""
    with sqlite3.connect(DATABASE_PATH) as connection:
        rows = connection.execute(
            "SELECT id, name, embedding FROM registrations"
        ).fetchall()
    return [
        (int(registration_id), name, np.frombuffer(embedding, dtype=np.float32))
        for registration_id, name, embedding in rows
    ]
