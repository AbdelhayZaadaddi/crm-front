# Auth Implementation Plan — Login & Register

## Stack
- Next.js 16 (App Router)
- React 19
- Axios (to be installed)
- TypeScript
- Tailwind CSS

---

## Environment
`.env.local`:
```
NEXT_PUBLIC_API_URL=<backend server URL>
```

---

## API Contract

### Register

### POST /api/auth/register
Registers a new user account. The role is automatically set to `USER`.

**Request Body**
```json
{
  "name": "abdelhay zaadaddi",
  "email": "abdelhay@example.com",
  "password": "secret123"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | Yes | Full name of the user |
| `email` | String | Yes | Unique email address |
| `password` | String | Yes | Plain-text password (hashed with BCrypt before storing) |

**Response** `200 OK`
```json
{
  "message": "User registered successfully",
  "email": "abdelhay@example.com"
}
```

**Error** `400 Bad Request` — validation failure (missing or invalid fields).

```json
{
  "name": "Name is required",
  "email": "Email is required"
}
```
```

---

### Login

Authenticates a user and returns a JWT token valid for **24 hours**.

**Request Body**
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | String | Yes | Registered email address |
| `password` | String | Yes | Plain-text password |

**Response** `200 OK`
```json
{
  "status": "success",
  "message": "User authenticated successfully",
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```
```

---

## Token / Session Strategy
- Backend returns a JWT (or similar token) on successful login/register
- Token is stored in `localStorage` *(or httpOnly cookie — decide before implementation)*
- All subsequent API requests attach the token via `Authorization: Bearer <token>` header

---

## File Structure

```
app/
  (auth)/
    login/
      page.tsx          ← login page
    register/
      page.tsx          ← register page
  (protected)/
    dashboard/
      page.tsx          ← example protected page
lib/
  axios.ts              ← configured axios instance (baseURL, interceptors)
  auth.ts               ← login() and register() functions
proxy.ts                ← route protection (redirect unauthenticated users)
```

> Note: `proxy.ts` is the route-guard file in this version of Next.js (replaces `middleware.ts`).

---

## Implementation Steps

1. **Install axios**
   ```bash
   npm install axios
   ```

2. **Create `lib/axios.ts`**
   - Create an axios instance with `baseURL = process.env.NEXT_PUBLIC_API_URL`
   - Add a request interceptor that attaches the stored token to every request
   - Add a response interceptor that redirects to `/login` on 401

3. **Create `lib/auth.ts`**
   - `login(data)` — POST to login endpoint, store token, return user
   - `register(data)` — POST to register endpoint, store token, return user
   - `logout()` — clear stored token

4. **Create `app/(auth)/login/page.tsx`**
   - Client component (`'use client'`)
   - Controlled form with email + password fields
   - Calls `login()` on submit, handles loading and error states
   - On success: redirect to `/dashboard`

5. **Create `app/(auth)/register/page.tsx`**
   - Client component (`'use client'`)
   - Controlled form with the registration fields
   - Calls `register()` on submit, handles loading and error states
   - On success: redirect to `/dashboard` (or `/login`)

6. **Create `proxy.ts`**
   - Protect routes under `/(protected)` — redirect to `/login` if no token
   - Redirect authenticated users away from `/login` and `/register`

7. **Wire up types**
   - Define TypeScript interfaces for request bodies and API responses
   - Export from a shared `lib/types.ts`

---

## Notes / Decisions to Make Before Starting

- [ ] Confirm the exact endpoint paths from the backend
- [ ] Confirm all request fields (fill in the API Contract section above)
- [ ] Confirm the response shape (fill in the API Contract section above)
- [ ] Decide token storage: `localStorage` vs httpOnly cookie
- [ ] Confirm which fields are shown on the register form vs what was already listed
