'use client';

import { useState, useEffect } from 'react';
import client from '@/lib/insforge';
import type { User, UserProfile } from '@/lib/types';

// Brutalist-style icons - accurate Google and GitHub logos
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    {/* Google G logo - accurate shape */}
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor"/>
  </svg>
);

const GitHubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
    {/* GitHub Octocat logo */}
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
  </svg>
);

export default function Auth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data, error } = await client.auth.getCurrentUser();
      if (data?.user && data?.profile) {
        setUser(data.user);
        setProfile(data.profile);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setOauthLoading(provider);
    try {
      const { data, error } = await client.auth.signInWithOAuth({
        provider,
        redirectTo: window.location.origin,
        skipBrowserRedirect: true
      });

      if (error) {
        console.error('OAuth error:', error);
        alert('oauth failed: ' + error.message);
        setOauthLoading(null);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('OAuth error:', error);
      setOauthLoading(null);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEmailLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await client.auth.signUp({
          email,
          password
        });

        if (error) {
          setError(error.message || 'signup failed');
          setEmailLoading(false);
          return;
        }

        if (data?.user) {
          await checkUser();
          setShowEmailForm(false);
          setEmail('');
          setPassword('');
        }
      } else {
        const { data, error } = await client.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          setError(error.message || 'login failed');
          setEmailLoading(false);
          return;
        }

        if (data?.user) {
          await checkUser();
          setShowEmailForm(false);
          setEmail('');
          setPassword('');
        }
      }
    } catch (error: any) {
      setError(error.message || 'something went wrong');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await client.auth.signOut();
      setUser(null);
      setProfile(null);
      window.location.reload();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '15px', textTransform: 'lowercase' }}>loading...</div>
      </div>
    );
  }

  if (user && profile) {
    return (
      <div style={{ 
        border: '1px solid #000', 
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        background: '#fff'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '15px', fontWeight: 'normal', marginBottom: '5px', textTransform: 'lowercase' }}>
            {profile.nickname || user.email}
          </div>
          {profile.avatar_url && (
            <img 
              src={profile.avatar_url} 
              alt={profile.nickname || 'Avatar'} 
              style={{ width: '32px', height: '32px', border: '1px solid #000', objectFit: 'cover', marginTop: '8px' }}
            />
          )}
        </div>
        <button
          onClick={handleSignOut}
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
          sign out
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      border: '2px solid #000', 
      padding: '40px 30px', 
      background: '#fff',
      maxWidth: '420px',
      width: '100%',
      boxShadow: '4px 4px 0 0 #000'
    }}>
      <div style={{ 
        fontSize: '16px', 
        fontWeight: 'normal', 
        marginBottom: '30px', 
        textAlign: 'center', 
        textTransform: 'lowercase',
        lineHeight: '1.6',
        letterSpacing: '0.5px'
      }}>
        join vibe coding community<br />
        <span style={{ fontSize: '14px', opacity: 0.8 }}>share your ideas</span>
      </div>
      
      {!showEmailForm ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <button
            onClick={() => setShowEmailForm(true)}
            style={{
              background: '#fff',
              color: '#000',
              padding: '14px 24px',
              fontSize: '15px',
              fontWeight: 'normal',
              border: '2px solid #000',
              cursor: 'pointer',
              textTransform: 'lowercase',
              width: '100%',
              transition: 'all 0.1s ease',
              boxShadow: '3px 3px 0 0 #000'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translate(-1px, -1px)';
              e.currentTarget.style.boxShadow = '4px 4px 0 0 #000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translate(0, 0)';
              e.currentTarget.style.boxShadow = '3px 3px 0 0 #000';
            }}
          >
            [ email / password ]
          </button>
          <div style={{ 
            marginTop: '8px',
            paddingTop: '20px',
            borderTop: '1px solid #000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}>
            <div style={{ flex: 1, height: '1px', background: '#000' }}></div>
            <span style={{ fontSize: '12px', textTransform: 'lowercase', opacity: 0.7 }}>or</span>
            <div style={{ flex: 1, height: '1px', background: '#000' }}></div>
          </div>
          <button
            onClick={() => handleOAuth('google')}
            disabled={oauthLoading === 'google'}
            style={{
              background: oauthLoading === 'google' ? '#000' : '#fff',
              color: oauthLoading === 'google' ? '#fff' : '#000',
              padding: '14px 24px',
              fontSize: '15px',
              fontWeight: 'normal',
              border: '2px solid #000',
              cursor: oauthLoading === 'google' ? 'wait' : 'pointer',
              textTransform: 'lowercase',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.1s ease',
              boxShadow: '3px 3px 0 0 #000'
            }}
            onMouseEnter={(e) => {
              if (oauthLoading !== 'google') {
                e.currentTarget.style.transform = 'translate(-1px, -1px)';
                e.currentTarget.style.boxShadow = '4px 4px 0 0 #000';
              }
            }}
            onMouseLeave={(e) => {
              if (oauthLoading !== 'google') {
                e.currentTarget.style.transform = 'translate(0, 0)';
                e.currentTarget.style.boxShadow = '3px 3px 0 0 #000';
              }
            }}
          >
            <GoogleIcon />
            <span>{oauthLoading === 'google' ? 'loading...' : '[ sign in with google ]'}</span>
          </button>
          <button
            onClick={() => handleOAuth('github')}
            disabled={oauthLoading === 'github'}
            style={{
              background: oauthLoading === 'github' ? '#000' : '#fff',
              color: oauthLoading === 'github' ? '#fff' : '#000',
              padding: '14px 24px',
              fontSize: '15px',
              fontWeight: 'normal',
              border: '2px solid #000',
              cursor: oauthLoading === 'github' ? 'wait' : 'pointer',
              textTransform: 'lowercase',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.1s ease',
              boxShadow: '3px 3px 0 0 #000'
            }}
            onMouseEnter={(e) => {
              if (oauthLoading !== 'github') {
                e.currentTarget.style.transform = 'translate(-1px, -1px)';
                e.currentTarget.style.boxShadow = '4px 4px 0 0 #000';
              }
            }}
            onMouseLeave={(e) => {
              if (oauthLoading !== 'github') {
                e.currentTarget.style.transform = 'translate(0, 0)';
                e.currentTarget.style.boxShadow = '3px 3px 0 0 #000';
              }
            }}
          >
            <GitHubIcon />
            <span>{oauthLoading === 'github' ? 'loading...' : '[ sign in with github ]'}</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleEmailAuth}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email"
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: '#fff',
                  color: '#000',
                  border: '2px solid #000',
                  fontSize: '15px',
                  fontFamily: 'inherit',
                  boxShadow: '2px 2px 0 0 #000'
                }}
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: '#fff',
                  color: '#000',
                  border: '2px solid #000',
                  fontSize: '15px',
                  fontFamily: 'inherit',
                  boxShadow: '2px 2px 0 0 #000'
                }}
              />
            </div>
            {error && (
              <div style={{ 
                fontSize: '13px', 
                color: '#000', 
                padding: '12px', 
                border: '2px solid #000', 
                background: '#fff', 
                textTransform: 'lowercase',
                boxShadow: '2px 2px 0 0 #000'
              }}>
                {error}
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button
                type="submit"
                disabled={emailLoading}
                style={{
                  flex: 1,
                  background: emailLoading ? '#000' : '#fff',
                  color: emailLoading ? '#fff' : '#000',
                  padding: '14px 24px',
                  fontSize: '15px',
                  fontWeight: 'normal',
                  border: '2px solid #000',
                  cursor: emailLoading ? 'wait' : 'pointer',
                  textTransform: 'lowercase',
                  boxShadow: '3px 3px 0 0 #000',
                  transition: 'all 0.1s ease'
                }}
                onMouseEnter={(e) => {
                  if (!emailLoading) {
                    e.currentTarget.style.transform = 'translate(-1px, -1px)';
                    e.currentTarget.style.boxShadow = '4px 4px 0 0 #000';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!emailLoading) {
                    e.currentTarget.style.transform = 'translate(0, 0)';
                    e.currentTarget.style.boxShadow = '3px 3px 0 0 #000';
                  }
                }}
              >
                {emailLoading ? 'loading...' : isSignUp ? '[ sign up ]' : '[ sign in ]'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                }}
                style={{
                  flex: 1,
                  background: '#fff',
                  color: '#000',
                  padding: '14px 24px',
                  fontSize: '15px',
                  fontWeight: 'normal',
                  border: '2px solid #000',
                  cursor: 'pointer',
                  textTransform: 'lowercase',
                  boxShadow: '3px 3px 0 0 #000',
                  transition: 'all 0.1s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translate(-1px, -1px)';
                  e.currentTarget.style.boxShadow = '4px 4px 0 0 #000';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translate(0, 0)';
                  e.currentTarget.style.boxShadow = '3px 3px 0 0 #000';
                }}
              >
                {isSignUp ? '[ sign in ]' : '[ sign up ]'}
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowEmailForm(false);
                setEmail('');
                setPassword('');
                setError(null);
              }}
              style={{
                background: '#fff',
                color: '#000',
                padding: '10px 16px',
                fontSize: '13px',
                fontWeight: 'normal',
                border: '1px solid #000',
                cursor: 'pointer',
                textTransform: 'lowercase',
                width: '100%',
                marginTop: '4px'
              }}
            >
              [ back ]
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

