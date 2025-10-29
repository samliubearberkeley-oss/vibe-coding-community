'use client';

import { useState, useEffect } from 'react';
import client from '@/lib/insforge';
import type { Comment } from '@/lib/types';

interface CommentSectionProps {
  postId: string;
  onCommentUpdate?: () => void;
}

export default function CommentSection({ postId, onCommentUpdate }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    checkUser();
    loadComments();
  }, [postId]);

  const checkUser = async () => {
    try {
      const { data } = await client.auth.getCurrentUser();
      if (data?.user) {
        setCurrentUserId(data.user.id);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    }
  };

  const loadComments = async () => {
    try {
      const { data, error } = await client.database
        .from('comments')
        .select('*, users!inner(id, nickname, avatar_url)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setComments(data);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUserId) {
      alert('Please sign in to comment');
      return;
    }

    if (!newComment.trim()) {
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await client.database
        .from('comments')
        .insert([{
          post_id: postId,
          user_id: currentUserId,
          content: newComment.trim()
        }]);

      if (!error) {
        setNewComment('');
        loadComments();
        onCommentUpdate?.();
      } else {
        console.error('Error creating comment:', error);
      }
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('delete this comment?')) {
      return;
    }

    try {
      const { error } = await client.database
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (!error) {
        loadComments();
        onCommentUpdate?.();
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <div style={{ fontSize: '15px', fontWeight: 'normal', marginBottom: '20px', textTransform: 'lowercase' }}>
        comments ({comments.length})
      </div>

      {currentUserId && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="write a comment..."
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '12px 16px',
              background: '#fff',
              color: '#000',
              border: '1px solid #000',
              fontSize: '15px',
              fontFamily: 'inherit',
              resize: 'vertical',
              lineHeight: '1.7'
            }}
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            style={{
              marginTop: '12px',
              background: submitting ? '#000' : '#fff',
              color: submitting ? '#fff' : '#000',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 'normal',
              border: '1px solid #000',
              cursor: submitting ? 'wait' : 'pointer',
              textTransform: 'lowercase'
            }}
          >
            {submitting ? 'submitting...' : '[ post comment ]'}
          </button>
        </form>
      )}

      {loading ? (
        <div style={{ padding: '30px', textAlign: 'center', fontSize: '14px', textTransform: 'lowercase' }}>
          loading comments...
        </div>
      ) : comments.length === 0 ? (
        <div style={{ padding: '30px', textAlign: 'center', fontSize: '14px', textTransform: 'lowercase' }}>
          no comments yet. be the first!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {comments.map((comment) => (
            <div
              key={comment.id}
              style={{
                border: '1px solid #000',
                padding: '20px',
                background: '#fff'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                {comment.users.avatar_url && (
                  <img
                    src={comment.users.avatar_url}
                    alt={comment.users.nickname || 'User'}
                    style={{
                      width: '28px',
                      height: '28px',
                      border: '1px solid #000',
                      objectFit: 'cover'
                    }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 'normal', textTransform: 'lowercase' }}>
                    {comment.users.nickname || 'anonymous'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#000', marginTop: '4px' }}>
                    {formatDate(comment.created_at)}
                  </div>
                </div>
                {currentUserId === comment.user_id && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    style={{
                      background: '#fff',
                      color: '#000',
                      padding: '6px 12px',
                      fontSize: '12px',
                      border: '1px solid #000',
                      cursor: 'pointer',
                      textTransform: 'lowercase'
                    }}
                  >
                    delete
                  </button>
                )}
              </div>
              <div style={{ fontSize: '14px', lineHeight: '1.75', whiteSpace: 'pre-wrap' }}>
                {comment.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

