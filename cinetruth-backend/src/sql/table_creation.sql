CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  "firstName" VARCHAR(40) NOT NULL,
  "lastName" VARCHAR(40) NOT NULL,
  email VARCHAR(200) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user'
      CHECK (role IN ('user', 'admin')),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users ("firstName", "lastName", email, password, role)
VALUES (
  'Admin',
  'CineTruth',
  'admin@cinetruth.com',
  '$2b$10$qoyWvhb/AQels/Gh896sBug35SVVUrTKm48RYMFW5nma1eTK2Zlj6',
  'admin'
)
ON CONFLICT (email) DO NOTHING;


select * from users