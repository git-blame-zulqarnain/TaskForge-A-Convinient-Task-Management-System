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

# TaskForge - Full-Stack Task Management System

TaskForge is a comprehensive task management system designed to help users organize, track, and manage their tasks efficiently. This project demonstrates a full-stack application built with modern web technologies, including a Node.js/Express.js backend and a React.js frontend.

## Project Status (End of Week 3 Deliverables)

*   **Backend:** Fully implemented with CRUD operations for tasks, user authentication (endpoints assumed implemented as per context), input validation, error handling, and an endpoint for task progress statistics.
*   **Frontend:** User interface for creating, reading, updating, and deleting tasks, API integration with the backend, user login/registration (UI and context assumed implemented), filtering tasks (UI assumed), and a visual task progress bar.
*   **Styling:** Styled using plain CSS for a clean and responsive user experience.

## Features

*   **User Authentication:**
    *   User registration and login (functionality assumed).
    *   Protected routes for task management.
*   **Task Management (CRUD):**
    *   Create new tasks with title, description, status, and due date.
    *   View a list of all tasks.
    *   Edit existing tasks.
    *   Delete tasks.
*   **Task Filtering & Search:**
    *   Filter tasks by status (e.g., Pending, In Progress, Completed/Finished).
    *   Search tasks by title or description (functionality assumed in UI).
*   **Task Progress Tracking:**
    *   Visual progress bar showing the percentage of completed tasks for the logged-in user.
*   **Responsive Design:** The UI is designed to work across different screen sizes.

## Tech Stack

### Backend
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Database:** MongoDB
*   **ODM:** Mongoose
*   **Authentication:** JSON Web Tokens (JWTs) (assumed via `authMiddleware`)
*   **Validation:** `express-validator`
*   **Environment Variables:** `dotenv`
*   **CORS:** `cors` package

### Frontend
*   **Library:** React.js (with Vite)
*   **HTTP Client:** Axios
*   **Routing:** `react-router-dom`
*   **State Management:** React Hooks (`useState`, `useEffect`, `useCallback`, `useMemo`), Context API (for Auth)
*   **Styling:** Plain CSS (`App.css`, `index.css`)

### Development
*   **Version Control:** Git & GitHub
*   **Backend Dev Server:** Nodemon
*   **Frontend Dev Server:** Vite

## Project Structure
task-management-system/
├── backend/
│ ├── src/
│ │ ├── controllers/
│ │ ├── middleware/ (authMiddleware.js, validationMiddleware.js, errorHandler.js)
│ │ ├── models/ (User.js, Task.js)
│ │ ├── routes/ (authRoutes.js, taskRoutes.js)
│ │ └── config/ (db.js)
│ ├── .env.example
│ ├── .gitignore
│ ├── package.json
│ └── server.js
├── frontend/
│ ├── public/
│ ├── src/
│ │ ├── assets/
│ │ ├── components/ (TaskForm.jsx, TaskList.jsx, TaskItem.jsx, ProgressBar.jsx, FilterControls.jsx)
│ │ ├── context/ (AuthContext.js)
│ │ ├── pages/ (LoginPage.jsx, RegisterPage.jsx)
│ │ ├── services/ (authService.js, taskService.js)
│ │ ├── App.css
│ │ ├── index.css
│ │ └── App.jsx
│ │ └── main.jsx
│ ├── .env.example
│ ├── .gitignore
│ ├── index.html
│ └── package.json
│ └── vite.config.js
├── .gitignore (Root .gitignore)
├── LICENSE
└── README.md


*(Adjust structure if your auth or filter components are named differently or in different locations)*

## Setup and Installation

### Prerequisites
*   Node.js (v18.x or later recommended)
*   npm (or yarn)
*   MongoDB (local instance or Atlas connection string)
*   Git

### Backend Setup
1.  Navigate to the `backend` directory: `cd backend`
2.  Install dependencies: `npm install`
3.  Create a `.env` file by copying `.env.example` (if provided) or manually.
    *   Key variables: `PORT`, `MONGO_URI`, `JWT_SECRET`.
4.  Start the backend server: `npm run dev` (usually on port 5001).

### Frontend Setup
1.  Navigate to the `frontend` directory: `cd frontend` (from root, or `cd ../frontend` if in `backend`)
2.  Install dependencies: `npm install`
3.  Create a `.env` file if your backend is on a non-default port/URL (optional).
    *   Variable: `VITE_API_BASE_URL=http://localhost:YOUR_BACKEND_PORT/api`
4.  Start the frontend dev server: `npm run dev` (usually on port 5173).

Open your browser to the frontend URL (e.g., `http://localhost:5173`).

## API Endpoints Overview

(Refer to backend route definitions and Postman testing for details. All task routes are protected.)

*   **Auth:**
    *   `POST /api/auth/register`
    *   `POST /api/auth/login`
*   **Tasks:**
    *   `POST /api/tasks` - Create task
    *   `GET /api/tasks` - Get all tasks (supports `?search=` and `?status=` query params)
    *   `GET /api/tasks/:id` - Get single task
    *   `PUT /api/tasks/:id` - Update task
    *   `DELETE /api/tasks/:id` - Delete task
    *   `GET /api/tasks/summary/stats` - Get task progress statistics

## Next Steps / Future Enhancements
*   More granular UI error handling (e.g., toast notifications).
*   Deployment to a cloud platform.
*   Advanced filtering or sorting options.
*   Unit and integration tests.
*   UI/UX refinements.

---
This project was developed by Muhammad Zuqlarnain.