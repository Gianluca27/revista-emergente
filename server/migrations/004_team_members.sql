-- Revista Emergente — tabla de miembros del equipo (sección "El Equipo" de Sobre Nosotros)

CREATE TABLE IF NOT EXISTS team_members (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  role        VARCHAR(255),
  bio         TEXT,
  photo       VARCHAR(500),
  position    INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_team_members_position ON team_members(position);

-- Seed: los 3 miembros hardcodeados actuales en SobreNosotrosPage.jsx.
-- Solo si la tabla está vacía (doble seguridad; la migración ya está trackeada en schema_migrations).
INSERT INTO team_members (name, role, bio, position)
SELECT v.name, v.role, v.bio, v.position
FROM (VALUES
  ('VALENTINA HERRERA', 'Directora & Editora', 'Periodista musical con 8 años cubriendo el under porteño', 0),
  ('LUCAS PEREYRA',     'Fotografía',          'Documentando shows desde el fondo del pozo desde 2019',     1),
  ('MAR DOMÍNGUEZ',     'Multimedia & Redes',  'Productora de audio, DJ, cronista del caos organizado',     2)
) AS v(name, role, bio, position)
WHERE NOT EXISTS (SELECT 1 FROM team_members);
