-- Remove podcast feature: the public/admin "Podcast" section was dropped,
-- with Entrevistas (publications) becoming the single editorial section.
DROP INDEX IF EXISTS idx_podcast_status;
DROP INDEX IF EXISTS idx_podcast_number;
DROP TABLE IF EXISTS podcast_episodes;
