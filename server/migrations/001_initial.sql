-- Stats are running totals so a profile is a single row read.
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 40),
  email         TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  wins          INTEGER NOT NULL DEFAULT 0,
  games_played  INTEGER NOT NULL DEFAULT 0,
  total_moves   INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX users_email_lower_idx ON users (lower(email));

-- Only a SHA-256 of each token is stored, so a DB leak exposes no working tokens.
CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX sessions_user_idx ON sessions (user_id);

CREATE TABLE games (
  id          SERIAL PRIMARY KEY,
  mode        TEXT NOT NULL CHECK (mode IN ('ai', 'online')),
  difficulty  TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  x_user_id   INTEGER REFERENCES users (id) ON DELETE SET NULL,
  o_user_id   INTEGER REFERENCES users (id) ON DELETE SET NULL,
  x_name      TEXT,
  o_name      TEXT,
  winner      TEXT NOT NULL CHECK (winner IN ('X', 'O', 'draw')),
  move_count  INTEGER NOT NULL DEFAULT 0,
  finished_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX games_x_user_idx ON games (x_user_id);
CREATE INDEX games_o_user_idx ON games (o_user_id);

CREATE TABLE messages (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  body       TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE replies (
  id         SERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL REFERENCES messages (id) ON DELETE CASCADE,
  user_id    INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  body       TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX replies_message_idx ON replies (message_id);

-- One vote per user per message: 1 = like, -1 = dislike
CREATE TABLE message_votes (
  message_id INTEGER NOT NULL REFERENCES messages (id) ON DELETE CASCADE,
  user_id    INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  vote       SMALLINT NOT NULL CHECK (vote IN (1, -1)),
  PRIMARY KEY (message_id, user_id)
);
