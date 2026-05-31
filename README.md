# CRM Frontend

> Next.js 16 · React 19 · TypeScript · Tailwind CSS

A modern CRM web application that communicates with a Spring Boot REST API secured with JWT authentication.

---

## Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 16.2.4 | Framework (App Router) |
| React | 19 | UI library |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 4 | Styling |
| Axios | 1.16 | HTTP client |
| Lucide React | 1.14 | Icons |

---

## System Architecture

```mermaid
graph TB
    subgraph Browser["Browser"]
        Auth["Auth Pages\n/login · /register"]
        Protected["Protected Pages\n/customers · /tasks · /campaigns · /settings"]
    end

    subgraph Middleware["Middleware"]
        Proxy["proxy.ts\nJWT Route Guard"]
    end

    subgraph APILayer["API Layer — src/lib"]
        AxiosInstance["axios.ts\nBase URL + Interceptors"]
        AuthLib["auth.ts"]
        CustomerLib["customers.ts"]
        TaskLib["tasks.ts"]
        CampaignLib["campaigns.ts"]
        UserLib["user.ts"]
    end

    subgraph Backend["Spring Boot API — port 9090"]
        AuthAPI["/api/auth"]
        CustomerAPI["/api/customers"]
        TaskAPI["/api/tasks"]
        CampaignAPI["/api/campaigns"]
        UserAPI["/api/user"]
        DB[("MySQL")]
        Mail["Mailtrap SMTP"]
    end

    Auth --> Proxy
    Protected --> Proxy
    Proxy -->|"token present"| AxiosInstance
    Proxy -->|"no token"| Auth

    AxiosInstance --> AuthLib
    AxiosInstance --> CustomerLib
    AxiosInstance --> TaskLib
    AxiosInstance --> CampaignLib
    AxiosInstance --> UserLib

    AuthLib --> AuthAPI
    CustomerLib --> CustomerAPI
    TaskLib --> TaskAPI
    CampaignLib --> CampaignAPI
    UserLib --> UserAPI

    AuthAPI --> DB
    CustomerAPI --> DB
    TaskAPI --> DB
    CampaignAPI --> DB
    CampaignAPI -->|"send"| Mail

    style Auth fill:#3b4252,stroke:#4c566a,color:#d8dee9
    style Protected fill:#3b4252,stroke:#4c566a,color:#d8dee9
    style Proxy fill:#434c5e,stroke:#4c566a,color:#eceff4
    style AxiosInstance fill:#2e3440,stroke:#4c566a,color:#d8dee9
    style AuthLib fill:#3b4252,stroke:#4c566a,color:#d8dee9
    style CustomerLib fill:#3b4252,stroke:#4c566a,color:#d8dee9
    style TaskLib fill:#3b4252,stroke:#4c566a,color:#d8dee9
    style CampaignLib fill:#3b4252,stroke:#4c566a,color:#d8dee9
    style UserLib fill:#3b4252,stroke:#4c566a,color:#d8dee9
    style AuthAPI fill:#434c5e,stroke:#4c566a,color:#eceff4
    style CustomerAPI fill:#434c5e,stroke:#4c566a,color:#eceff4
    style TaskAPI fill:#434c5e,stroke:#4c566a,color:#eceff4
    style CampaignAPI fill:#434c5e,stroke:#4c566a,color:#eceff4
    style UserAPI fill:#434c5e,stroke:#4c566a,color:#eceff4
    style DB fill:#2e3440,stroke:#4c566a,color:#d8dee9
    style Mail fill:#2e3440,stroke:#4c566a,color:#d8dee9
```

---

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant P as proxy.ts
    participant A as axios.ts
    participant B as Spring Boot

    U->>P: Visit /customers
    P->>P: Check JWT cookie
    alt No token
        P-->>U: Redirect to /login
        U->>B: POST /api/auth/login
        B-->>U: JWT token (24h)
        U->>U: Store in localStorage + cookie
    end
    P->>A: Forward request
    A->>A: Attach Authorization Bearer token
    A->>B: GET /api/customers
    B->>B: Validate JWT
    B-->>A: 200 OK + data
    A-->>U: Render page

    note over A,B: On 401/403 — clear token and redirect to /login
```

---

## Campaign Send Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Campaigns Page
    participant A as axios.ts
    participant B as Spring Boot
    participant M as Mailtrap

    U->>F: Click Send
    F->>U: Confirmation dialog
    U->>F: Confirm
    F->>A: POST /api/campaigns/:id/send
    A->>B: Request + JWT
    B->>B: Verify status is DRAFT
    loop For each customer
        B->>M: Send email
        B->>B: Wait 1.1s — Mailtrap rate limit
    end
    B->>B: Set status to SENT
    B-->>A: 200 OK + updated campaign
    A-->>F: Update state
    F-->>U: Campaign shows as SENT

    note over B,M: On 500 error — frontend refreshes list to get real status
```

---

## CI/CD Pipeline

```mermaid
graph LR
    subgraph Trigger["Trigger"]
        PUSH["Push to master"]
        PR["Pull Request to master"]
    end

    subgraph Pipeline["GitHub Actions — nextjs_ci.yml"]
        CHECKOUT["Checkout code"]
        NODE["Setup Node 20"]
        INSTALL["npm ci"]
        LINT["eslint"]
        TSC["tsc --noEmit"]
        BUILD["npm run build"]
    end

    subgraph Result["Result"]
        GREEN["Pass — safe to merge"]
        RED["Fail — check logs"]
    end

    PUSH --> CHECKOUT
    PR --> CHECKOUT
    CHECKOUT --> NODE
    NODE --> INSTALL
    INSTALL --> LINT
    LINT --> TSC
    TSC --> BUILD
    BUILD -->|"success"| GREEN
    BUILD -->|"failure"| RED
    LINT -->|"failure"| RED
    TSC -->|"failure"| RED

    style PUSH fill:#3b4252,stroke:#4c566a,color:#d8dee9
    style PR fill:#3b4252,stroke:#4c566a,color:#d8dee9
    style CHECKOUT fill:#434c5e,stroke:#4c566a,color:#eceff4
    style NODE fill:#434c5e,stroke:#4c566a,color:#eceff4
    style INSTALL fill:#434c5e,stroke:#4c566a,color:#eceff4
    style LINT fill:#434c5e,stroke:#4c566a,color:#eceff4
    style TSC fill:#434c5e,stroke:#4c566a,color:#eceff4
    style BUILD fill:#434c5e,stroke:#4c566a,color:#eceff4
    style GREEN fill:#2e3440,stroke:#4c566a,color:#a3be8c
    style RED fill:#2e3440,stroke:#4c566a,color:#bf616a
```

---

## Project Structure

```
crm-front/
├── src/
│   ├── app/
│   │   ├── (auth)/                   # Public pages — no sidebar
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (protected)/              # Private pages — JWT required
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── customers/page.tsx
│   │   │   ├── tasks/page.tsx
│   │   │   ├── campaigns/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   └── layout.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx                  # Redirects to /login
│   ├── components/
│   │   ├── Sidebar.tsx
│   │   ├── Alert.tsx
│   │   ├── TaskModal.tsx
│   │   ├── CustomerModal.tsx
│   │   └── CampaignModal.tsx
│   ├── lib/
│   │   ├── axios.ts                  # Axios instance + interceptors
│   │   ├── types.ts                  # All TypeScript interfaces
│   │   ├── auth.ts
│   │   ├── user.ts
│   │   ├── tasks.ts
│   │   ├── customers.ts
│   │   └── campaigns.ts
│   └── proxy.ts                      # Route protection
├── .env.local
├── .github/workflows/nextjs_ci.yml
├── package.json
└── tsconfig.json
```

---

## Pages Overview

| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | JWT authentication |
| Register | `/register` | Create new account |
| Dashboard | `/dashboard` | Overview |
| Customers | `/customers` | Customer CRUD — card grid |
| Tasks | `/tasks` | Task CRUD — kanban board |
| Campaigns | `/campaigns` | Campaign CRUD + email send |
| Settings | `/settings` | Update name and password |

---

## Getting Started

**1. Clone the repo**
```bash
git clone <repo-url>
cd crm-front
```

**2. Install dependencies**
```bash
npm install
```

**3. Create `.env.local`**
```
NEXT_PUBLIC_API_URL=http://localhost:9090
```

**4. Start the backend on port 9090, then run**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend base URL — e.g. `http://localhost:9090` |

---
