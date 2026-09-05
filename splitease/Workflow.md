# SplitEase — Application Workflow

This document visualizes the main user journeys and system interactions in SplitEase. Arrows show the direction of control or data flow. The current web client uses the shared Express API; the planned mobile client adds offline caching, push notifications, deep links, and device registration.

## 1. Application Entry and Authentication

```mermaid
flowchart TD
    Start([Open SplitEase]) --> Session{Existing session?}
    Session -->|No| AuthChoice{Choose action}
    Session -->|Yes| Validate[Validate JWT with\nGET /api/auth/me]
    Validate --> Valid{Token valid?}
    Valid -->|Yes| Dashboard[Open dashboard]
    Valid -->|No| Clear[Clear local token]
    Clear --> AuthChoice
    AuthChoice -->|Register| Register[Enter name, email, password]
    AuthChoice -->|Log in| Login[Enter email and password]
    Register --> RegisterAPI[POST /api/auth/register]
    RegisterAPI --> RegisterResult{Registration succeeds?}
    RegisterResult -->|No| RegisterError[Show validation or server error]
    RegisterError --> Register
    RegisterResult -->|Yes| Login
    Login --> LoginAPI[POST /api/auth/login]
    LoginAPI --> LoginResult{Credentials valid?}
    LoginResult -->|No| LoginError[Show login error]
    LoginError --> Login
    LoginResult -->|Yes| StoreToken[Store JWT]
    StoreToken --> Dashboard
```

## 2. Protected Navigation

```mermaid
flowchart LR
    Request[Route request] --> Loading{Auth state loading?}
    Loading -->|Yes| Spinner[Show loading state]
    Spinner --> Request
    Loading -->|No| User{Authenticated user?}
    User -->|No + public route| Public[Render login or register]
    User -->|No + protected route| Redirect[Redirect to /login]
    User -->|Yes + public route| HomeRedirect[Redirect to dashboard]
    User -->|Yes + protected route| Protected[Render dashboard or group detail]
```

## 3. Group Creation and Membership

```mermaid
flowchart TD
    Dashboard[Dashboard] --> Create[Choose create group]
    Create --> Form[Enter group name and description]
    Form --> Submit[POST /api/groups]
    Submit --> Created{Created?}
    Created -->|No| Error[Show form or API error]
    Error --> Form
    Created -->|Yes| Refresh[Refresh group list]
    Refresh --> Detail[Open group detail]
    Detail --> Search[Search user by name or email]
    Search --> Add[POST /api/groups/:id/members]
    Add --> MemberResult{Member added?}
    MemberResult -->|No| AddError[Show membership error]
    AddError --> Search
    MemberResult -->|Yes| UpdateMembers[Update member list]
    UpdateMembers --> Notify[Notify group members]
```

## 4. Add an Expense

```mermaid
flowchart TD
    Group[Open group detail] --> AddExpense[Choose add expense]
    AddExpense --> ExpenseForm[Enter description, amount, payer,\nsplit mode, and participants]
    ExpenseForm --> Validate[Validate required fields\nand split totals]
    Validate --> Valid{Form valid?}
    Valid -->|No| FieldError[Show field-level errors]
    FieldError --> ExpenseForm
    Valid -->|Yes| CreateExpense[POST /api/expenses]
    CreateExpense --> Saved{Saved by backend?}
    Saved -->|No| SaveError[Show API or network error]
    SaveError --> ExpenseForm
    Saved -->|Yes| Persist[Persist expense and split details]
    Persist --> Balance[Recalculate group balances]
    Persist --> Broadcast[Emit expense-created event]
    Persist --> NotifyMembers[Notify other group members]
    Balance --> UpdateCreator[Update creator's balance view]
    Broadcast --> UpdateClients[Refresh connected group clients]
    NotifyMembers --> UpdateOffline[Deliver notification to offline members]
```

## 5. Balance Calculation and Debt Simplification

```mermaid
flowchart TD
    Expenses[Group expenses] --> Paid[Total paid per member]
    Expenses --> Owed[Total owed per member]
    Paid --> Net[Calculate net balance\npaid minus owed]
    Owed --> Net
    Net --> Split[Separate creditors and debtors]
    Split --> Match[Match largest debtor\nwith largest creditor]
    Match --> Transfer[Create transfer for\nminimum outstanding amount]
    Transfer --> Remaining{All balances settled?}
    Remaining -->|No| Match
    Remaining -->|Yes| Debts[Return simplified debts]
    Debts --> UI[Render who owes whom]
```

## 6. Settle a Debt

```mermaid
flowchart TD
    Balances[View simplified balances] --> Select[Select a debt]
    Select --> Method{Choose payment method}
    Method -->|UPI| UPI[Build UPI deep link\nwith payee and amount]
    UPI --> PaymentApp[Open external UPI app]
    Method -->|QR| QR[Generate payment QR]
    QR --> Scan[Other person scans QR]
    Method -->|Cash or other| Manual[Agree payment externally]
    PaymentApp --> Paid[Payment completed externally]
    Scan --> Paid
    Manual --> Paid
    Paid --> Confirm[User chooses mark as paid]
    Confirm --> Record[POST /api/settlements]
    Record --> Saved{Settlement recorded?}
    Saved -->|No| SettlementError[Show error and keep debt open]
    Saved -->|Yes| SettlementEvent[Emit settlement-created event]
    SettlementEvent --> Refresh[Refresh settlements and balances]
    SettlementEvent --> Inform[Notify creditor]
```

## 7. Real-Time Group Updates

```mermaid
sequenceDiagram
    participant A as User A
    participant API as Express API
    participant DB as PostgreSQL
    participant Socket as Socket.IO
    participant B as User B

    B->>Socket: Connect while viewing group
    A->>API: Create expense or settlement
    API->>DB: Validate and persist change
    DB-->>API: Confirm saved record
    API->>Socket: Emit domain event to group room
    Socket-->>A: Update local state
    Socket-->>B: Update local state
    A->>API: Request refreshed balances
    B->>API: Request refreshed balances
    API->>DB: Recalculate from source data
    DB-->>API: Return current balances
    API-->>A: Return balances
    API-->>B: Return balances
```

## 8. Offline and Sync Workflow

```mermaid
flowchart TD
    Action[User opens cached group data] --> Online{Network available?}
    Online -->|Yes| Request[Send request to API]
    Online -->|No| OfflineRead[Render cached groups, expenses,\nbalances, or settlements]
    ActionWrite[User attempts a write action] --> Network[Attempt API request]
    Network --> Success{Request succeeds?}
    Success -->|Yes| Apply[Apply server response]
    Success -->|No: offline| Queue[Queue action locally]
    Queue --> Banner[Show offline sync banner]
    Banner --> Reconnect[Connection restored]
    Reconnect --> Process[Process queued actions in order]
    Process --> Synced{All actions accepted?}
    Synced -->|Yes| Clear[Clear queue and refresh data]
    Synced -->|No| Conflict[Show conflict or retry state]
```

## 9. Push Notification Lifecycle

```mermaid
flowchart LR
    Launch[App launch or login] --> Permission[Request notification permission]
    Permission --> Token[Receive FCM or APNs token]
    Token --> Register[POST /api/devices]
    Register --> Stored[Backend stores device token]
    Event[Expense, settlement, or member event] --> Recipients[Find affected group members]
    Recipients --> Exclude[Exclude event actor]
    Exclude --> Provider[Send through FCM or APNs]
    Provider --> Foreground{App foreground?}
    Foreground -->|Yes| Toast[Show toast and refresh state]
    Foreground -->|No| System[Show system notification]
    System --> Tap[User taps notification]
    Tap --> DeepLink[Open linked group, expense, or settlement]
```

## 10. Error and Recovery Paths

```mermaid
flowchart TD
    Request[API or socket request] --> Result{Result}
    Result -->|401| Logout[Clear token and return to login]
    Result -->|403| Forbidden[Show access denied message]
    Result -->|404| Missing[Show not found state]
    Result -->|Validation error| Correct[Highlight invalid fields]
    Result -->|500| ServerError[Show server error and log diagnostics]
    Result -->|Network failure| Retry[Show offline state or retry action]
    Result -->|Socket disconnect| Reconnect[Reconnect with backoff]
    Correct --> Request
    Retry --> Request
    Reconnect --> Connected[Resume live updates]
```

## 11. Deployment and Runtime Topology

```mermaid
flowchart TB
    Developer[Developer push] --> Repo[Git repository]
    Repo --> Render[Render deployment]
    Render --> Frontend[Frontend static site\nVite build]
    Render --> Backend[Backend web service\nNode + Express + Socket.IO]
    Render --> Database[(Managed PostgreSQL)]
    Frontend -->|HTTPS API calls| Backend
    Backend --> Database
    Backend -->|WebSocket events| Frontend
    Backend -->|Optional mobile push| Push[FCM / APNs]
```

## 12. Workflow Summary

```mermaid
flowchart LR
    Authenticate[Authenticate] --> Organize[Create or join group]
    Organize --> Record[Record shared expenses]
    Record --> Calculate[Calculate balances]
    Calculate --> Settle[Settle debts]
    Settle --> Sync[Sync clients and notify members]
    Sync --> Record
```