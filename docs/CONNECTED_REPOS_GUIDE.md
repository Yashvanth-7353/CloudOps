# Connected Repositories - Complete Guide

## Overview

Connected repositories are GitHub repositories that have been linked to your CloudOps workspace with automated webhooks for deployment. They are stored in MongoDB and can be fetched via the API.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Frontend (React)                                            │
│ ├─ RepoList.tsx loads connected repos on mount             │
│ └─ Calls: githubService.getConnectedRepositories()         │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
        ▼                                 ▼
┌─────────────────────┐         ┌──────────────────────┐
│  GitHub API         │         │  CloudOps Backend    │
│  /user/repos        │         │  /api/github/repos   │
│  (user's all repos) │         │  (just the user's    │
│                     │         │   GitHub repos)      │
└─────────────────────┘         └──────────────────────┘
                                         │
                                         ▼
                                  Backend Connects:
                                  - Creates webhook
                                  - Saves to MongoDB
                                         │
                                         ▼
                        ┌────────────────────────────┐
                        │  /api/github/connected     │
                        │  (MongoDB Projects query)  │
                        │                            │
                        │  Returns: Connected repos  │
                        │  from MongoDB              │
                        └────────────────────────────┘
                                         │
                                         ▼
                        ┌────────────────────────────┐
                        │  MongoDB                   │
                        │  ├─ Project collection     │
                        │  │  ├─ repositoryName      │
                        │  │  ├─ repositoryOwner     │
                        │  │  ├─ repositoryUrl       │
                        │  │  ├─ status              │
                        │  │  ├─ webhookId           │
                        │  │  ├─ createdAt           │
                        │  │  └─ ...                 │
                        │  └─ ...                    │
                        └────────────────────────────┘
```

## API Endpoints

### 1. **Get All Repositories from GitHub**
Fetches user's GitHub repositories (not yet connected to CloudOps).

```
GET /api/github/repos
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "repositories": [
    {
      "id": "123456",
      "name": "my-app",
      "fullName": "username/my-app",
      "description": "My awesome app",
      "language": "TypeScript",
      "updatedAt": "2024-05-14T10:00:00Z",
      "htmlUrl": "https://github.com/username/my-app",
      "cloneUrl": "https://github.com/username/my-app.git",
      "isPrivate": false,
      "defaultBranch": "main"
    }
  ]
}
```

### 2. **Get Connected Repositories from MongoDB** ⭐
Fetches repositories that have been connected to CloudOps (stored in MongoDB).

```
GET /api/github/connected
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "repositories": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "my-app",
      "fullName": "username/my-app",
      "repositoryUrl": "https://github.com/username/my-app",
      "isPrivate": false,
      "description": "My awesome app",
      "status": "connected",
      "createdAt": "2024-05-14T09:30:00Z",
      "updatedAt": "2024-05-14T10:00:00Z",
      "webhookId": "webhook-123456",
      "lastDeployedAt": "2024-05-14T10:30:00Z"
    }
  ]
}
```

### 3. **Connect a Repository**
Connects a GitHub repository (creates webhook + saves to MongoDB).

```
POST /api/github/connect
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "repositoryName": "my-app",
  "repositoryOwner": "username",
  "repositoryUrl": "https://github.com/username/my-app",
  "isPrivate": false,
  "description": "My awesome app"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Repository connected and automated deployment webhook created.",
  "project": {
    "id": "507f1f77bcf86cd799439011",
    "repositoryName": "my-app",
    "status": "connected"
  }
}
```

### 4. **Disconnect a Repository**
Removes a repository (deletes webhook + removes from MongoDB).

```
DELETE /api/github/disconnect/:owner/:repo
Authorization: Bearer <JWT_TOKEN>

Example: DELETE /api/github/disconnect/username/my-app
```

**Response:**
```json
{
  "success": true,
  "message": "Repository disconnected successfully."
}
```

## Database Schema (MongoDB - Projects Collection)

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  userId: "github-user-123",                    // GitHub user ID
  repositoryName: "my-app",
  repositoryOwner: "username",
  repositoryUrl: "https://github.com/...",
  isPrivate: false,
  description: "My awesome application",
  status: "connected" | "deploying" | "active" | "failed",
  githubWebhookId: "webhook-123456",           // GitHub webhook ID
  webhookSecret: "secret-hash",                // Webhook signature secret
  lastDeployedAt: ISODate("2024-05-14T10:30:00Z"),
  createdAt: ISODate("2024-05-14T09:30:00Z"),
  updatedAt: ISODate("2024-05-14T10:00:00Z")
}
```

## Frontend Integration

### Service Method (github-service.ts)

```typescript
// Get connected repositories from MongoDB
const data = await githubService.getConnectedRepositories();

// Returns:
{
  success: true,
  count: 3,
  repositories: ConnectedRepository[]
}
```

### Component Usage (RepoList.tsx)

```typescript
useEffect(() => {
  const loadConnectedRepos = async () => {
    try {
      const data = await githubService.getConnectedRepositories();
      
      const mapped = data.repositories.map(repo => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.fullName,
        // ... other fields
      }));

      setConnectedRepos(mapped);
    } catch (err) {
      console.error('Failed to load:', err);
    }
  };

  loadConnectedRepos();
}, []);
```

## Complete Workflow

### 1. **View GitHub Repositories**
- User navigates to Dashboard
- Frontend fetches all user's GitHub repos: `GET /api/github/repos`
- Displays list of repos user can connect

### 2. **Connect a Repository**
- User clicks "Connect repository"
- Frontend sends: `POST /api/github/connect`
- Backend:
  - Creates webhook on GitHub
  - Saves project to MongoDB
- Repo moves to "Connected" section

### 3. **View Connected Repositories**
- User navigates to Dashboard or Settings
- Frontend fetches connected repos: `GET /api/github/connected`
- Shows only repos from MongoDB (those with webhooks)

### 4. **Disconnect a Repository**
- User clicks "Remove" on a connected repo
- Frontend sends: `DELETE /api/github/disconnect/:owner/:repo`
- Backend:
  - Deletes webhook from GitHub
  - Removes project from MongoDB
- Repo removed from connected list

### 5. **Deploy a Connected Repository**
- User clicks "Deploy" on a connected repo
- Frontend navigates to DeployProject page
- Deployment engine uses MongoDB project info
- Deployment is created and tracked

## Data Flow Example

```
User Flow: Connect Repo "my-app"
│
├─ Fetch GitHub repos (GitHub API)
│  GET https://api.github.com/user/repos
│  ↓
│  Returns: 50 user's repos
│
├─ User selects "my-app" and clicks "Connect"
│  ↓
│  POST /api/github/connect
│  {
│    repositoryName: "my-app",
│    repositoryOwner: "username",
│    repositoryUrl: "https://...",
│    isPrivate: false
│  }
│
├─ Backend processes:
│  ├─ Creates webhook on GitHub
│  ├─ Gets webhook ID from GitHub
│  ├─ Saves to MongoDB: Project.create({...})
│  └─ Returns success
│
├─ Frontend receives success
│  └─ Moves repo to "Connected" section
│
└─ User can now deploy from this repo


Later... User Views Connected Repos
│
├─ GET /api/github/connected
│
├─ Backend queries MongoDB:
│  Project.find({ userId: "user-123" })
│
├─ Backend returns only repos that have webhooks
│  └─ "my-app" is included ✅
│
└─ Frontend displays: "my-app" in Connected section
```

## CLI Commands to Test

### Query MongoDB for connected repos:
```bash
# Connect to MongoDB
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/cloudops"

# View all projects
db.projects.find().pretty()

# View projects for specific user
db.projects.find({ userId: "github-user-123" }).pretty()

# Count connected repos
db.projects.countDocuments({ userId: "github-user-123" })

# View specific repo details
db.projects.findOne({ 
  repositoryName: "my-app",
  repositoryOwner: "username"
})
```

### Test API endpoints with cURL:

```bash
# Get connected repositories
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/api/github/connected

# Connect a repository
curl -X POST http://localhost:5000/api/github/connect \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "repositoryName": "my-app",
    "repositoryOwner": "username",
    "repositoryUrl": "https://github.com/username/my-app",
    "isPrivate": false
  }'

# Disconnect a repository
curl -X DELETE http://localhost:5000/api/github/disconnect/username/my-app \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Key Differences

| Aspect | GitHub API (/repos) | Connected (/connected) |
|--------|---------------------|----------------------|
| Source | GitHub.com API | MongoDB database |
| Scope | All user's GitHub repos | Only repos connected to CloudOps |
| Data | Repository details | Project + webhook info |
| Webhook | ❌ No webhook | ✅ Has webhook for auto-deploy |
| Status | N/A | connected/deploying/active/failed |
| Use Case | Browse & select repos to connect | Manage connected repos & deploy |

## Troubleshooting

### No connected repos showing?
1. Check MongoDB connection: `mongosh` command
2. Verify JWT token is valid
3. Check user ID matches in requests
4. Query: `db.projects.find({ userId: "your-user-id" })`

### Can't connect a repo?
1. Check GitHub OAuth token is valid
2. Verify repo access permissions
3. Check webhook creation isn't rate-limited
4. Backend logs for: "Attempting to create webhook..."

### Webhook not triggering?
1. Verify webhook exists on GitHub (Settings → Webhooks)
2. Check webhook secret matches
3. View GitHub webhook delivery logs
4. Backend logs for: "Webhook received"

