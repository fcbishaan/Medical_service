# Backend Architecture Documentation

## Interaction Diagram
```plantuml
[PASTE UML CODE FROM ABOVE]
```

## Package Diagram
```plantuml
[PASTE PACKAGE UML CODE]
```@

## Key Interactions:
1. **Routes** handle HTTP methods and delegate to controllers
2. **Controllers** contain business logic and model interactions
3. **Models** define data structures and DB operations
4. **Middleware** handles auth and validation flows

## Comment Reply Sequence

```mermaid
sequenceDiagram
    participant Patient
    participant Doctor
    participant Frontend
    participant Backend
    participant Database
    
    Patient->>Frontend: Post comment on feed
    Frontend->>Backend: POST /api/feeds/{feedId}/comments
    Backend->>Database: Store comment
    Database-->>Backend: Created comment
    Backend-->>Frontend: 201 Created
    
    Doctor->>Frontend: View feed comments
    Frontend->>Backend: GET /api/feeds/{feedId}/comments
    Backend-->>Frontend: 200 OK (comments list)
    
    Doctor->>Frontend: Submit reply
    Frontend->>Backend: POST /api/comments/{commentId}/reply
    Backend->>Backend: Validate doctor ownership
    Backend->>Database: Store doctor reply
    Database-->>Backend: Updated comment
    Backend-->>Frontend: 200 OK (updated comment)
    Frontend-->>Doctor: Show reply success
    
    alt Unauthorized Reply
        Backend-->>Frontend: 403 Forbidden
        Frontend-->>Doctor: Show permission error
    end
