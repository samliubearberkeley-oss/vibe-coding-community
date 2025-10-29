'use client';

import { useState, useEffect } from 'react';
import client from '@/lib/insforge';
import type { Post } from '@/lib/types';

interface CreatePostProps {
  onPostCreated: () => void;
  post?: Post | null;
  onCancel?: () => void;
}

export default function CreatePost({ onPostCreated, post, onCancel }: CreatePostProps) {
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.content || '');
  const [tags, setTags] = useState(post?.tags?.join(', ') || '');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setTags(post.tags?.join(', ') || '');
    }
  }, [post]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (title.trim() && content.trim() && !submitting) {
        const form = e.currentTarget.closest('form');
        if (form) {
          form.requestSubmit();
        }
      }
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert("didn't catch your title or content, friend.");
      return;
    }

    if (title.trim().length > 200) {
      alert('title too long. max 200 characters.');
      return;
    }

    setSubmitting(true);

    try {
      const { data: userData } = await client.auth.getCurrentUser();
      
      if (!userData?.user) {
        alert('Please sign in to create a post');
        setSubmitting(false);
        return;
      }

      const tagsArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      if (post) {
        // Update existing post - verify ownership first
        if (post.user_id !== userData.user.id) {
          alert('You can only edit your own posts');
          setSubmitting(false);
          return;
        }

        const { error } = await client.database
          .from('posts')
          .update({
            title: title.trim(),
            content: content.trim(),
            tags: tagsArray.length > 0 ? tagsArray : null
          })
          .eq('id', post.id)
          .eq('user_id', userData.user.id) // Add user_id filter for extra security
          .select()
          .single();

        if (error) {
          console.error('Error updating post:', error);
          alert('Failed to update post: ' + error.message);
        } else {
          onPostCreated();
        }
      } else {
        // Create new post
        const postData = {
          user_id: userData.user.id,
          title: title.trim(),
          content: content.trim(),
          tags: tagsArray.length > 0 ? tagsArray : null
        };

        const { error } = await client.database
          .from('posts')
          .insert([postData])
          .select()
          .single();

        if (error) {
          console.error('Error creating post:', error);
          alert('Failed to create post: ' + error.message);
        } else {
          setTitle('');
          setContent('');
          setTags('');
          onPostCreated();
        }
      }
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Failed to save post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ border: '1px solid #000', padding: '40px', background: '#fff' }}>
      <div style={{ fontSize: '18px', fontWeight: 'normal', marginBottom: '30px', textTransform: 'lowercase' }}>
        {post ? 'edit post' : 'create new post'}
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'normal', marginBottom: '8px', textTransform: 'lowercase' }}>
            title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="enter post title..."
            maxLength={200}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: '#fff',
              color: '#000',
              border: '1px solid #000',
              fontSize: '15px',
              fontFamily: 'inherit'
            }}
            required
          />
          <div style={{ fontSize: '11px', marginTop: '6px', color: '#000' }}>
            {title.length}/200
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'normal', marginBottom: '8px', textTransform: 'lowercase' }}>
            content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="describe your coding idea..."
            onKeyDown={handleKeyDown}
            style={{
              width: '100%',
              minHeight: '200px',
              padding: '12px 16px',
              background: '#fff',
              color: '#000',
              border: '1px solid #000',
              fontSize: '15px',
              fontFamily: 'inherit',
              resize: 'vertical',
              lineHeight: '1.7'
            }}
            required
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'normal', marginBottom: '8px', textTransform: 'lowercase' }}>
            tags (comma separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="react, javascript, brutalist..."
            style={{
              width: '100%',
              padding: '12px 16px',
              background: '#fff',
              color: '#000',
              border: '1px solid #000',
              fontSize: '15px',
              fontFamily: 'inherit'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {post && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              style={{
                background: '#fff',
                color: '#000',
                padding: '12px 24px',
                fontSize: '15px',
                fontWeight: 'normal',
                border: '1px solid #000',
                cursor: submitting ? 'not-allowed' : 'pointer',
                textTransform: 'lowercase',
                opacity: submitting ? 0.5 : 1
              }}
            >
              cancel
            </button>
          )}
          <button
            type="submit"
            disabled={submitting || !title.trim() || !content.trim()}
            style={{
              flex: 1,
              background: submitting || !title.trim() || !content.trim() ? '#000' : '#fff',
              color: submitting || !title.trim() || !content.trim() ? '#fff' : '#000',
              padding: '12px 24px',
              fontSize: '15px',
              fontWeight: 'normal',
              border: '1px solid #000',
              cursor: submitting || !title.trim() || !content.trim() ? 'not-allowed' : 'pointer',
              textTransform: 'lowercase',
              opacity: submitting || !title.trim() || !content.trim() ? 0.5 : 1
            }}
          >
            {submitting ? (post ? 'updating...' : 'publishing...') : (post ? '[ update post ]' : '[ publish post ]')}
          </button>
        </div>
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#000', textAlign: 'center' }}>
          cmd/ctrl + enter to publish
        </div>
      </form>
    </div>
  );
}

