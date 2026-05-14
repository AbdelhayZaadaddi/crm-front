# Analytics Module

Provides aggregated data for the CRM dashboard. All endpoints require a valid JWT Bearer token.

**Base URL:** `/api/analytics`

---

## Endpoints

### 1. Overview KPIs

```
GET /api/analytics/overview
```

Returns a single object with all dashboard summary counters — one call to populate all stat cards.

**Response:**
```json
{
  "totalCustomers": 120,
  "newCustomersThisMonth": 8,
  "totalCampaigns": 15,
  "sentCampaigns": 10,
  "draftCampaigns": 5,
  "totalTasks": 75,
  "todoTasks": 20,
  "inProgressTasks": 15,
  "doneTasks": 35,
  "cancelledTasks": 5,
  "overdueTasks": 3
}
```

---

### 2. Customer Growth by Month

```
GET /api/analytics/customers/growth?months=6
```

New customers registered per month. Use for a **line chart**.

| Param  | Type | Default | Description                     |
|--------|------|---------|---------------------------------|
| months | int  | `6`     | Number of past months to include |

**Response:**
```json
[
  { "year": 2025, "month": 12, "label": "Dec 2025", "count": 5 },
  { "year": 2026, "month": 1,  "label": "Jan 2026", "count": 12 },
  { "year": 2026, "month": 5,  "label": "May 2026", "count": 8 }
]
```

> Only months that have at least one customer are returned.

---

### 3. Task Status Distribution

```
GET /api/analytics/tasks/status
```

Count of tasks grouped by status. Use for a **donut/pie chart**.

**Response:**
```json
[
  { "label": "TODO",        "count": 20 },
  { "label": "IN_PROGRESS", "count": 15 },
  { "label": "DONE",        "count": 35 },
  { "label": "CANCELLED",   "count": 5  }
]
```

---

### 4. Task Priority Distribution

```
GET /api/analytics/tasks/priority
```

Count of tasks grouped by priority. Use for a **bar chart**.

**Response:**
```json
[
  { "label": "LOW",    "count": 10 },
  { "label": "MEDIUM", "count": 30 },
  { "label": "HIGH",   "count": 25 },
  { "label": "URGENT", "count": 10 }
]
```

---

### 5. Task Type Distribution

```
GET /api/analytics/tasks/type
```

Count of tasks grouped by type. Use for a **bar chart**.

**Response:**
```json
[
  { "label": "CALL",      "count": 15 },
  { "label": "MEETING",   "count": 8  },
  { "label": "EMAIL",     "count": 20 },
  { "label": "FOLLOW_UP", "count": 18 },
  { "label": "DEMO",      "count": 14 }
]
```

---

### 6. Task Workload by User

```
GET /api/analytics/tasks/workload
```

Number of assigned tasks per user. Use for a **horizontal bar chart** to visualize team load.

**Response:**
```json
[
  { "userId": 1, "userName": "Alice",   "taskCount": 25 },
  { "userId": 2, "userName": "Bob",     "taskCount": 18 },
  { "userId": 3, "userName": "Charlie", "taskCount": 10 }
]
```

> Sorted descending by `taskCount`. Unassigned tasks are excluded.

---

### 7. Campaign Status Distribution

```
GET /api/analytics/campaigns/status
```

Count of campaigns grouped by status. Use for a **donut/pie chart**.

**Response:**
```json
[
  { "label": "DRAFT", "count": 5  },
  { "label": "SENT",  "count": 10 }
]
```

---

### 8. Campaigns Monthly Trend

```
GET /api/analytics/campaigns/monthly?months=6
```

Campaigns created per month. Use for a **line or bar chart**.

| Param  | Type | Default | Description                     |
|--------|------|---------|---------------------------------|
| months | int  | `6`     | Number of past months to include |

**Response:**
```json
[
  { "year": 2025, "month": 12, "label": "Dec 2025", "count": 2 },
  { "year": 2026, "month": 1,  "label": "Jan 2026", "count": 4 },
  { "year": 2026, "month": 5,  "label": "May 2026", "count": 3 }
]
```

> Only months that have at least one campaign are returned.

---

## DTOs

| Record             | Fields                                                     |
|--------------------|------------------------------------------------------------|
| `OverviewResponse` | All KPI counters (see endpoint 1)                          |
| `MonthlyCountDTO`  | `year`, `month`, `label` (e.g. "Jan 2026"), `count`        |
| `DistributionEntry`| `label` (enum name), `count`                               |
| `TaskByUserDTO`    | `userId`, `userName`, `taskCount`                          |
