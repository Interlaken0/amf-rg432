CREATE TABLE IF NOT EXISTS tests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  board_id INTEGER NOT NULL,
  operator TEXT NOT NULL,
  tested_at TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pass', 'fail', 'pending')),
  diagnostics TEXT,
  FOREIGN KEY (board_id) REFERENCES boards(id)
);
