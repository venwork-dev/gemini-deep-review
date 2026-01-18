---
id: typescript-type-safety
title: TypeScript type safety and common pitfalls
impact: HIGH
category: correctness
tags: [typescript, types, safety]
---

## Problem
Improper TypeScript usage defeats the purpose of type safety, leading to runtime errors that could have been caught at compile time.

## Common Issues

### 1. Excessive Use of `any`

#### ❌ Incorrect
```tsx
function processUserData(data: any) {
  return data.user.name.toUpperCase(); // No safety!
}

// Runtime error if data structure changes
processUserData({ profile: { username: 'john' } });
```

#### ✅ Correct
```tsx
interface UserData {
  user: {
    name: string;
  };
}

function processUserData(data: UserData) {
  return data.user.name.toUpperCase(); // Type-safe!
}
```

### 2. Type Assertions Without Validation

#### ❌ Incorrect
```tsx
function handleApiResponse(response: unknown) {
  const data = response as { userId: string }; // Dangerous!
  return data.userId.toUpperCase();
}
```

#### ✅ Correct with Type Guard
```tsx
interface ApiResponse {
  userId: string;
}

function isApiResponse(response: unknown): response is ApiResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'userId' in response &&
    typeof (response as ApiResponse).userId === 'string'
  );
}

function handleApiResponse(response: unknown) {
  if (!isApiResponse(response)) {
    throw new Error('Invalid response format');
  }
  return response.userId.toUpperCase(); // Type-safe!
}
```

### 3. Non-Null Assertions Without Checks

#### ❌ Incorrect
```tsx
function getUserName(userId: string) {
  const user = users.find(u => u.id === userId);
  return user!.name; // Assumes user exists - can crash!
}
```

#### ✅ Correct
```tsx
function getUserName(userId: string): string | undefined {
  const user = users.find(u => u.id === userId);
  return user?.name; // Safe optional chaining
}

// Or with explicit check
function getUserNameOrThrow(userId: string): string {
  const user = users.find(u => u.id === userId);
  if (!user) {
    throw new Error(`User ${userId} not found`);
  }
  return user.name;
}
```

### 4. Implicit `any` in Catch Blocks

#### ❌ Incorrect
```tsx
try {
  await fetchData();
} catch (error) {
  // error is 'any' - no type safety
  console.error(error.message); // Could crash if error is not Error
}
```

#### ✅ Correct
```tsx
try {
  await fetchData();
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error('Unknown error:', error);
  }
}

// Or with helper
function isErrorWithMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  );
}
```

### 5. Weak Function Parameter Types

#### ❌ Incorrect
```tsx
interface User {
  id: string;
  name: string;
  email: string;
}

// Accepts any object with at least these properties
function updateUser(user: User) {
  api.update(user); // Might send extra properties!
}

updateUser({
  id: '1',
  name: 'John',
  email: 'john@example.com',
  password: 'secret123' // Accidentally sent!
});
```

#### ✅ Correct with Exact Types
```tsx
type ExactUser = {
  id: string;
  name: string;
  email: string;
};

function updateUser(user: ExactUser) {
  api.update(user);
}

// Or use Pick for specific fields
function updateUserName(data: Pick<User, 'id' | 'name'>) {
  api.update(data);
}
```

### 6. Ignoring Discriminated Unions

#### ❌ Incorrect
```tsx
type Result =
  | { success: true; data: string }
  | { success: false; error: string };

function handleResult(result: Result) {
  if (result.success) {
    console.log(result.data); // OK
  }
  // Forgot to handle failure case!
}
```

#### ✅ Correct
```tsx
type Result =
  | { success: true; data: string }
  | { success: false; error: string };

function handleResult(result: Result) {
  if (result.success) {
    console.log(result.data);
  } else {
    console.error(result.error); // Exhaustive handling
  }
}

// Or with switch for better exhaustiveness checking
function handleResultSwitch(result: Result) {
  switch (result.success) {
    case true:
      return result.data;
    case false:
      throw new Error(result.error);
    default:
      const _exhaustive: never = result; // Compile error if case missed
      throw new Error('Unhandled case');
  }
}
```

### 7. Array Methods Without Type Narrowing

#### ❌ Incorrect
```tsx
const items = ['apple', 'banana', null, 'cherry', undefined];

const upperCased = items.map(item => item.toUpperCase()); // Runtime error!
```

#### ✅ Correct
```tsx
const items = ['apple', 'banana', null, 'cherry', undefined];

const upperCased = items
  .filter((item): item is string => typeof item === 'string')
  .map(item => item.toUpperCase()); // Type-safe!
```

## TypeScript Config Recommendations

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

## Rules of Thumb

1. **Avoid `any`** - Use `unknown` and type guards instead
2. **Validate type assertions** - Use type guards, not blind assertions
3. **Handle all cases** - Use discriminated unions exhaustively
4. **Strict null checks** - Always handle null/undefined
5. **Type catch blocks** - Check error types before using
6. **Use utility types** - `Pick`, `Omit`, `Partial`, `Required`, `NonNullable`
