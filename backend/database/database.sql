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
    description_short TEXT,
    description_long TEXT,
    description_last_generated DATETIME,
    review_count_at_generation INT
);


-- Create User Table
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);



-- Create Saved Locations Table
CREATE TABLE IF NOT EXISTS saved_locations (
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

-- Create Itinerary Table
CREATE TABLE IF NOT EXISTS itineraries(
	itinerary_id INT auto_increment PRIMARY KEY,
    user_id INT NOT NULL,
    trip_name VARCHAR(50) NOT NULL,
    city VARCHAR(50) NOT NULL,
    start_date DATE NULL,
    end_date DATE NULL,
    hotel_location_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_itinerary_user
		FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
	CONSTRAINT fk_itinerary_hotel
		FOREIGN KEY (hotel_location_id) REFERENCES locations(id) ON DELETE SET NULL        
);

-- CREATE Itinerary Day Table
CREATE TABLE IF NOT EXISTS itinerary_days(
	itinerary_day_id INT auto_increment PRIMARY KEY,
    itinerary_id INT NOT NULL,
    day_number INT NOT NULL,
    trip_date DATE NULL,
    CONSTRAINT fk_day_itinerary
		FOREIGN KEY (itinerary_id) REFERENCES itineraries(itinerary_id) ON DELETE CASCADE,
	CONSTRAINT uq_itinerary_day UNIQUE (itinerary_id, day_number)
);

-- CREATE Itinerary Stops Table
CREATE TABLE IF NOT EXISTS itinerary_stops (
	stop_id INT auto_increment PRIMARY KEY,
    itinerary_day_id INT NOT NULL,
    location_id INT NOT NULL,
    stop_position INT NOT NULL,
    start_time TIME NULL,
    end_time TIME NULL,
    notes VARCHAR(500) NULL,
    CONSTRAINT fk_stop_day
		FOREIGN KEY (itinerary_day_id) REFERENCES itinerary_days(itinerary_day_id) ON DELETE CASCADE,
	CONSTRAINT fk_stop_location
		FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE RESTRICT,
	CONSTRAINT uq_day_position UNIQUE (itinerary_day_id, stop_position)
	
);

-- Create Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    location_id INT NOT NULL,
    rating DECIMAL(2,1) NOT NULL,
    comment TEXT,
    like_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_user
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_review_location
        FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
    CONSTRAINT uq_review_user_location UNIQUE (user_id, location_id),
    is_visible BOOLEAN DEFAULT TRUE,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT deleted_by
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create Review Likes Table
CREATE TABLE IF NOT EXISTS review_likes (
    review_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (review_id, user_id),
    CONSTRAINT fk_review_likes_review
        FOREIGN KEY (review_id) REFERENCES reviews(review_id) ON DELETE CASCADE,
    CONSTRAINT fk_review_likes_user
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);





-- Import CSV

-- Make sure `locations.csv` is placed in a `data` folder relative to this file.
-- Uncomment the block you want to run.

-- Location Table

-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE locations;
-- SET FOREIGN_KEY_CHECKS = 1;
-- LOAD DATA LOCAL INFILE './data/locations.csv'
-- INTO TABLE locations
-- FIELDS TERMINATED BY ',' 
-- ENCLOSED BY '"'
-- LINES TERMINATED BY '\n'
-- IGNORE 1 ROWS;



-- User Table

-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE users;
-- SET FOREIGN_KEY_CHECKS = 1;
-- LOAD DATA LOCAL INFILE './data/users.csv'
-- INTO TABLE users
-- FIELDS TERMINATED BY ','
-- ENCLOSED BY '"'
-- LINES TERMINATED BY '\n'
-- IGNORE 1 ROWS;
-- (user_id, first_name, last_name, email, password_hash, role);


-- Saved Locations Table

-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE saved_locations;
-- SET FOREIGN_KEY_CHECKS = 1;
-- LOAD DATA LOCAL INFILE './data/saved_locations.csv'
-- INTO TABLE saved_locations
-- FIELDS TERMINATED BY ','
-- ENCLOSED BY '"'
-- LINES TERMINATED BY '\n'
-- IGNORE 1 ROWS
-- (id, user_id, location_id, created_at);


-- Itineraries Table

-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE itineraries;
-- SET FOREIGN_KEY_CHECKS = 1;
-- LOAD DATA LOCAL INFILE './data/itineraries.csv'
-- INTO TABLE itineraries
-- FIELDS TERMINATED BY ','
-- ENCLOSED BY '"'
-- LINES TERMINATED BY '\n'
-- IGNORE 1 ROWS
-- (itinerary_id, user_id, trip_name, city, start_date, end_date, hotel_location_id, created_at, updated_at);


-- Itinerary Days Table

-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE itinerary_days;
-- SET FOREIGN_KEY_CHECKS = 1;
-- LOAD DATA LOCAL INFILE './data/itinerary_days.csv'
-- INTO TABLE itinerary_days
-- FIELDS TERMINATED BY ','
-- ENCLOSED BY '"'
-- LINES TERMINATED BY '\n'
-- IGNORE 1 ROWS
-- (itinerary_day_id, itinerary_id, day_number, trip_date);


-- Itinerary Stops Table

-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE itinerary_stops;
-- SET FOREIGN_KEY_CHECKS = 1;
-- LOAD DATA LOCAL INFILE './data/itinerary_stops.csv'
-- INTO TABLE itinerary_stops
-- FIELDS TERMINATED BY ','
-- ENCLOSED BY '"'
-- LINES TERMINATED BY '\n'
-- IGNORE 1 ROWS
-- (stop_id, itinerary_day_id, location_id, stop_position, start_time, end_time, notes);


-- Reviews Table

-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE reviews;
-- SET FOREIGN_KEY_CHECKS = 1;
-- LOAD DATA LOCAL INFILE './data/reviews.csv'
-- INTO TABLE reviews
-- FIELDS TERMINATED BY ';'
-- ENCLOSED BY '"'
-- LINES TERMINATED BY '\n'
-- IGNORE 1 ROWS
-- (review_id, user_id, location_id, rating, comment, like_count, created_at, is_visible, deleted_at);


-- Review Likes Table

-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE review_likes;
-- SET FOREIGN_KEY_CHECKS = 1;
-- LOAD DATA LOCAL INFILE './data/review_likes.csv'
-- INTO TABLE review_likes
-- FIELDS TERMINATED BY ','
-- ENCLOSED BY '"'
-- LINES TERMINATED BY '\n'
-- IGNORE 1 ROWS
-- (review_id, user_id, created_at);

 
