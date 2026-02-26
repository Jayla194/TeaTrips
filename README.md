# TeaTrips - Final Year Project

## Location of Main Software Artefacts
- Backend code : `/backend/`
- Database schema: `/backend/database/`
- Frontend code: `/frontend/`

## How to run

### 1. Install Dependencies
`cd backend`
`npm install`

### 2. Create your **.env** file
Copy .env.example into a new .env

### 3. Set up the database
Run the schema file in MySQL
`source backend/database/database.sql`
Then import the databse using MySQL Workbench or the code provided

### 4. Start the server
`node app.js`
The server will run at: http://localhost:5000
