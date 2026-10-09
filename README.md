# To-Do List API

REST API for a to-do application: JWT authentication, tasks with status, priority, due dates and file attachments, colour-coded categories, optional Google Calendar sync, and Socket.io for real-time updates. The React client lives in [To-do-list-frontend](https://github.com/LaibaKhawar/To-do-list-frontend).

## Stack

Node.js, Express 5, MongoDB with Mongoose 8, jsonwebtoken, bcryptjs, multer (uploads), Socket.io, googleapis.

## Getting started

Prerequisites: Node.js 18+ and a MongoDB database (local or Atlas).

```bash
git clone https://github.com/LaibaKhawar/To-do-list-web-app-backend.git
cd To-do-list-web-app-backend
npm install
cp .env.example .env     # then fill in MONGO_URI and JWT_SECRET
npm start                # runs node index.js on PORT (default 5000)
```

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGO_URI` | yes | MongoDB connection string. The server exits with a clear message if it is missing. |
| `JWT_SECRET` | yes | Secret used to sign auth tokens. |
| `PORT` | no | Port to listen on (default 5000). |
| `CLIENT_URL` | no | Frontend origin. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` | no | Google sign-in and Calendar sync. |

## API

All task, category, and calendar routes require an `Authorization: Bearer <token>` header.

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in, returns a JWT |
| POST | `/api/auth/google` | Log in with a Google ID token |
| GET | `/api/auth/me` | Current user |
| GET | `/api/tasks` | List tasks |
| GET | `/api/tasks/:id` | Get one task |
| POST | `/api/tasks` | Create a task (multipart, up to 5 `attachments`) |
| PUT | `/api/tasks/:id` | Update a task (multipart, up to 5 `attachments`) |
| DELETE | `/api/tasks/:id` | Delete a task |
| DELETE | `/api/tasks/:taskId/attachments/:attachmentId` | Remove an attachment |
| GET | `/api/categories` | List categories |
| POST | `/api/categories` | Create a category |
| PUT | `/api/categories/:id` | Update a category |
| DELETE | `/api/categories/:id` | Delete a category |
| GET | `/api/calendar/connect` | Start Google Calendar OAuth |
| GET | `/api/calendar/oauth-callback` | OAuth callback |
| POST | `/api/calendar/sync` | Sync tasks with due dates to Google Calendar |
| POST | `/api/calendar/task/:taskId` | Create a calendar event for a task |
| DELETE | `/api/calendar/task/:taskId` | Remove a task's calendar event |

Uploaded files are served from `/uploads`.

## Project structure

```text
index.js          # Express app, Socket.io server, MongoDB connection
routes/           # auth, tasks, categories, calendar
controllers/      # request handlers
middleware/       # JWT auth, file upload
models/           # Mongoose schemas
uploads/          # stored attachments
vercel.json
```

## Deployment notes

`vercel.json` targets Vercel's Node runtime, but the server calls `server.listen`, uses Socket.io, and stores uploads on local disk, none of which fit serverless functions; the existing Vercel deployment does not currently respond. A long-running host such as Render or Railway (with object storage for uploads) is a better fit.

## Known limitations

- Socket.io authentication is a stub (`socket.userId` is a fixed demo value).
- CORS allows all origins.
