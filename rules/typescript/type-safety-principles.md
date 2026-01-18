---
id: typescript-type-safety-principles
title: TypeScript Type Safety Principles
type: principle
impact: HIGH
category: correctness
tags: [typescript, types, safety]
---

## Core Principle

TypeScript's purpose is to catch errors at compile time that would otherwise crash at runtime. Any code that defeats this purpose is a problem.

## Key Concepts to Consider

### 1. Type Safety vs Type Theater
**Ask yourself**: Is this code actually type-safe, or just passing the type checker?

**Red flags**:
- Excessive use of `any` (defeats entire purpose of TypeScript)
- Type assertions (`as`) without runtime validation
- Non-null assertions (`!`) without null checks
- Implicit `any` in catch blocks

**Think about**: Would this crash if the actual data doesn't match assumptions?

### 2. Runtime Validation
**Ask yourself**: Are external data sources properly validated?

**Consider**:
- API responses (network requests)
- User input (forms, URL params)
- LocalStorage/SessionStorage data
- Third-party library outputs
- JSON parsing results

**Principle**: **Never trust external data**. Always validate with type guards before using type assertions.

### 3. Null and Undefined Handling
**Ask yourself**: Are all nullable values properly handled?

**Think about**:
- Array methods like `.find()` return `T | undefined`
- Optional properties might not exist
- Nullable function parameters
- Optional chaining (`?.`) vs non-null assertion (`!`)

**Impact**: Non-null assertions on possibly-null values are the #1 cause of TypeScript crashes.

### 4. Discriminated Unions
**Ask yourself**: Are all cases in a union type handled exhaustively?

**Pattern**: Use `never` type to ensure exhaustive checking
**Benefit**: Compiler tells you when you forgot a case
**Impact**: Prevents bugs when new cases are added later

### 5. Type Narrowing
**Ask yourself**: Are type guards used properly to narrow types?

**Techniques**:
- `typeof` checks for primitives
- `instanceof` for classes
- Custom type guard functions (`is` predicates)
- Discriminated union patterns

**Think about**: Array methods like `.filter()` need proper type predicates to narrow types.

## Questions to Guide Your Review

1. **Any types**: Is `any` used anywhere? Can it be replaced with `unknown` + type guards?
2. **Assertions**: Are there type assertions without runtime validation?
3. **Non-null**: Are there `!` operators on values that could actually be null/undefined?
4. **External data**: Are API responses and user inputs validated before use?
5. **Error handling**: Are catch blocks typed properly?
6. **Exhaustiveness**: Are discriminated unions checked exhaustively?
7. **Utility types**: Could built-in utilities (`Pick`, `Omit`, `Partial`, etc.) improve safety?

## Discovery Approach

Think about the **data flow**:
1. Where does data come from? (API, user, storage)
2. What could go wrong with that data? (null, wrong shape, missing fields)
3. Would TypeScript catch the problem, or would it crash at runtime?
4. Is there a type guard or validation protecting against that?

## Anti-Patterns to Discover

Not just exact matches, but situations where:
- Type assertions bypass safety without validation
- Assumptions about data are unverified
- Error handling doesn't account for actual error types
- Nullable values are accessed unsafely
- Type narrowing is incomplete

Use your expertise to find scenarios where TypeScript's guarantees are violated or weakened.
