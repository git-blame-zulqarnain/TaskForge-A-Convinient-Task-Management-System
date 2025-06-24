# TaskForge - Full-Stack Task Management System

TaskForge is a feature-rich, full-stack task management application designed to help users and teams organize, track, collaborate on, and analyze their tasks efficiently. It features a Node.js/Express.js backend, a React.js frontend, real-time notifications via Socket.IO, and user authentication.ss

## Live Demo & Links

*   **Deployed Frontend (Vercel):** [Your Vercel Frontend URL - Add after deployment]
*   **Deployed Backend (e.g., Render):** [Your Render Backend URL - Add after deployment]
*   **Video Walkthrough:** [Link to your video demo - Add after recording]

## Features

*   **User Authentication:**
    *   Secure user registration and login using JWTs.
    *   Password hashing using bcrypt.
    *   Protected routes for all user-specific data.
*   **Task Management (CRUD):**
    *   Create tasks with title, description, status (Pending, Working/In Progress, Finished), and due dates.
    *   View all accessible tasks (owned or shared).
    *   Edit details of owned tasks.
    *   Delete owned tasks.
*   **Task Collaboration & Sharing:**
    *   Owners can share tasks with other registered users (by email or selecting from a list).
    *   Users can view tasks shared with them by others.
    *   Permissions: Only owners can edit or delete tasks. Shared users have read-only access (can be extended).
*   **Real-Time Notifications (Socket.IO):**
    *   Users receive instant toast notifications when:
        *   A task is shared with them.
        *   The status of a task they own or is shared with them is updated.
    *   Persistent notifications displayed in a notification bell UI.
    *   Functionality to mark notifications as read (individually or all).
*   **Task Progress Tracking:**
    *   Visual progress bar displaying the percentage of completed tasks for the user.
*   **Task Filtering & Search:**
    *   Filter tasks by status.
    *   Search tasks by title or description.
*   **Analytics Dashboard:**
    *   Overview: Total tasks, pending, in-progress, and finished counts.
    *   Visualizations:
        *   Pie chart for task status breakdown.
        *   Line charts for tasks created and tasks completed trends (e.g., last 7 days).
*   **User Interface:**
    *   Clean, modern "glassmorphism" design.
    *   Responsive design for usability on various screen sizes.
    *   Dark Mode toggle for user preference.
*   **Error Handling:** Graceful error handling on both frontend and backend.

## Tech Stack

**Backend:**
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Database:** MongoDB
*   **ODM:** Mongoose
*   **Authentication:** JSON Web Tokens (`jsonwebtoken`), `bcryptjs`
*   **Real-time Communication:** Socket.IO
*   **Middleware:** `cors`, `express-async-handler` (for controllers), `express-validator`
*   **Environment Variables:** `dotenv`

**Frontend:**
*   **Library/Framework:** React.js (bootstrapped with Vite)
*   **Routing:** `react-router-dom` v6
*   **HTTP Client:** Axios
*   **State Management:** React Hooks (`useState`, `useEffect`, `useCallback`, `useMemo`), Context API (`AuthContext`)
*   **Real-time Communication:** `socket.io-client`
*   **Charting:** `chart.js`, `react-chartjs-2`
*   **Notifications:** `react-toastify`
*   **Styling:** Plain CSS (with CSS Custom Properties for theming)
*   **Build Tool:** Vite

**Development & General:**
*   **Version Control:** Git & GitHub
*   **Dev Server (Backend):** Nodemon
*   **Dev Server (Frontend):** Vite HMR

## Getting Started - Local Setup

### Prerequisites
*   Node.js (v18.x or later recommended)
*   npm (or yarn)
*   MongoDB (running locally or a MongoDB Atlas connection string)
*   Git installed

### Backend Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/git-blame-zulqarnain/TaskForge-A-Convinient-Task-Management-System.git
    cd TaskForge-A-Convinient-Task-Management-System/backend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Create a `.env` file** in the `backend` directory. Copy the contents of `backend/.env.example` (you should create this file) and fill in your actual values:
    ```env
    # backend/.env.example
    NODE_ENV=development
    PORT=5001
    MONGO_URI=your_mongodb_connection_string_here
    JWT_SECRET=your_super_strong_and_long_random_jwt_secret_key
    FRONTEND_URL=http://localhost:5173
    ```
4.  **Start the backend development server:**
    ```bash
    npm run dev
    ```
    The server will typically start on port 5001.

### Frontend Setup

1.  **Navigate to the `frontend` directory (from the project root):**
    ```bash
    cd ../frontend
    # or from root: cd TaskForge-A-Convinient-Task-Management-System/frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **(Optional) Create a `.env` file** in the `frontend` directory if your backend is not running on `http://localhost:5001`:
    ```env
    # frontend/.env (for Vite, variables must start with VITE_)
    VITE_API_BASE_URL=http://localhost:5001/api
    VITE_SOCKET_URL=http://localhost:5001
    ```
    If your backend runs on port 5001, these defaults are already in the service files.
4.  **Start the frontend development server:**
    ```bash
    npm run dev
    ```
    The frontend will typically start on port 5173 and open in your browser.

## API Documentation Overview

All protected routes require a JWT Bearer token in the `Authorization` header.

### Auth Endpoints (`/api/users`)
*   `POST /register` - Register a new user.
    *   Body: `{ "name": "Test User", "email": "test@example.com", "password": "password123" }`
    *   Response (201): `{ "_id", "name", "email", "token" }`
*   `POST /login` - Login an existing user.
    *   Body: `{ "email": "test@example.com", "password": "password123" }`
    *   Response (200): `{ "_id", "name", "email", "token" }`
*   `GET /profile` - Get current logged-in user's profile (Protected).
*   `GET /list` - Get list of users for sharing (Protected).

### Task Endpoints (`/api/tasks`) (All Protected)
*   `POST /` - Create a new task.
    *   Body: `{ "title": "New Task", "description": "...", "status": "Pending", "dueDate": "YYYY-MM-DD" }`
*   `GET /` - Get tasks (owned or shared). Supports query params: `?search=term&status=Pending`.
*   `GET /:id` - Get a single task by ID.
*   `PUT /:id` - Update a task by ID (owner only).
    *   Body: Fields to update (title, description, status, dueDate).
*   `DELETE /:id` - Delete a task by ID (owner only).
*   `PUT /:id/share` - Share a task with user(s).
    *   Body: `{ "userIdToShareWith": "otherUserId" }` OR `{ "emailToShareWith": "other@example.com" }` (can also be an array of IDs/emails).
*   `GET /shared` - Get tasks shared with the current user by others.
*   `GET /summary/stats` - Get task progress statistics (total, completed).

### Notification Endpoints (`/api/notifications`) (All Protected)
*   `GET /` - Get all notifications for the logged-in user.
*   `PUT /mark-read` - Mark specific notifications as read.
    *   Body: `{ "notificationIds": ["id1", "id2"] }`
*   `PUT /mark-all-read` - Mark all unread notifications as read.

### Analytics Endpoints (`/api/analytics`) (All Protected)
*   `GET /overview` - Fetch summary task statistics (total, pending, in-progress, finished).
*   `GET /trends` - Fetch task trends. Query params: `?period=last7days&dataType=created` (or `completed`, `last30days`, `thisMonth`).

## Known Issues / Future Enhancements
*   Implement task attachments (file uploads).
*   More granular error messages and UI feedback.
*   Pagination for long lists (tasks, users for sharing, notifications).
*   Advanced search capabilities (e.g., by due date range).
*   Comprehensive unit and integration testing.
*   More sophisticated role-based permissions for shared tasks (e.g., allow shared users to edit status).

---
Built by Muhammad Zuqlarnain.