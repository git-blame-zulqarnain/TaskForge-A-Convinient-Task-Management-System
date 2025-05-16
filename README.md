# Task Management System - Backend

This project is the backend component of a Task Management System, developed as part of a software development internship. This README covers the progress made in Week 1, focusing on backend development.

## Overview

The backend is built using Node.js and Express.js, with MongoDB as the database. It provides a RESTful API for managing tasks, including creating, reading, updating, and deleting tasks.

## Features Implemented

*   **Task CRUD Operations:**
    *   Create a new task
    *   Fetch all tasks
    *   Fetch a single task by its ID
    *   Update an existing task by its ID
    *   Delete a task by its ID
*   **Database Integration:** MongoDB is used for data persistence, with Mongoose as the ODM.
*   **API Endpoints:** A set of RESTful API endpoints for task management.
*   **Input Validation:** Incoming data for creating and updating tasks is validated.
*   **Error Handling:** Graceful error handling with proper status codes and messages.

## Tech Stack

*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB (with Mongoose ODM)
*   **Development Utilities:** Nodemon
*   **Validation:** express-validator
*   **Environment Variables:** dotenv
*   **CORS:** cors package



## Setup and Installation

### Prerequisites

*   Node.js (v18.x or later recommended)
*   npm (comes with Node.js)
*   MongoDB (running locally or a MongoDB Atlas connection string)
*   Git

### Steps

1.  **Clone the repository (if you haven't already):**
    ```bash
    git clone https://github.com/your-username/task-management-system.git
    cd task-management-system/backend
    ```

2.  **Install dependencies:**
    Navigate to the `backend` directory and run:
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the `backend` directory. You can copy `.env.example` (if you create one) or create it from scratch:
    ```
    PORT=5001
    MONGO_URI=your_mongodb_connection_string # e.g., mongodb://localhost:27017/taskmanager
    NODE_ENV=development
    ```
    Replace `your_mongodb_connection_string` with your actual MongoDB connection string.

4.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The server should start, typically on port 5001 (or the port specified in your `.env` file). You should see messages indicating the server is running and MongoDB is connected.

## API Endpoints (Week 1)

The base URL for the API is `http://localhost:PORT` (e.g., `http://localhost:5001`).

| Method | Endpoint        | Description             | Request Body (JSON) Example (for POST/PUT)                                  |
| :----- | :-------------- | :---------------------- | :-------------------------------------------------------------------------- |
| POST   | `/api/tasks`    | Create a new task       | `{ "title": "New Task", "description": "Details", "status": "Pending" }`    |
| GET    | `/api/tasks`    | Fetch all tasks         | N/A                                                                         |
| GET    | `/api/tasks/:id`| Fetch a single task by ID | N/A                                                                         |
| PUT    | `/api/tasks/:id`| Update a task by ID     | `{ "title": "Updated Task Title", "status": "In Progress" }`                |
| DELETE | `/api/tasks/:id`| Delete a task by ID     | N/A                                                                         |

### Task Schema Fields:

*   `title` (String, Required)
*   `description` (String, Optional)
*   `status` (String, Enum: `Pending`, `Working`, `Finished` [or your actual enum values], Default: `Pending`)
*   `dueDate` (Date, Optional, Format: YYYY-MM-DD)
*   `_id` (ObjectID, Auto-generated)
*   `createdAt` (Date, Auto-generated)
*   `updatedAt` (Date, Auto-generated)

## How to Test

Use an API client like Postman or Insomnia to test the endpoints listed above.

## Next Steps (Future Weeks)

*   Frontend development (Week 2)
*   User authentication (Week 3)
*   Search and filter functionality (Week 3)
*   Task progress tracking (Week 3)
*   Optimization and testing (Week 3)

---

*This project is for learning and demonstration purposes.*