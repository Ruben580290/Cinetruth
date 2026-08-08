CREATE ROLE cinetruth_admin WITH LOGIN PASSWORD 'AdminP1456';

GRANT ALL PRIVILEGES ON DATABASE "cine_truth-integrador" TO cinetruth_admin;
GRANT ALL PRIVILEGES ON SCHEMA public TO cinetruth_admin;

ALTER TABLE users OWNER TO cinetruth_admin;
-------------------------------------------------------------------------------
CREATE ROLE cinetruth_app WITH LOGIN PASSWORD 'apPc1456';

GRANT CONNECT ON DATABASE "cine_truth-integrador" TO cinetruth_app;
GRANT USAGE ON SCHEMA public TO cinetruth_app;

GRANT SELECT, INSERT, UPDATE, DELETE ON users TO cinetruth_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO cinetruth_app;
--------------------------------------------------------------------------------
ALTER DEFAULT PRIVILEGES FOR ROLE cinetruth_admin IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO cinetruth_app;

ALTER DEFAULT PRIVILEGES FOR ROLE cinetruth_admin IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO cinetruth_app;
