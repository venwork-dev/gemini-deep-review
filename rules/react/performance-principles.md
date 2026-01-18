---
id: react-performance-principles
title: React Performance Optimization Principles
type: principle
impact: HIGH
category: performance
tags: [react, performance, hooks, rendering]
---

## Core Principle

React applications should minimize unnecessary work at every level: data fetching, state updates, and rendering.

## Key Concepts to Consider

### 1. Parallel vs Sequential Operations
**Ask yourself**: Are there independent async operations running sequentially that could run in parallel?

**Think about**:
- Multiple API calls in the same component
- Data fetching in cascading useEffect hooks
- Sequential promises that don't depend on each other
- Loop iterations with async operations

**Impact**: On a 100ms latency connection, 3 sequential requests = 300ms, parallel = 100ms (3x faster!)

### 2. Effect Dependencies and Stale Closures
**Ask yourself**: Do all useEffect, useCallback, and useMemo hooks accurately declare their dependencies?

**Think about**:
- Are variables from outer scope used inside but not in deps array?
- Could this cause stale closures where old values are used?
- Would missing deps cause effects to not re-run when they should?
- Could this lead to bugs with outdated state or props?

**Impact**: Missing dependencies are one of the most common sources of React bugs.

### 3. Expensive Computations
**Ask yourself**: Are there expensive calculations running on every render that could be memoized?

**Think about**:
- Array transformations (map, filter, reduce)
- Complex formatting or calculations
- Sorting or searching operations
- Object/array creation in render

**When to optimize**: Profile first! Only memoize if it's actually slow. Premature optimization adds complexity.

### 4. State Update Patterns
**Ask yourself**: Are state updates using the correct pattern?

**Think about**:
- Updates based on previous state should use functional form
- Multiple setState calls in the same function
- Risk of race conditions with stale state
- Batch updates vs individual updates

### 5. Effect Cleanup
**Ask yourself**: Do effects properly clean up side effects?

**Think about**:
- Subscriptions (event listeners, WebSocket, intervals)
- Timers (setTimeout, setInterval)
- Async operations that might complete after unmount
- Memory leaks from uncleaned resources

## Questions to Guide Your Review

1. **Data Fetching**: Could any API calls be parallelized? Are there waterfall patterns?
2. **Dependencies**: Are all dependency arrays complete and accurate?
3. **Memoization**: Are expensive computations memoized when beneficial? Or over-memoized unnecessarily?
4. **State Updates**: Do updates use functional form when depending on previous state?
5. **Cleanup**: Are all subscriptions, timers, and listeners properly cleaned up?
6. **Re-renders**: Could component re-renders be reduced without over-engineering?

## Discovery Approach

Use these principles to **discover** performance issues, not just match patterns. Think about:
- Real-world usage scenarios (slow networks, large datasets)
- Edge cases that could cause problems
- Scalability implications
- Memory usage over time

Don't just look for exact code patterns—use your reasoning to understand performance implications in context.
