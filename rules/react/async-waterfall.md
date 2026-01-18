---
id: react-async-waterfall
title: Eliminate async waterfalls in data fetching
impact: CRITICAL
category: performance
tags: [react, async, performance, hooks]
---

## Problem
Sequential `await` calls or chained `.then()` create waterfalls that dramatically slow down data loading. Each request waits for the previous one to complete, even when they could run in parallel.

## Detection Patterns
- Multiple `await` statements where the second doesn't depend on the first
- Chained `useEffect` hooks that trigger each other
- Sequential `fetch` calls in the same function
- Data fetching inside loops without batching

## Impact
- Can increase page load time by 2-10x
- Poor user experience on slow networks
- Wasted server capacity
- Higher bounce rates

## Incorrect Examples

### ❌ Sequential awaits
```tsx
async function loadUserData() {
  const user = await fetch('/api/user');
  const posts = await fetch('/api/posts'); // Waits unnecessarily
  const comments = await fetch('/api/comments'); // Waits even longer
  return { user, posts, comments };
}
```

### ❌ Cascading useEffect
```tsx
function UserDashboard() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch('/api/user').then(setUser);
  }, []);

  useEffect(() => {
    if (user) {
      fetch('/api/posts').then(setPosts); // Waterfall!
    }
  }, [user]);
}
```

### ❌ Sequential fetch in loops
```tsx
async function loadMultipleUsers(ids: string[]) {
  const users = [];
  for (const id of ids) {
    const user = await fetch(`/api/users/${id}`); // Serial!
    users.push(user);
  }
  return users;
}
```

## Correct Examples

### ✅ Parallel awaits with Promise.all
```tsx
async function loadUserData() {
  const [user, posts, comments] = await Promise.all([
    fetch('/api/user'),
    fetch('/api/posts'),
    fetch('/api/comments')
  ]);
  return { user, posts, comments };
}
```

### ✅ Single useEffect with parallel fetching
```tsx
function UserDashboard() {
  const [data, setData] = useState({ user: null, posts: [] });

  useEffect(() => {
    Promise.all([
      fetch('/api/user'),
      fetch('/api/posts')
    ]).then(([user, posts]) => {
      setData({ user, posts });
    });
  }, []);
}
```

### ✅ Batched API call
```tsx
async function loadMultipleUsers(ids: string[]) {
  // Option 1: Parallel individual requests
  const users = await Promise.all(
    ids.map(id => fetch(`/api/users/${id}`))
  );

  // Option 2: Single batched request (better)
  const users = await fetch('/api/users/batch', {
    method: 'POST',
    body: JSON.stringify({ ids })
  });

  return users;
}
```

## Why This Matters
On a 3G connection (100ms latency):
- Sequential: 300ms (3 requests × 100ms each)
- Parallel: 100ms (all requests simultaneously)
- **3x faster!**

## Edge Cases
Sometimes sequential is correct:
```tsx
// ✅ Correct: Second call depends on first
async function loadUserAndTheirPosts(userId: string) {
  const user = await fetch(`/api/users/${userId}`);
  const posts = await fetch(`/api/posts?authorId=${user.id}`); // Needs user.id
  return { user, posts };
}
```
