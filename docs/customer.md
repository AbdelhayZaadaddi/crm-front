# Customer Endpoints

Base path: `/api/customers`
All endpoints require a valid JWT token.

**Header required on every request:**
```
Authorization: Bearer <token>
```

---

## Endpoints

### Get All Customers

```
GET /api/customers
```

**Response `200`:**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "0600000000",
    "company": "Acme Corp",
    "notes": "VIP client",
    "createdAt": "2026-05-07T10:00:00",
    "updatedAt": "2026-05-07T10:00:00"
  }
]
```

---

### Get Customer by ID

```
GET /api/customers/{id}
```

**Path parameter:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `Long` | Customer ID |

**Response `200`:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "0600000000",
  "company": "Acme Corp",
  "notes": "VIP client",
  "createdAt": "2026-05-07T10:00:00",
  "updatedAt": "2026-05-07T10:00:00"
}
```

**Response `404`** — customer not found.

---

### Create Customer

```
POST /api/customers
```

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "0600000000",
  "company": "Acme Corp",
  "notes": "VIP client"
}
```

**Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | `String` | Yes | Not blank |
| `email` | `String` | No | Valid email format |
| `phone` | `String` | No | — |
| `company` | `String` | No | — |
| `notes` | `String` | No | — |

**Response `201`:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "0600000000",
  "company": "Acme Corp",
  "notes": "VIP client",
  "createdAt": "2026-05-07T10:00:00",
  "updatedAt": "2026-05-07T10:00:00"
}
```

**Response `400`** — validation error (e.g. blank name or invalid email).

---

### Update Customer

```
PUT /api/customers/{id}
```

**Path parameter:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `Long` | Customer ID |

**Body:** same fields as Create.

**Response `200`:** updated customer object (same shape as Create `201`).

**Response `400`** — validation error.
**Response `404`** — customer not found.

---

### Delete Customer

```
DELETE /api/customers/{id}
```

**Path parameter:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `Long` | Customer ID |

**Response `204`** — no content, customer deleted.

**Response `404`** — customer not found.
