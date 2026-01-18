---
id: react-hooks-best-practices
title: React Hooks best practices and common pitfalls
impact: HIGH
category: correctness
tags: [react, hooks, useState, useEffect, useCallback]
---

## Problem
Improper use of React hooks leads to bugs, unnecessary re-renders, stale closures, and infinite loops.

## Common Issues

### 1. Missing Dependencies in useEffect

#### ❌ Incorrect
```tsx
function SearchResults({ query }: { query: string }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetch(`/api/search?q=${query}`)
      .then(res => res.json())
      .then(setResults);
  }, []); // Missing 'query' dependency!

  return <div>{results.map(r => <div key={r.id}>{r.title}</div>)}</div>;
}
```

**Issue**: Effect only runs once on mount. When `query` changes, the search doesn't re-run.

#### ✅ Correct
```tsx
function SearchResults({ query }: { query: string }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetch(`/api/search?q=${query}`)
      .then(res => res.json())
      .then(setResults);
  }, [query]); // Correct dependency

  return <div>{results.map(r => <div key={r.id}>{r.title}</div>)}</div>;
}
```

### 2. State Updates Based on Previous State

#### ❌ Incorrect
```tsx
function Counter() {
  const [count, setCount] = useState(0);

  const increment = () => {
    setCount(count + 1); // Stale closure risk!
    setCount(count + 1); // Won't increment by 2
  };

  return <button onClick={increment}>Count: {count}</button>;
}
```

**Issue**: Both `setCount` calls use the same `count` value. Clicking once only increments by 1.

#### ✅ Correct
```tsx
function Counter() {
  const [count, setCount] = useState(0);

  const increment = () => {
    setCount(prev => prev + 1); // Functional update
    setCount(prev => prev + 1); // Now increments by 2
  };

  return <button onClick={increment}>Count: {count}</button>;
}
```

### 3. Expensive Initial State

#### ❌ Incorrect
```tsx
function TodoList() {
  // calculateExpensiveValue() runs on EVERY render!
  const [todos, setTodos] = useState(calculateExpensiveValue());

  return <div>{todos.map(t => <Todo key={t.id} {...t} />)}</div>;
}
```

#### ✅ Correct
```tsx
function TodoList() {
  // Lazy initialization: only runs once on mount
  const [todos, setTodos] = useState(() => calculateExpensiveValue());

  return <div>{todos.map(t => <Todo key={t.id} {...t} />)}</div>;
}
```

### 4. Unnecessary useCallback/useMemo

#### ❌ Over-optimization
```tsx
function UserProfile({ userId }: { userId: string }) {
  // Unnecessary: string concatenation is cheap
  const greeting = useMemo(() => `Hello, user ${userId}!`, [userId]);

  // Unnecessary: function not passed to memoized child
  const handleClick = useCallback(() => {
    console.log('Clicked');
  }, []);

  return <div onClick={handleClick}>{greeting}</div>;
}
```

#### ✅ Correct (only when needed)
```tsx
const ExpensiveChild = memo(({ onAction }: { onAction: () => void }) => {
  // Expensive component
  return <div onClick={onAction}>Child</div>;
});

function Parent() {
  // ✅ Necessary: prevents ExpensiveChild re-render
  const handleAction = useCallback(() => {
    console.log('Action');
  }, []);

  return <ExpensiveChild onAction={handleAction} />;
}
```

### 5. Infinite Loop in useEffect

#### ❌ Incorrect
```tsx
function UserData() {
  const [data, setData] = useState({ user: null });

  useEffect(() => {
    fetch('/api/user')
      .then(res => res.json())
      .then(user => setData({ user })); // Creates new object every time
  }, [data]); // Dependency on object causes infinite loop!

  return <div>{data.user?.name}</div>;
}
```

#### ✅ Correct
```tsx
function UserData() {
  const [data, setData] = useState({ user: null });

  useEffect(() => {
    fetch('/api/user')
      .then(res => res.json())
      .then(user => setData({ user }));
  }, []); // Empty deps: only run once
  // Or use data.user as dependency if you need to refetch

  return <div>{data.user?.name}</div>;
}
```

### 6. Not Cleaning Up Effects

#### ❌ Incorrect
```tsx
function Timer() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
    // No cleanup! Timer keeps running after unmount
  }, []);

  return <div>{count}</div>;
}
```

#### ✅ Correct
```tsx
function Timer() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);

    return () => clearInterval(id); // Cleanup
  }, []);

  return <div>{count}</div>;
}
```

## Rules of Thumb

1. **Always include all dependencies** in useEffect/useCallback/useMemo deps arrays
2. **Use functional updates** when new state depends on old state
3. **Lazy initialize** expensive state calculations
4. **Clean up** subscriptions, timers, and event listeners
5. **Only optimize** with useCallback/useMemo when profiling shows it's needed
6. **Avoid objects/arrays** in dependency arrays unless stable
