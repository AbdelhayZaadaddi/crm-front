# Task API Documentation

Base URL: `/api/tasks`

All endpoints require a valid JWT token in the `Authorization` header:
```
Authorization: Bearer <token>
```

---

## Enums

### TaskType
| Value | Description |
|-------|-------------|
| `CALL` | Phone call with a contact |
| `MEETING` | Scheduled meeting |
| `EMAIL` | Email communication |
| `FOLLOW_UP` | Follow-up action |
| `DEMO` | Product demonstration |

### TaskStatus
| Value | Description |
|-------|-------------|
| `TODO` | Not started yet (default) |
| `IN_PROGRESS` | Currently being worked on |
| `DONE` | Completed |
| `CANCELLED` | Cancelled |

### TaskPriority
| Value | Description |
|-------|-------------|
| `LOW` | Low priority |
| `MEDIUM` | Medium priority (default) |
| `HIGH` | High priority |
| `URGENT` | Urgent — needs immediate attention |

---

## Endpoints

### GET /api/tasks
Returns all tasks.

**Response** `200 OK`
```json
[
  {
    "id": 1,
    "title": "Follow up call",
    "description": "Call the client about the new proposal",
    "type": "CALL",
    "status": "TODO",
    "priority": "HIGH",
    "deadline": "2026-05-10T10:00:00",
    "assignedUserId": 2,
    "assignedUserName": "John Doe",
    "createdAt": "2026-05-06T09:00:00",
    "updatedAt": "2026-05-06T09:00:00"
  }
]
```

---

### GET /api/tasks/{id}
Returns a single task by ID.

**Path Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Task ID |

**Response** `200 OK`
```json
{
  "id": 1,
  "title": "Follow up call",
  "description": "Call the client about the new proposal",
  "type": "CALL",
  "status": "TODO",
  "priority": "HIGH",
  "deadline": "2026-05-10T10:00:00",
  "assignedUserId": 2,
  "assignedUserName": "John Doe",
  "createdAt": "2026-05-06T09:00:00",
  "updatedAt": "2026-05-06T09:00:00"
}
```

**Error** `404 Not Found` — when task ID does not exist.

---

### POST /api/tasks
Creates a new task. The task can be left unassigned by omitting `assignedUserId`.

**Request Body**
```json
{
  "title": "Follow up call",
  "description": "Call the client about the new proposal",
  "type": "CALL",
  "status": "TODO",
  "priority": "HIGH",
  "deadline": "2026-05-10T10:00:00",
  "assignedUserId": 2
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `title` | String | Yes | — | Task title |
| `description` | String | No | null | Task description |
| `type` | TaskType | Yes | — | One of: CALL, MEETING, EMAIL, FOLLOW_UP, DEMO |
| `status` | TaskStatus | No | `TODO` | One of: TODO, IN_PROGRESS, DONE, CANCELLED |
| `priority` | TaskPriority | No | `MEDIUM` | One of: LOW, MEDIUM, HIGH, URGENT |
| `deadline` | LocalDateTime | No | null | ISO 8601 datetime (e.g. `2026-05-10T10:00:00`) |
| `assignedUserId` | Long | No | null | ID of the user to assign; omit to leave unassigned |

**Response** `201 Created`
```json
{
  "id": 1,
  "title": "Follow up call",
  "description": "Call the client about the new proposal",
  "type": "CALL",
  "status": "TODO",
  "priority": "HIGH",
  "deadline": "2026-05-10T10:00:00",
  "assignedUserId": 2,
  "assignedUserName": "John Doe",
  "createdAt": "2026-05-06T09:00:00",
  "updatedAt": "2026-05-06T09:00:00"
}
```

**Error** `400 Bad Request` — validation failure (missing required fields or invalid enum values).
**Error** `404 Not Found` — when `assignedUserId` does not match any user.

---

### PUT /api/tasks/{id}
Updates an existing task. To unassign the task, set `assignedUserId` to `null` or omit it.

**Path Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Task ID |

**Request Body** — same structure as POST.

**Response** `200 OK` — updated task object.

**Error** `404 Not Found` — task or assigned user not found.
**Error** `400 Bad Request` — validation failure.

---

### PUT /api/tasks/{id}/assign/{userId}
Assigns a task to a specific user without changing other task fields.

**Path Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Task ID |
| `userId` | Long | User ID to assign the task to |

**Response** `200 OK`
```json
{
  "id": 1,
  "title": "Follow up call",
  "assignedUserId": 3,
  "assignedUserName": "Jane Smith",
  ...
}
```

**Error** `404 Not Found` — task or user not found.

---

### PUT /api/tasks/{id}/unassign
Removes the assigned user from a task.

**Path Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Task ID |

**Response** `200 OK` — task with `assignedUserId` and `assignedUserName` set to `null`.

**Error** `404 Not Found` — task not found.

---

### DELETE /api/tasks/{id}
Deletes a task by ID.

**Path Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Task ID |

**Response** `204 No Content`

**Error** `404 Not Found` — task not found.

---

## Error Response Format

Validation errors return:
```json
{
  "title": "Title is required",
  "type": "Task type is required"
}
```

Entity not found errors return an HTTP `404` status.
