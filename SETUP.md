# Setup Instructions

## 1. Install Dependencies

```bash
npm install
```

## 2. Environment Variables

Create a `.env.local` file in the root directory with:

```
NEXT_PUBLIC_INSFORGE_URL=https://8kzgpze9.us-east.insforge.app
```

## 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Backend Setup Complete

The backend is already configured with:
- ✅ Database tables: `posts`, `comments`, `likes`
- ✅ Storage bucket: `post-images` (public)
- ✅ OAuth providers: Google & GitHub

## Features

- **OAuth Authentication**: Sign in with Google or GitHub
- **Create Posts**: Share coding ideas with title, content, images, and tags
- **Comments**: Comment on posts
- **Likes**: Like posts to show appreciation
- **Brutalist UI**: Bold, raw, unapologetic design

## Usage

1. **Sign In**: Click "SIGN IN WITH GOOGLE" or "SIGN IN WITH GITHUB"
2. **Create Post**: Click "+ NEW POST" to share your coding idea
3. **Interact**: Like posts and add comments
4. **Manage**: Delete your own posts and comments

Enjoy sharing your vibe coding ideas! 🚀

