import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  bio?: string;
}

interface UserProfileProps {
  userId: string;
}

/**
 * UserProfile component - displays user information and their posts
 *
 * INTENTIONAL ISSUES FOR TESTING:
 * 1. Async waterfall - sequential fetches that could be parallel
 * 2. Missing dependency in useEffect
 * 3. State update without functional form
 * 4. No cleanup for event listener
 * 5. Type assertion without validation
 * 6. Expensive computation in render without useMemo
 */
export function UserProfile({ userId }: UserProfileProps) {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // ISSUE 1: Async waterfall - sequential fetches
  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      // These could run in parallel but they're sequential!
      const userResponse = await fetch(`/api/users/${userId}`);
      const userData = await userResponse.json();
      setUser(userData);

      const postsResponse = await fetch(`/api/posts?userId=${userId}`);
      const postsData = await postsResponse.json();
      setPosts(postsData);

      const commentsResponse = await fetch(`/api/comments?userId=${userId}`);
      const commentsData = await commentsResponse.json();
      setComments(commentsData);

      setLoading(false);
    }

    fetchData();
  }, []); // ISSUE 2: Missing userId dependency!

  // ISSUE 3: State update without functional form (race condition risk)
  const handleRetry = () => {
    setRetryCount(retryCount + 1); // Should use functional form
    setRetryCount(retryCount + 1); // This won't increment by 2!
  };

  // ISSUE 4: No cleanup for event listener
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('User left the page');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    // Missing cleanup!
  }, []);

  // ISSUE 5: Type assertion without validation
  const getUserBio = () => {
    const response = localStorage.getItem('userBio');
    const bioData = response as { bio: string; lastUpdated: string }; // Dangerous!
    return bioData.bio.toUpperCase(); // Could crash if structure is wrong
  };

  // ISSUE 6: Expensive computation without useMemo
  const processedPosts = posts.map(post => {
    // Imagine this is expensive
    return {
      ...post,
      formattedDate: new Date(post.createdAt).toLocaleDateString(),
      wordCount: post.content?.split(' ').length || 0,
      readingTime: Math.ceil((post.content?.split(' ').length || 0) / 200),
    };
  }); // Runs on every render!

  // ISSUE 7: Stale closure in event handler
  const handlePostClick = (postId: string) => {
    // This captures the current value of 'user', might be stale
    console.log(`User ${user?.name} clicked post ${postId}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="user-profile">
      <div className="user-header">
        <h1>{user.name}</h1>
        <p>{user.email}</p>
        {user.bio && <p className="bio">{user.bio}</p>}
      </div>

      <div className="user-posts">
        <h2>Posts ({processedPosts.length})</h2>
        {processedPosts.map(post => (
          <div
            key={post.id}
            className="post"
            onClick={() => handlePostClick(post.id)}
          >
            <h3>{post.title}</h3>
            <p>{post.content}</p>
            <small>
              {post.formattedDate} • {post.readingTime} min read
            </small>
          </div>
        ))}
      </div>

      <div className="user-comments">
        <h2>Comments ({comments.length})</h2>
        {comments.map((comment: any) => (
          <div key={comment.id} className="comment">
            <p>{comment.text}</p>
          </div>
        ))}
      </div>

      <button onClick={handleRetry}>
        Retry ({retryCount})
      </button>

      {/* ISSUE 8: NOT IN ANY RULE - Accessibility issue that AI should discover */}
      <div className="actions">
        <div onClick={() => console.log('Delete user')}>Delete</div>
        <div onClick={() => console.log('Edit user')}>Edit</div>
        <div onClick={() => console.log('Share profile')}>Share</div>
      </div>

      {/* ISSUE 9: NOT IN ANY RULE - Hardcoded API URL */}
      <img src="https://api.example.com/avatar/12345" alt="avatar" />

      {/* ISSUE 10: NOT IN ANY RULE - No loading/error states */}
      <div className="stats">
        <span>Posts: {posts.length}</span>
        <span>Comments: {comments.length}</span>
      </div>
    </div>
  );
}
