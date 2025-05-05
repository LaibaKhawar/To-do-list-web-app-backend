# To-Do List Application

A full-stack to-do list application with authentication, task management, category organization, file attachments, and optional Google Calendar integration.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
  - [Authentication](#authentication)
  - [Tasks](#tasks)
  - [Categories](#categories)
  - [Calendar Integration](#calendar-integration)
- [Frontend Structure](#frontend-structure)
- [Backend Structure](#backend-structure)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Overview

This To-Do List application allows users to create an account, manage tasks with different statuses and priorities, organize tasks by category, attach files to tasks, and sync with Google Calendar.

## Features

- *User Authentication*: Register, login, and logout
- *Task Management*: Create, read, update, and delete tasks
- *Task Organization*: Set status (pending, in-progress, completed), priority, and due dates
- *Category System*: Create custom categories with colors for task organization
- *File Attachments*: Attach files to tasks (PDF, images)
- *Google Calendar Integration*: Sync tasks with due dates to Google Calendar
- *Real-time Updates*: Socket.io for instant updates across multiple devices
- *Responsive Design*: Works on desktop and mobile devices

## Tech Stack

### Frontend

- React
- React Router
- Material-UI
- Socket.io Client
- Formik & Yup
- Axios
- date-fns

### Backend

- Node.js
- Express
- MongoDB with Mongoose
- JWT Authentication
- Socket.io
- Multer (file uploads)
- Google API Client

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository:

   sh
   git clone https://your-repository-url.git
   cd todolist
   

2. Install backend dependencies:

   sh
   cd backend
   npm install
   

3. Install frontend dependencies:
   sh
   cd ../frontend
   npm install
   

### Configuration

1. Create a .env file in the backend directory with the following variables:

   
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/todolist
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5173

   # For Google Calendar integration
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:5000/api/calendar/oauth/callback
   

2. Create a .env file in the frontend directory:
   
   VITE_API_URL=http://localhost:5000
   VITE_SOCKET_URL=http://localhost:5000
   

### Running the Application

1. Start the backend server:

   sh
   cd backend
   npm start
   

2. Start the frontend development server:

   sh
   cd frontend
   npm run dev
   

3. Open the application in your browser at http://localhost:5173

## API Documentation

### Authentication

#### Register a new user

- *URL*: /api/auth/register
- *Method*: POST
- *Body*:
  json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  
- *Response*:
  json
  {
    "token": "jwt_token",
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
  

#### Login

- *URL*: /api/auth/login
- *Method*: POST
- *Body*:
  json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  
- *Response*:
  json
  {
    "token": "jwt_token",
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
  

#### Get current user

- *URL*: /api/auth/me
- *Method*: GET
- *Headers*: Authorization: Bearer jwt_token
- *Response*:
  json
  {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
  

#### Update user profile

- *URL*: /api/auth/profile
- *Method*: PUT
- *Headers*: Authorization: Bearer jwt_token
- *Body*:
  json
  {
    "name": "John Updated",
    "email": "john@example.com",
    "password": "newpassword123" // Optional
  }
  
- *Response*:
  json
  {
    "user": {
      "_id": "user_id",
      "name": "John Updated",
      "email": "john@example.com"
    }
  }
  

### Tasks

#### Get all tasks

- *URL*: /api/tasks
- *Method*: GET
- *Headers*: Authorization: Bearer jwt_token
- *Query Parameters*:
  - status: Filter by status (pending, in-progress, completed)
  - priority: Filter by priority (low, medium, high)
  - category: Filter by category ID
  - search: Search tasks by title or description
- *Response*:
  json
  [
    {
      "_id": "task_id",
      "title": "Complete project",
      "description": "Finish the project by Friday",
      "status": "in-progress",
      "priority": "high",
      "category": {
        "_id": "category_id",
        "name": "Work",
        "color": "#ff0000"
      },
      "dueDate": "2025-05-10T00:00:00.000Z",
      "attachments": [
        {
          "_id": "attachment_id",
          "filename": "file.pdf",
          "originalName": "project-details.pdf",
          "size": 12345,
          "createdAt": "2025-05-01T00:00:00.000Z"
        }
      ],
      "googleCalendarEventId": "event_id",
      "createdAt": "2025-05-01T00:00:00.000Z",
      "updatedAt": "2025-05-02T00:00:00.000Z"
    }
  ]
  

#### Get task by ID

- *URL*: /api/tasks/:id
- *Method*: GET
- *Headers*: Authorization: Bearer jwt_token
- *Response*: Single task object as shown above

#### Create a task

- *URL*: /api/tasks
- *Method*: POST
- *Headers*:
  - Authorization: Bearer jwt_token
  - Content-Type: multipart/form-data (if attachments are included)
- *Body*:
  
  title: "Complete project"
  description: "Finish the project by Friday"
  status: "in-progress"
  priority: "high"
  categoryId: "category_id"  // Optional
  dueDate: "2025-05-10"  // Optional, ISO date string
  attachments: [File1, File2]  // Optional, files
  
- *Response*: Created task object

#### Update a task

- *URL*: /api/tasks/:id
- *Method*: PUT
- *Headers*:
  - Authorization: Bearer jwt_token
  - Content-Type: multipart/form-data (if attachments are included)
- *Body*: Same as create task
- *Response*: Updated task object

#### Delete a task

- *URL*: /api/tasks/:id
- *Method*: DELETE
- *Headers*: Authorization: Bearer jwt_token
- *Response*:
  json
  {
    "message": "Task deleted successfully"
  }
  

#### Delete an attachment

- *URL*: /api/tasks/:taskId/attachments/:attachmentId
- *Method*: DELETE
- *Headers*: Authorization: Bearer jwt_token
- *Response*:
  json
  {
    "message": "Attachment deleted successfully"
  }
  

### Categories

#### Get all categories

- *URL*: /api/categories
- *Method*: GET
- *Headers*: Authorization: Bearer jwt_token
- *Response*:
  json
  [
    {
      "_id": "category_id",
      "name": "Work",
      "color": "#ff0000",
      "user": "user_id",
      "createdAt": "2025-05-01T00:00:00.000Z",
      "updatedAt": "2025-05-01T00:00:00.000Z"
    }
  ]
  

#### Create a category

- *URL*: /api/categories
- *Method*: POST
- *Headers*: Authorization: Bearer jwt_token
- *Body*:
  json
  {
    "name": "Work",
    "color": "#ff0000"
  }
  
- *Response*: Created category object

#### Update a category

- *URL*: /api/categories/:id
- *Method*: PUT
- *Headers*: Authorization: Bearer jwt_token
- *Body*:
  json
  {
    "name": "Work Updated",
    "color": "#0000ff"
  }
  
- *Response*: Updated category object

#### Delete a category

- *URL*: /api/categories/:id
- *Method*: DELETE
- *Headers*: Authorization: Bearer jwt_token
- *Response*:
  json
  {
    "message": "Category deleted successfully"
  }
  

### Calendar Integration

#### Connect to Google Calendar

- *URL*: /api/calendar/connect
- *Method*: GET
- *Headers*: Authorization: Bearer jwt_token
- *Response*:
  json
  {
    "authUrl": "https://accounts.google.com/o/oauth2/..."
  }
  

#### Add task to Google Calendar

- *URL*: /api/calendar/events/:taskId
- *Method*: POST
- *Headers*: Authorization: Bearer jwt_token
- *Response*:
  json
  {
    "message": "Task added to Google Calendar",
    "eventId": "google_event_id"
  }
  

#### Remove task from Google Calendar

- *URL*: /api/calendar/events/:taskId
- *Method*: DELETE
- *Headers*: Authorization: Bearer jwt_token
- *Response*:
  json
  {
    "message": "Task removed from Google Calendar"
  }
  

## Frontend Structure


frontend/
├── public/              # Static files
├── src/
│   ├── assets/          # Images, fonts, etc.
│   ├── components/      # Reusable components
│   ├── context/         # React context providers
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components
│   ├── services/        # API service functions
│   ├── utils/           # Utility functions
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point


## Backend Structure


backend/
├── config/              # Configuration files
├── controllers/         # Route controllers
├── middleware/          # Custom middleware
├── models/              # Mongoose models
├── routes/              # API routes
├── uploads/             # Uploaded files
├── server.js            # Entry point


## Deployment

### Backend

1. Set up a MongoDB database (MongoDB Atlas recommended for production)
2. Deploy to a Node.js hosting service (Heroku, Digital Ocean, AWS, etc.)
3. Set up environment variables for the production environment

### Frontend

1. Build the frontend:
   sh
   cd frontend
   npm run build
   
2. Deploy the generated dist folder to a static hosting service (Netlify, Vercel, etc.)
3. Configure environment variables for the production API URL

## Contributing

1. Fork the repository
2. Create a feature branch: git checkout -b feature-name
3. Commit your changes: git commit -m 'Add some feature'
4. Push to the branch: git push origin feature-name
5. Submit a pull request

## License

This project is licensed under the MIT License.