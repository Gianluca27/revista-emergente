-- Revista Emergente — Schema inicial
-- PostgreSQL 15

CREATE TABLE users (
  id          SERIAL PRIMARY KEY,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE categories (
  id    SERIAL PRIMARY KEY,
  slug  VARCHAR(100) UNIQUE NOT NULL,
  name  VARCHAR(100) NOT NULL
);

CREATE TABLE publications (
  id           SERIAL PRIMARY KEY,
  slug         VARCHAR(255) UNIQUE NOT NULL,
  title        VARCHAR(255) NOT NULL,
  subtitle     VARCHAR(255),
  category_id  INTEGER REFERENCES categories(id),
  status       VARCHAR(20) DEFAULT 'draft',
  cover_image  VARCHAR(500),
  body         TEXT,
  published_at TIMESTAMP,
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE artists (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(255) NOT NULL,
  slug           VARCHAR(255) UNIQUE NOT NULL,
  bio            TEXT,
  photo          VARCHAR(500),
  instagram_url  VARCHAR(500),
  spotify_url    VARCHAR(500),
  youtube_url    VARCHAR(500),
  soundcloud_url VARCHAR(500),
  created_at     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE publication_artists (
  publication_id INTEGER REFERENCES publications(id) ON DELETE CASCADE,
  artist_id      INTEGER REFERENCES artists(id) ON DELETE CASCADE,
  PRIMARY KEY (publication_id, artist_id)
);

CREATE TABLE podcast_episodes (
  id             SERIAL PRIMARY KEY,
  title          VARCHAR(255) NOT NULL,
  description    TEXT,
  cover_image    VARCHAR(500),
  spotify_url    VARCHAR(500),
  youtube_url    VARCHAR(500),
  duration_min   INTEGER,
  episode_number INTEGER,
  published_at   TIMESTAMP,
  status         VARCHAR(20) DEFAULT 'draft',
  created_at     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE shows (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  slug        VARCHAR(255) UNIQUE NOT NULL,
  venue       VARCHAR(255),
  event_date  DATE,
  description TEXT,
  cover_image VARCHAR(500),
  gallery     JSONB DEFAULT '[]',
  status      VARCHAR(20) DEFAULT 'draft',
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE contact_requests (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(255) NOT NULL,
  email        VARCHAR(255) NOT NULL,
  project_name VARCHAR(255),
  message      TEXT NOT NULL,
  instagram    VARCHAR(255),
  status       VARCHAR(20) DEFAULT 'pending',
  created_at   TIMESTAMP DEFAULT NOW()
);

-- Índices para queries frecuentes del sitio público
CREATE INDEX idx_publications_status      ON publications(status);
CREATE INDEX idx_publications_category    ON publications(category_id);
CREATE INDEX idx_publications_slug        ON publications(slug);
CREATE INDEX idx_publications_published_at ON publications(published_at DESC);

CREATE INDEX idx_artists_slug   ON artists(slug);
CREATE INDEX idx_shows_slug     ON shows(slug);
CREATE INDEX idx_shows_status   ON shows(status);

CREATE INDEX idx_podcast_status ON podcast_episodes(status);
CREATE INDEX idx_podcast_number ON podcast_episodes(episode_number DESC);

CREATE INDEX idx_contact_status ON contact_requests(status);
