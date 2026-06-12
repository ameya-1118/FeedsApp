# Feedsss Project Guide

## 1. Project Overview

Feedsss is a full-stack social feed application with moderated posting. Users can register, verify their email using an OTP, log in, create posts with an image, browse approved posts, like posts, and view their own profile. Admin users can review pending posts and either approve or reject them.

The codebase is split into two main parts:

- `frontend/` contains the React user interface
- `server/` contains the Express API and MongoDB logic

## 2. Core Features

### User Features

- Register with username, email, phone number, password, and role
- Verify account through an OTP sent by email
- Log in after email verification
- Request password reset OTP
- Reset password using OTP
- Create posts with caption and image
- View approved posts on the feed page
- Like and unlike posts
- View a profile page showing their own posts and post status

### Admin Features

- Open an admin dashboard
- View pending posts awaiting moderation
- Approve posts so they appear in the main feed
- Reject posts and remove them

## 3. Technology Stack

### Frontend

- React 19
- Vite
- React Router DOM
- Axios
- React Hot Toast
- Tailwind CSS v4
- Custom CSS in `frontend/src/index.css`

### Backend

- Node.js
- Express 5
- MongoDB
- Mongoose
- bcryptjs
- jsonwebtoken
- cookie-parser
- cors
- helmet
- nodemailer
- multer
- cloudinary
- multer-storage-cloudinary

## 4. Frontend Implementation

The frontend is a React single-page app. Routing is defined in `frontend/src/App.jsx`. It uses page-level components rather than a global state manager.

### Main Pages

- Home page at `/`
- Login page at `/login`
- Register page at `/register`
- OTP verification page at `/verify-otp`
- Forgot password page at `/forgot-password`
- Reset password page at `/reset-password`
- Feed page at `/feed`
- Profile page at `/profile`
- Create post page at `/create-post`
- Admin dashboard at `/admin`

### Service Layer

The frontend uses a service-based API structure:

- `frontend/src/services/api.js`
  - Creates a shared Axios client
  - Sets `baseURL` using `VITE_API_URL`
  - Uses `withCredentials: true`

- `frontend/src/services/authService.js`
  - Handles register
  - Handles verify OTP
  - Handles login
  - Handles forgot password
  - Handles verify reset OTP
  - Handles reset password
  - Handles logout

- `frontend/src/services/postService.js`
  - Handles get approved posts
  - Handles get pending posts
  - Handles create post
  - Handles approve post
  - Handles reject post
  - Handles like post
  - Handles user posts
  - Handles delete post

### Frontend State

The frontend mostly uses:

- `useState`
- `useEffect`
- `useNavigate`

The logged-in user is stored in `localStorage`, including:

- user id
- username
- email
- avatar
- role
- token

## 5. Backend Implementation

The backend starts from `server/server.js`.

### What `server.js` does

- Loads environment variables with `dotenv`
- Connects to MongoDB
- Enables JSON body parsing
- Enables cookie parsing
- Uses `helmet`
- Enables CORS using `CLIENT_URL`
- Mounts auth routes under `/api/auth`
- Mounts post routes under `/api/posts`

### Route Groups

#### Auth Routes

Defined in `server/routes/authRoutes.js`

- `POST /api/auth/register`
- `POST /api/auth/verify-otp`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/verify-reset-otp`
- `POST /api/auth/reset-password`
- `POST /api/auth/logout`

#### Post Routes

Defined in `server/routes/postRoutes.js`

- `POST /api/posts/create`
- `GET /api/posts`
- `GET /api/posts/pending`
- `PUT /api/posts/approve/:id`
- `DELETE /api/posts/reject/:id`
- `POST /api/posts/like`
- `GET /api/posts/user/:userId`
- `DELETE /api/posts/:id`

## 6. Database Models

### User Model

Defined in `server/models/User.js`

Fields:

- `username`
- `email`
- `phone`
- `password`
- `avatar`
- `role`
- `isVerified`
- `otp`
- `otpPurpose`
- `otpExpires`

Meaning:

- `email` is unique
- `role` can be `admin` or `user`
- `isVerified` controls whether login is allowed
- OTP fields support registration verification and password reset

### Post Model

Defined in `server/models/Post.js`

Fields:

- `content`
- `image`
- `userId`
- `username`
- `avatar`
- `likes`
- `approved`

Meaning:

- `image` stores the uploaded Cloudinary image URL
- `likes` stores an array of user IDs
- `approved` controls whether the post shows on the public feed

## 7. Authentication Flow

### Registration

1. User fills the register form.
2. Frontend calls `register(form)` from `authService`.
3. Backend checks whether the email already exists.
4. Password is hashed with bcrypt.
5. Backend generates a 6-digit OTP.
6. User is saved with `isVerified: false`.
7. OTP is emailed using Nodemailer.
8. Frontend redirects to the OTP verification page.

### Email Verification

1. User enters the OTP.
2. Frontend calls `verifyOTP(email, otp)`.
3. Backend loads the user by email.
4. Backend compares the stored OTP and entered OTP.
5. Backend checks expiry time.
6. If valid, account becomes verified.
7. OTP-related fields are cleared.

### Login

1. User enters email and password.
2. Frontend calls `login(email, password)`.
3. Backend checks that the user exists.
4. Backend compares password with hashed password.
5. Backend checks `isVerified`.
6. Backend creates a JWT token with `id` and `role`.
7. Token is sent back and also set in a cookie.
8. Frontend stores user info and token in local storage.
9. Frontend navigates to `/admin` if role is admin, otherwise `/feed`.

### Forgot Password and Reset

1. User enters email on forgot password page.
2. Backend generates a new OTP and sends email.
3. Frontend navigates to reset password page.
4. User enters OTP and new password.
5. Backend verifies OTP.
6. Backend hashes new password.
7. Backend updates password and clears OTP fields.

## 8. OTP Email Service

OTP logic is implemented inside `server/controllers/authController.js`.

### How it works

- A 6-digit code is generated with random number logic
- OTP is stored on the user document
- Purpose is stored in `otpPurpose`
- Expiration is stored in `otpExpires`
- Gmail SMTP is used through Nodemailer

This same pattern is reused for:

- account verification
- password reset

## 9. Post Creation and Upload Service

Post creation is handled across frontend and backend layers.

### Frontend Side

- User enters caption
- User selects image
- Image preview is generated with `FileReader`
- `FormData` is created
- The request is sent as `multipart/form-data`

### Backend Side

- Multer middleware processes the upload
- `multer-storage-cloudinary` sends the file to Cloudinary
- Cloudinary returns a hosted file path
- Backend saves the post in MongoDB
- The post starts with `approved: false`

## 10. Feed System

The main feed shows only approved posts.

### Feed behavior

- Frontend calls `getApprovedPosts()`
- Backend returns posts where `approved: true`
- Posts are sorted newest first
- Likes are populated
- User info can also be populated through Mongoose

The feed page also:

- refreshes on window focus
- supports manual refresh
- allows like and unlike interactions

## 11. Like System

The like system is a toggle implementation.

### Logic

- If the current user ID is already in `post.likes`, remove it
- If not present, add it
- Save the post
- Return:
  - message
  - like count
  - whether the post is liked by current user

Frontend then updates local state so the UI changes immediately.

## 12. Profile System

The profile page reads the logged-in user from local storage and fetches posts using the user ID.

It displays:

- avatar
- username
- email
- role
- number of posts
- each post image
- caption
- creation date
- like count
- moderation status: live or pending

## 13. Admin Moderation System

The admin dashboard is one of the most important app-specific features.

### Admin flow

1. Frontend requests pending posts.
2. Backend returns posts where `approved: false`.
3. Admin can approve a post.
4. Approve updates `approved` to `true`.
5. Admin can reject a post.
6. Reject deletes the post.

This creates a moderation workflow instead of fully open posting.

## 14. Styling and UI Design

The app uses custom CSS with Tailwind imported at the top of `frontend/src/index.css`.

### UI characteristics

- gradient backgrounds
- glass-style cards
- rounded buttons and surfaces
- animated glow or orb effects
- custom input and button styling
- responsive layouts for mobile screens
- dedicated visual treatment for feed cards and profile cards

This makes the frontend look more polished than a plain CRUD demo.

## 15. Important Implementation Observations

These are important if you want to explain the project honestly and professionally.

### Strengths

- clear separation between frontend and backend
- real-world features like email verification and uploads
- good beginner-to-intermediate full-stack architecture
- moderation makes the app more interesting than a basic social clone
- service-based frontend API structure is clean

### Weaknesses or Risks

- auth middleware exists but is not used on post routes
- anyone can choose `admin` role during registration
- frontend stores JWT in local storage even though backend also uses cookie auth
- some logout flows only clear local state
- backend trusts client-sent user identity in post creation
- there is no formal request validation layer
- there are no automated tests

## 16. Services Summary

### MongoDB Service

- Stores users and posts
- Connected through Mongoose in `server/config/db.js`

### Cloudinary Service

- Hosts uploaded images
- Configured in `server/config/cloudinary.js`
- Used by upload middleware

### Nodemailer Service

- Sends OTP emails through Gmail SMTP
- Initialized in `authController.js`

### JWT Service

- Creates signed auth tokens
- Used in login flow
- Validated by auth middleware

### Auth Middleware

Defined in `server/middleware/authMiddleware.js`

- `protect` verifies JWT cookie
- `adminOnly` allows only admin role

Important note:

- these middleware functions are currently defined but not applied to the routes that need them most

## 17. End-to-End Request Examples

### Example A: User Registration

Register page -> authService -> `/api/auth/register` -> authController -> User model -> OTP email -> verify page

### Example B: Create Post

Create Post page -> FormData -> `/api/posts/create` -> upload middleware -> Cloudinary -> postController -> Post model

### Example C: Approve Post

Admin page -> postService.approvePost -> `/api/posts/approve/:id` -> postController -> Post updated -> appears in feed

## 18. Recommended Next Improvements

If you want to make the project stronger, these are the best next steps:

1. Protect sensitive routes using `protect` and `adminOnly`
2. Remove public role selection from registration
3. Derive user identity from authenticated backend session instead of request body
4. Add input validation
5. Improve logout consistency
6. Use secure cookie settings in production
7. Add tests for auth and moderation
8. Add frontend route guards

## 19. Short Interview Explanation

You can explain the project like this:

"Feedsss is a full-stack moderated social media app built with React, Vite, Express, MongoDB, and Cloudinary. Users can register, verify their email with OTP, log in, upload image posts, like content, and manage their profile. Admin users moderate pending posts before they go live. The frontend is organized around page components and service wrappers, and the backend uses routes, controllers, models, and middleware."

## 20. Final Conclusion

Feedsss is a solid learning and portfolio project because it combines authentication, OTP verification, media upload, moderation, and profile features in one app. The structure is understandable and practical. Its biggest area for improvement is backend authorization and validation, not the basic architecture itself.
