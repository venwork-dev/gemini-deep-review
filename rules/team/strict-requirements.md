---
id: team-strict-requirements
title: Team Code Standards (Strict Requirements)
type: requirement
impact: HIGH
category: best-practice
tags: [team-standards, requirements]
---

## Team-Specific Standards

These are **mandatory** standards that must be followed in all code. Any violations should be flagged.

### 1. No `any` Type (STRICT)

❌ **NEVER ALLOWED**:
```typescript
function processData(data: any) { // VIOLATION
  return data.value;
}
```

✅ **REQUIRED**:
```typescript
function processData(data: unknown) {
  if (isValidData(data)) {
    return data.value;
  }
  throw new Error('Invalid data');
}
```

**Why**: `any` defeats TypeScript's purpose. Use `unknown` with type guards instead.

---

### 2. Always Clean Up Effects (STRICT)

❌ **NEVER ALLOWED**:
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    // do something
  }, 1000);
  // No cleanup! VIOLATION
}, []);
```

✅ **REQUIRED**:
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    // do something
  }, 1000);
  return () => clearInterval(interval); // Cleanup required
}, []);
```

**Why**: Memory leaks and continued execution after unmount cause bugs.

---

### 3. Functional State Updates (STRICT)

When new state depends on old state, **always** use functional form.

❌ **NEVER ALLOWED**:
```typescript
const increment = () => {
  setCount(count + 1); // VIOLATION when state depends on previous
};
```

✅ **REQUIRED**:
```typescript
const increment = () => {
  setCount(prev => prev + 1); // Correct
};
```

**Why**: Prevents race conditions and stale state bugs.

---

### 4. No Type Assertions Without Validation (STRICT)

❌ **NEVER ALLOWED**:
```typescript
const data = response as UserData; // VIOLATION - no validation
```

✅ **REQUIRED**:
```typescript
function isUserData(data: unknown): data is UserData {
  // Validate structure
  return typeof data === 'object' && /* ... */;
}

const data = response;
if (!isUserData(data)) {
  throw new Error('Invalid data');
}
// Now safe to use data as UserData
```

**Why**: Type assertions without validation can cause runtime crashes.

---

### 5. Explicit Error Handling (STRICT)

All catch blocks must handle errors properly.

❌ **NEVER ALLOWED**:
```typescript
try {
  await fetchData();
} catch (error) {
  console.log(error.message); // VIOLATION - error could be anything
}
```

✅ **REQUIRED**:
```typescript
try {
  await fetchData();
} catch (error) {
  if (error instanceof Error) {
    console.log(error.message);
  } else {
    console.log('Unknown error:', error);
  }
}
```

**Why**: Errors in JavaScript can be any type, not just Error objects.

---

## Enforcement

These requirements are **non-negotiable**. Any violation should be flagged as HIGH or CRITICAL severity, depending on the potential impact.

Team members should not merge PRs with violations of these standards.
