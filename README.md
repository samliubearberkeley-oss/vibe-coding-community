# VIBE CODING COMMUNITY

A brutalist-style forum/community platform for vibe coders to share their web coding ideas.

## Features

- 🔐 **OAuth Authentication** - Google and GitHub login
- 📝 **Post Creation** - Share coding ideas with title, content, images, and tags
- 💬 **Comments** - Comment on posts
- ❤️ **Likes** - Like posts to show appreciation
- 🎨 **Brutalist UI** - Bold, raw, unapologetic design

## Tech Stack

- **Next.js 14** - React framework
- **InsForge** - Backend-as-a-Service (Database, Auth, Storage)
- **TypeScript** - Type safety

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
# Edit .env.local with your InsForge URL
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Backend Setup

The backend uses InsForge with the following structure:

- **Database Tables:**
  - `users` - User profiles
  - `posts` - Forum posts
  - `comments` - Post comments
  - `likes` - Post likes

- **Storage Buckets:**
  - `post-images` - Public bucket for post images

- **Authentication:**
  - Google OAuth
  - GitHub OAuth

## Project Structure

```
├── app/
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   └── globals.css      # Global styles
├── components/
│   ├── Auth.tsx         # Authentication component
│   ├── PostCard.tsx     # Post display component
│   ├── CreatePost.tsx   # Post creation form
│   └── CommentSection.tsx # Comments component
├── lib/
│   └── insforge.ts      # InsForge client setup
└── package.json
```

## License

MIT

