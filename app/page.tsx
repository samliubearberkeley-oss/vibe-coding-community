'use client';

import { useState, useEffect } from 'react';
import client from '@/lib/insforge';
import Auth from '@/components/Auth';
import PostCard from '@/components/PostCard';
import CreatePost from '@/components/CreatePost';
import type { User, Post } from '@/lib/types';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    checkUser();
    
    // Check user state periodically and on focus
    const interval = setInterval(() => {
      checkUser();
    }, 5000); // Check every 5 seconds
    
    const handleFocus = () => {
      checkUser();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  useEffect(() => {
    if (user) {
      loadPosts();
    } else {
      setLoading(false);
    }
  }, [user]);

  const checkUser = async () => {
    try {
      const { data } = await client.auth.getCurrentUser();
      if (data?.user) {
        setUser(data.user);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      const { data, error } = await client.database
        .from('posts')
        .select('*, users!inner(id, nickname, avatar_url)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error loading posts:', error);
        return;
      }

      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = () => {
    setShowCreate(false);
    loadPosts();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#000' }}>
      <header style={{ 
        borderBottom: '2px solid #000', 
        padding: '40px',
        background: '#fff'
      }}>
        <div style={{ 
          display: 'inline-block',
          border: '2px solid #000',
          padding: '12px 24px',
          background: '#fff',
          marginBottom: '30px',
          boxShadow: '4px 4px 0 0 #000'
        }}>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            textTransform: 'uppercase',
            letterSpacing: '3px',
            fontFamily: 'inherit',
            lineHeight: '1.2'
          }}>
            vibe
          </div>
          <div style={{ 
            fontSize: '18px', 
            fontWeight: 'normal', 
            textTransform: 'lowercase',
            letterSpacing: '2px',
            fontFamily: 'inherit',
            marginTop: '4px',
            opacity: 0.9
          }}>
            coding community
          </div>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ flex: '1 1 420px', minWidth: '250px', maxWidth: '420px' }}>
            <Auth />
          </div>
        </div>
      </header>

      <main style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
        {user && (
          <>
            {showCreate && (
              <div style={{ marginBottom: '60px' }}>
                <CreatePost onPostCreated={handlePostCreated} />
              </div>
            )}

            {!showCreate && !loading && posts.length > 0 && (
              <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                <button
                  onClick={() => setShowCreate(true)}
                  style={{
                    background: '#fff',
                    color: '#000',
                    padding: '12px 24px',
                    fontSize: '15px',
                    fontWeight: 'normal',
                    border: '1px solid #000',
                    cursor: 'pointer',
                    textTransform: 'lowercase'
                  }}
                >
                  [ create post ]
                </button>
              </div>
            )}

            {loading ? (
              <div style={{ 
                padding: '60px 40px', 
                textAlign: 'center',
                fontSize: '15px',
                border: '1px solid #000',
                background: '#fff'
              }}>
                loading posts...
              </div>
            ) : (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'minmax(0, 1fr)',
                gap: '40px',
                alignItems: 'start'
              }}
              className="post-grid"
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  {posts.length > 0 ? (
                    posts.map((post) => (
                      <PostCard key={post.id} post={post} onUpdate={loadPosts} />
                    ))
                  ) : (
                    <div style={{ 
                      border: '1px solid #000',
                      padding: '60px 40px',
                      textAlign: 'center',
                      background: '#fff'
                    }}>
                      <div style={{ fontSize: '18px', marginBottom: '15px', textTransform: 'lowercase' }}>
                        no posts yet
                      </div>
                      <div style={{ fontSize: '15px', marginBottom: '30px', textTransform: 'lowercase' }}>
                        be the first to share your vibe coding idea
                      </div>
                      <button
                        onClick={() => setShowCreate(true)}
                        style={{
                          background: '#fff',
                          color: '#000',
                          padding: '12px 24px',
                          fontSize: '15px',
                          fontWeight: 'normal',
                          border: '1px solid #000',
                          cursor: 'pointer',
                          textTransform: 'lowercase'
                        }}
                      >
                        [ create post ]
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

