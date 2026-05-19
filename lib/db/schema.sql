CREATE TABLE IF NOT EXISTS books (
  id              INTEGER PRIMARY KEY,
  title           TEXT NOT NULL,
  authors         JSONB NOT NULL DEFAULT '[]'::jsonb,
  translators     JSONB NOT NULL DEFAULT '[]'::jsonb,
  subjects        TEXT[] NOT NULL DEFAULT '{}',
  bookshelves     TEXT[] NOT NULL DEFAULT '{}',
  languages       TEXT[] NOT NULL DEFAULT '{}',
  summaries       TEXT[] NOT NULL DEFAULT '{}',
  copyright       BOOLEAN,
  media_type      TEXT,
  formats         JSONB NOT NULL DEFAULT '{}'::jsonb,
  download_count  INTEGER NOT NULL DEFAULT 0,
  search_tsv      tsvector,
  synced_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS books_download_count_idx ON books (download_count DESC);
CREATE INDEX IF NOT EXISTS books_languages_gin      ON books USING GIN (languages);
CREATE INDEX IF NOT EXISTS books_subjects_gin       ON books USING GIN (subjects);
CREATE INDEX IF NOT EXISTS books_bookshelves_gin    ON books USING GIN (bookshelves);
CREATE INDEX IF NOT EXISTS books_search_idx         ON books USING GIN (search_tsv);

CREATE OR REPLACE FUNCTION books_tsv_update() RETURNS trigger AS $$
BEGIN
  NEW.search_tsv :=
    setweight(to_tsvector('english', coalesce(NEW.title,'')), 'A') ||
    setweight(to_tsvector('english',
      coalesce((SELECT string_agg(value->>'name', ' ')
                FROM jsonb_array_elements(NEW.authors)), '')), 'B');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS books_tsv_trg ON books;
CREATE TRIGGER books_tsv_trg
BEFORE INSERT OR UPDATE OF title, authors ON books
FOR EACH ROW EXECUTE FUNCTION books_tsv_update();

CREATE TABLE IF NOT EXISTS sync_runs (
  id          SERIAL PRIMARY KEY,
  started_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at    TIMESTAMPTZ,
  kind        TEXT NOT NULL,
  pages_done  INTEGER NOT NULL DEFAULT 0,
  rows_upsert INTEGER NOT NULL DEFAULT 0,
  error       TEXT
);
