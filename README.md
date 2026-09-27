# RentEasy / Rental Platform

RentEasy is a platform that allows users to **list items for rent** and **rent items from others** seamlessly. Whether it's tools, gadgets, or furniture, RentEasy makes the rental process simple and efficient.

## Architecture Update
This project has recently been migrated from a Node.js/Express backend to a **Java Spring Boot** architecture to provide better scalability, type safety, and robust object-oriented patterns.

## Features

- **User Authentication**: Sign up and log in securely (JWT based).
- **List Items**: Add items for rent with images, descriptions, and pricing.
- **Search & Browse**: Find items available for rent based on category and location.
- **Request & Rent**: Rent items from other users with a smooth request system.
- **Chat System**: Communicate with item owners directly via WebSockets.
- **Payments & Transactions**: Secure payments for rentals.

## Tech Stack

- **Frontend**: React.js / Vite
- **Backend**: Java 17, Spring Boot 3.4
- **Database**: MongoDB (via Spring Data MongoDB)
- **Authentication**: Spring Security with JWT
- **Storage**: Cloudinary / Firebase (for storing images)

## Directory Structure

- `/frontend` - Contains the React application.
- `/spring-boot-backend` - Contains the Java Spring Boot REST API.

## Installation & Setup

1. **Clone the repository:**
   ```sh
   git clone https://github.com/Daulat309/Rental.git
   cd Rental
   ```

2. **Backend Setup (Spring Boot):**
   - Ensure you have **Java 17** and **Maven** installed.
   - Navigate to the backend directory:
     ```sh
     cd spring-boot-backend
     ```
   - Build and run the backend:
     ```sh
     mvn clean install
     mvn spring-boot:run
     ```
   - The backend runs on `http://localhost:8080`.

3. **Frontend Setup (React):**
   - Open a new terminal and navigate to the frontend directory:
     ```sh
     cd frontend
     ```
   - Install dependencies and start the Vite development server:
     ```sh
     npm install
     npm run dev
     ```
   - The frontend runs on `http://localhost:5173` (or the port specified by Vite).

## Environment Variables

You will need to configure environment properties for both frontend and backend. 
- **Backend**: Update `spring-boot-backend/src/main/resources/application.properties` with your MongoDB URI, JWT secret, and Cloudinary keys.
- **Frontend**: Create a `.env` in the `frontend` folder with your API base URLs.

## Contributing

Feel free to fork this repository and submit pull requests. Contributions are always welcome! 🚀

## License

MIT License
