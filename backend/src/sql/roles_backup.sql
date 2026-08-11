CREATE ROLE cinetruth_backup WITH LOGIN PASSWORD 'rBackcup123';

GRANT CONNECT ON DATABASE "cine_truth-integrador" TO cinetruth_backup;
GRANT USAGE ON SCHEMA public TO cinetruth_backup;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO cinetruth_backup;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO cinetruth_backup;

ALTER DEFAULT PRIVILEGES FOR ROLE cinetruth_admin IN SCHEMA public
  GRANT SELECT ON TABLES TO cinetruth_backup;
ALTER DEFAULT PRIVILEGES FOR ROLE cinetruth_admin IN SCHEMA public
  GRANT SELECT ON SEQUENCES TO cinetruth_backup;