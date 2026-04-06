# Full-Stack Social Feed Application

A robust, scalable social media platform designed to handle high-traffic interactions. This application features a React-based frontend with centralized state management and a high-performance Express backend utilizing Sequelize ORM with a Supabase-hosted PostgreSQL instance.

## 🛠 Tech Stack

### Frontend

- **React.js**: Functional components and Hooks.
- **Redux Toolkit**: Centralized state management and async thunks.
- **Tailwind CSS**: Utility-first styling.

### Backend

- **Node.js & Express.js**: RESTful API architecture.
- **Sequelize ORM**: Database modeling and migrations.
- **PostgreSQL (via Supabase)**: Scalable relational database.
- **Supabase Storage**: Object storage for media assets.

### Security & Middleware

- **JWT (JSON Web Tokens)**: Secure stateless authentication.
- **Bcrypt**: Password hashing.
- **Multer**: Multi-part form data handling for file uploads.

## 🚀 Key Features

### 1) Authentication & Authorization

- Registration endpoint accepts first name, last name, email, password (+ optional profile image).
- Passwords are hashed with `bcrypt`.
- Login returns JWT token (24h expiry).
- Backend middleware validates token and blocks unauthorized access.
- Frontend stores token in `localStorage`, validates token expiry, and protects `/feed` route.

### 2) Feed Functionality

- Authenticated users can create posts with:
  - Text content
  - Optional image
  - Privacy (`public` / `private`)
- Feed returns posts sorted newest-first.
- Like/unlike for posts is implemented.
- Comment and reply creation is implemented.
- Like/unlike for comments and replies is implemented.
- Reply UX supports textarea input and Enter-to-submit (hidden submit handler), matching the comment input interaction.
- Replies are rendered as nested, indented threads for clear visual differentiation from top-level comments.
- Feed includes liker metadata (user names) for posts and comments.
- Privacy enforcement:
  - Public posts visible to all users.
  - Private posts visible only to the author.

### 3) Backend Design Choices for Scale & Maintainability

- PostgreSQL + Sequelize models with normalized relationships:
  - `User`, `Post`, `Comment`, `PostLike`, `CommentLike`
- Separate like tables for posts and comments to keep write/read paths efficient.
- `Post.createdAt` indexed to optimize newest-first feed reads.
- JWT-based stateless auth for scalable horizontal backend deployment.

## 🗂️ Project Structure

```text
buddy-match/                             # Current repo root (buddy-script)
│
├── backend/                             # Maps to: buddy-script-backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── feedController.js
│   │   └── postController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── models/
│   │   └── index.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── postRoutes.js
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── server.js
│
├── frontend/                            # Maps to: buddy-script-frontend/
│   ├── public/
│   │   └── assets/
│   │       ├── css/
│   │       ├── fonts/
│   │       ├── images/
│   │       └── js/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   └── DecorShapes.jsx
│   │   │   └── feed/
│   │   │       ├── DarkModeToggle.jsx
│   │   │       ├── FeedLeftSidebar.jsx
│   │   │       ├── FeedMiddle.jsx
│   │   │       ├── FeedMobileBottomNav.jsx
│   │   │       ├── FeedMobileHeader.jsx
│   │   │       ├── FeedNavbar.jsx
│   │   │       ├── FeedNotificationPanel.jsx
│   │   │       ├── FeedRightSidebar.jsx
│   │   │       ├── PostCard.jsx
│   │   │       ├── ProfileDropdown.jsx
│   │   │       └── UserAvatar.jsx
│   │   ├── pages/
│   │   │   ├── Feed.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── Registration.jsx
│   │   ├── store/
│   │   │   ├── feedSlice.js
│   │   │   └── index.js
│   │   ├── utils/
│   │   │   └── auth.js
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🏗 Architectural Decisions & Scalability

### Database Optimization

To keep feed reads and write operations efficient as data grows:

- **Newest-first feed index**: A dedicated index on `Post.createdAt` supports fast sorting for timeline queries.
- **Relational modeling**: The schema is normalized with separate entities (`User`, `Post`, `Comment`, `PostLike`, `CommentLike`) and clear associations to prevent duplication and keep joins predictable.
- **Privacy-aware query pattern**: Feed queries are filtered at the database layer (`public` posts + current user’s private posts), reducing unnecessary payload and post-filtering overhead.
- **Reply-ready comment model**: `Comment.parentId` supports hierarchical threading and scales better than storing nested blobs.

### High-Performance State Management

- **Redux Toolkit async flow**: Feed, create-post, like/unlike, and comment actions are managed through thunks for predictable request lifecycle and centralized error handling.
- **Optimistic like updates**: Post and comment like/unlike are reflected instantly in client state, then synchronized with backend responses for a responsive UX.
- **Efficient upload handling**: `multer.memoryStorage()` buffers files in memory and streams them directly to Supabase Storage, avoiding local disk writes and reducing server I/O.
- **Lightweight auth cache**: Token and user session data are stored client-side, with expiry checks before API calls to avoid unnecessary unauthorized requests.

## 💻 Getting Started

### Prerequisites

- Node.js 18+
- npm
- PostgreSQL database (Supabase Postgres works)
- Supabase storage bucket (for profile/post images)

### 1) Backend Setup

Path: `buddy-script-backend`

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env` from `.env.example` and fill values:
   ```dotenv
   PORT=5000
   JWT_SECRET=your-strong-secret
   DB_URL=postgresql-connection-string
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-supabase-service-or-anon-key
   SUPABASE_SIGNED_URL_EXPIRES_IN=86400
   SUPABASE_BUCKET=post-images
   ```
3. Run server:
   ```bash
   npm run dev
   ```

### 2) Frontend Setup

Path: `buddy-script-frontend`

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env` from `.env.example`:
   ```dotenv
   VITE_API_URL=http://localhost:5000
   ```
3. Run frontend:
   ```bash
   npm run dev
   ```

## 🔌 API Overview

Base URL: `/api`

### Auth

- `POST /auth/register` — register user
- `POST /auth/login` — login and receive JWT

### Posts / Feed (Protected)

- `GET /posts` — get feed (public + own private), newest-first
- `POST /posts` — create post (`multipart/form-data`, fields: `content`, `privacy`, `image`)
- `POST /posts/:postId/like` — toggle post like
- `POST /posts/comments` — create comment (`content`, `postId`, optional `parentId` for reply)
- `POST /posts/comments/:commentId/like` — toggle comment/reply like

📈 Future Enhancements

- Real-time notifications (WebSockets)
- Direct messaging
- Follow/unfollow system
- Hashtags and mentions
- Search functionality
- Email verification
- Password reset

### 🌐 Live Deployment

- **Backend**: Deployed on **Render**.
- **Frontend**: Deployed on **Vercel**.

### 🔗 Live Links

- GitHub Repository: `https://github.com/masrur-sakib/buddy-match`
- Live Frontend URL: `https://buddy-match-frontend.vercel.app`
- Live Backend URL: `https://buddy-match.onrender.com`
- Video Demo: `will be added soon`
