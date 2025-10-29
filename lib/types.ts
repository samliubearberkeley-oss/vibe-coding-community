export interface User {
  id: string;
  email: string;
  role?: string;
}

export interface UserProfile {
  id: string;
  nickname: string | null;
  avatar_url: string | null;
  bio?: string | null;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  tags: string[] | null;
  created_at: string;
  user_id: string;
  users: {
    id: string;
    nickname: string | null;
    avatar_url: string | null;
  };
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  post_id: string;
  users: {
    id: string;
    nickname: string | null;
    avatar_url: string | null;
  };
}

