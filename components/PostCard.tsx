'use client';

import { useState, useEffect } from 'react';
import client from '@/lib/insforge';
import CommentSection from './CommentSection';
import CreatePost from './CreatePost';
import type { Post } from '@/lib/types';

interface PostCardProps {
  post: Post;
  onUpdate: () => void;
}

export default function PostCard({ post, onUpdate }: PostCardProps) {
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    checkUser();
    loadLikes();
    loadCommentCount();
  }, [post.id]);

  const checkUser = async () => {
    try {
      const { data } = await client.auth.getCurrentUser();
      if (data?.user) {
        setCurrentUserId(data.user.id);
        checkIfLiked(data.user.id);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    }
  };

  const loadLikes = async () => {
    try {
      const { data, error } = await client.database
        .from('likes')
        .select('id')
        .eq('post_id', post.id);

      if (!error && data) {
        setLikes(data.length);
      }
    } catch (error) {
      console.error('Error loading likes:', error);
    }
  };

  const checkIfLiked = async (userId: string) => {
    try {
      const { data, error } = await client.database
        .from('likes')
        .select('id')
        .eq('post_id', post.id)
        .eq('user_id', userId)
        .single();

      if (!error && data) {
        setLiked(true);
      }
    } catch (error) {
      setLiked(false);
    }
  };

  const loadCommentCount = async () => {
    try {
      const { data, error } = await client.database
        .from('comments')
        .select('id')
        .eq('post_id', post.id);

      if (!error && data) {
        setCommentCount(data.length);
      }
    } catch (error) {
      console.error('Error loading comment count:', error);
    }
  };

  const handleCommentUpdate = () => {
    loadCommentCount();
  };

  const handleEditComplete = () => {
    setIsEditing(false);
    onUpdate();
  };

  const handleLike = async () => {
    if (!currentUserId) {
      alert('Please sign in to like posts');
      return;
    }

    try {
      if (liked) {
        const { error } = await client.database
          .from('likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', currentUserId);

        if (!error) {
          setLiked(false);
          setLikes(likes - 1);
        }
      } else {
        const { data, error } = await client.database
          .from('likes')
          .insert([{ post_id: post.id, user_id: currentUserId }])
          .select()
          .single();

        if (!error && data) {
          setLiked(true);
          setLikes(likes + 1);
        } else if (error) {
          console.error('Error creating like:', error);
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleDelete = async () => {
    if (!currentUserId || currentUserId !== post.user_id) {
      alert('You can only delete your own posts');
      return;
    }

    if (!confirm('delete this post?')) {
      return;
    }

    try {
      // Verify ownership before deletion - add user_id filter for extra security
      const { error } = await client.database
        .from('posts')
        .delete()
        .eq('id', post.id)
        .eq('user_id', currentUserId);

      if (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post: ' + error.message);
      } else {
        onUpdate();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <article style={{ 
      border: '1px solid #000', 
      padding: '30px',
      background: '#fff'
    }}>
      <header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '15px',
        marginBottom: '20px',
        paddingBottom: '20px',
        borderBottom: '1px solid #000'
      }}>
        {currentUserId && post.users.avatar_url && (
          <img 
            src={post.users.avatar_url} 
            alt={post.users.nickname || 'User'} 
            style={{ 
              width: '40px', 
              height: '40px', 
              border: '1px solid #000',
              objectFit: 'cover'
            }}
          />
        )}
        <div style={{ flex: 1 }}>
          {currentUserId && (
            <>
              <div style={{ fontSize: '15px', fontWeight: 'normal', textTransform: 'lowercase' }}>
                {post.users.nickname || 'anonymous'}
              </div>
              <div style={{ fontSize: '12px', color: '#000', marginTop: '4px' }}>
                {formatDate(post.created_at)}
              </div>
            </>
          )}
        </div>
        {currentUserId === post.user_id && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setIsEditing(true)}
              style={{
                background: '#fff',
                color: '#000',
                padding: '8px 16px',
                fontSize: '13px',
                border: '1px solid #000',
                cursor: 'pointer',
                textTransform: 'lowercase'
              }}
            >
              edit
            </button>
            <button
              onClick={handleDelete}
              style={{
                background: '#fff',
                color: '#000',
                padding: '8px 16px',
                fontSize: '13px',
                border: '1px solid #000',
                cursor: 'pointer',
                textTransform: 'lowercase'
              }}
            >
              delete
            </button>
          </div>
        )}
      </header>

      {isEditing ? (
        <div style={{ marginTop: '20px' }}>
          <CreatePost 
            post={post} 
            onPostCreated={handleEditComplete} 
            onCancel={() => setIsEditing(false)}
          />
        </div>
      ) : (
        <>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: 'normal', 
            marginBottom: '20px',
            textTransform: 'lowercase',
            lineHeight: '1.6'
          }}>
            {post.title}
          </h2>

          <div style={{ 
            fontSize: '15px', 
            lineHeight: '1.85',
            marginBottom: '20px',
            whiteSpace: 'pre-wrap'
          }}>
            {post.content}
          </div>

          {post.tags && post.tags.length > 0 && (
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '8px',
              marginBottom: '20px'
            }}>
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  style={{
                    background: '#fff',
                    color: '#000',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 'normal',
                    border: '1px solid #000',
                    textTransform: 'lowercase'
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div style={{ 
            display: 'flex', 
            gap: '12px',
            alignItems: 'center',
            paddingTop: '20px',
            borderTop: '1px solid #000'
          }}>
            <button
              onClick={handleLike}
              disabled={!currentUserId}
              style={{
                background: liked ? '#000' : '#fff',
                color: liked ? '#fff' : '#000',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 'normal',
                border: '1px solid #000',
                cursor: currentUserId ? 'pointer' : 'not-allowed',
                textTransform: 'lowercase',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '13px' }}>▲</span>
              <span>{likes}</span>
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              style={{
                background: '#fff',
                color: '#000',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 'normal',
                border: '1px solid #000',
                cursor: 'pointer',
                textTransform: 'lowercase'
              }}
            >
              comments ({commentCount})
            </button>
          </div>

          {showComments && (
            <div style={{ marginTop: '30px', paddingTop: '30px', borderTop: '1px solid #000' }}>
              <CommentSection postId={post.id} onCommentUpdate={handleCommentUpdate} />
            </div>
          )}
        </>
      )}
    </article>
  );
}

