-- Create and select database
CREATE DATABASE IF NOT EXISTS tea_trips;
USE tea_trips;

-- Create Locations Table
CREATE TABLE IF NOT EXISTS locations (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    type VARCHAR(50),
    address VARCHAR(255),
    city VARCHAR(100),
    postcode VARCHAR(20),
    lat DECIMAL(10, 8),
    lon DECIMAL(11, 8),
    website VARCHAR(255),
    phone VARCHAR(50),
    opening_hours VARCHAR(255),
    price_tier INT,
    avg_rating DECIMAL(3, 1),
    suggested_duration INT,
    tags VARCHAR(255),
    image_url VARCHAR(500),
    description_short TEXT
);
TRUNCATE TABLE locations;
SET GLOBAL local_infile = 1;
SHOW VARIABLES LIKE 'local_infile';

LOAD DATA LOCAL INFILE './data/locations_balanced_v9.csv'
INTO TABLE locations
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(
  id,
  name,
  type,
  address,
  city,
  postcode,
  lat,
  lon,
  website,
  phone,
  opening_hours,
  price_tier,
  avg_rating,
  suggested_duration,
  tags,
  image_url,
  description_short
);

-- Create User Table
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user'
);

-- Create Saved Locations Table
CREATE TABLE saved_locations (
	id INT AUTO_INCREMENT PRIMARY KEY,
	user_id INT NOT NULL,
    location_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_saved_user
    FOREIGN KEY (user_id) 
    REFERENCES users(user_id) 
    ON DELETE CASCADE,
    
    CONSTRAINT fk_saved_location
    FOREIGN KEY (location_id)
    REFERENCES locations(id)
    ON DELETE CASCADE,
    
    CONSTRAINT unique_user_location
    UNIQUE (user_id,location_id)
);
-- Import CSV 

-- Make sure `locations.csv` is placed in a `data` folder relative to this file.
-- Uncomment to run:

-- Location Table

-- LOAD DATA LOCAL INFILE './data/locations.csv'
-- INTO TABLE locations
-- FIELDS TERMINATED BY ',' 
-- ENCLOSED BY '"'
-- LINES TERMINATED BY '\n'
-- IGNORE 1 ROWS;

-- User Table

-- LOAD DATA LOCAL INFILE './data/users.csv'
-- INTO TABLE users
-- FIELDS TERMINATED BY ',' 
-- ENCLOSED BY '"'
-- LINES TERMINATED BY '\n'
-- IGNORE 1 ROWS;
