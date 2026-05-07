# User Endpoints

> All endpoints below require a valid JWT token.

### Get Current User

Returns the profile of the currently authenticated user.

```
GET /api/user/me
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response `200`:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "USER"
}
```

**Response `403`** — if token is missing or invalid.

---

### Logout

Confirms logout on the server side. Because the API uses stateless JWT, the client **must delete the token** from storage after calling this endpoint.

```
POST /api/user/logout
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response `200`:**
```json
{
  "status": "success",
  "message": "Logged out successfully. Please delete your token on the client side."
}
```

**Response `403`** — if token is missing or invalid.

### Update Name

```
PATCH /api/user/me/name
```

**Body:**
```json
{
  "name": "Jane Doe"
}
```

**Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | `String` | Yes | Not blank |

**Response `200`:** updated user object.
```json
{
  "id": 1,
  "name": "Jane Doe",
  "email": "john@example.com",
  "role": "USER"
}
```

**Response `400`** — name is blank.
**Response `403`** — token missing or invalid.

---

### Update Password

```
PATCH /api/user/me/password
```

**Body:**
```json
{
  "oldPassword": "current123",
  "newPassword": "newpass456"
}
```

**Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `oldPassword` | `String` | Yes | Not blank |
| `newPassword` | `String` | Yes | Not blank, min 6 characters |

**Response `200`:**
```json
{
  "message": "Password updated successfully"
}
```

**Response `400`** — old password is wrong or new password fails validation.
```json
{
  "error": "Old password is incorrect"
}
```

**Response `403`** — token missing or invalid.
