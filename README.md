# Overview
This project is an Express.js and PostgreSQL-based backend application that serves hotel details via REST APIs. It's part of a full-stack application with a React frontend.

## Features
- RESTful API endpoints for serving hotel details
- PostgreSQL database integration
- Configuration file for managing credentials and settings
- Proper error handling and status code management
- High code quality and maintainability

## Installation

To get started with this project, follow the steps below:

1. **Clone the repository**:
    ```sh
    git clone https://github.com/Pranto-Sen/W3_Assignment_03_Backend.git
    cd W3_Assignment_03_Backend
    ```

2. **Install dependencies**:
    ```sh
    npm install
    ```
## Configuration
- Open config.json and update the database credentials and other settings as needed.

## Database Setup
- Create a new PostgreSQL database for the project.
  
## Usage
1. **Start the development server**:
    ```sh
     nodemon index.js
    ```
    - The server will start and listen on the port specified in your configuration file (default is typically 3000).
    - The application will run at `http://localhost:3000`.
   

## API Endpoints

- GET ```/api/hotel/:slug:``` Retrieve details for a specific hotel
- GET ```/api/hotel/:slug/room:``` Retrieve room information for a specific hotel
