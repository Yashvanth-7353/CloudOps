# Deployment Logic Changes

## Summary
The deployment system has been updated to:
1. **Keep containers running persistently** instead of deleting them after deployment
2. **Provide live access URLs** to deployed applications accessible from any device
3. **Enable HTML/static site viewing** via the public FQDN endpoint

## Key Changes

### 1. ACI Container Lifecycle (`azure_orchestrator/aci_runner.py`)
- **Changed restart policy** from `Never` to `Always` 
  - Containers now run indefinitely and restart automatically if they crash
- **Added public IP and DNS exposure**
  - Containers are assigned a public FQDN (Fully Qualified Domain Name)
  - Example: `http://cg-my-app-abc123.southeastasia.azurecontainer.io`
- **Removed container deletion**
  - Container groups are no longer deleted after deployment
  - They continue running to serve traffic
- **Updated polling logic**
  - Now waits for "Running" state instead of "Succeeded/Failed" state
  - Captures and returns public IP + FQDN for live access

### 2. Backend Updates (`web_backend/server.js`)
- **Enhanced ACI task runner** to capture:
  - Public IP address
  - FQDN (Fully Qualified Domain Name)
  - Parses these from Python logs
- **Updated deployment summary** to include:
  - `containerIp`: Public IP address
  - `containerFqdn`: FQDN for DNS access
  - `appUrl`: Live access URL
- **Improved logging** with actual access URLs

### 3. Frontend Updates (`frontend/src/App.jsx`)
- **Made App URL clickable** and opens in new tab
- **Displays as a proper hyperlink** with styling
- **Shows live access link** once deployment completes

## How It Works Now

### Deployment Flow
1. User enters GitHub repo URL and app name
2. Backend builds Docker image locally
3. Image is pushed to Azure Container Registry (ACR)
4. Container is deployed to Azure Container Instances (ACI) with:
   - `restartPolicy=Always` (persistent)
   - Public IP enabled
   - Port 80 exposed for HTTP traffic
5. Backend waits for container to enter "Running" state
6. Public FQDN and IP are extracted from ACI
7. Frontend displays clickable link to access the deployed app

### Example Access URLs
- **FQDN-based**: `http://cg-my-app-abc123.southeastasia.azurecontainer.io`
- **IP-based**: `http://20.211.34.56:80`

## Testing Your HTML File

Since you mentioned having an HTML file in your GitHub repo:

1. **Deploy the repo** through CloudOps
2. **Click the App URL** in the frontend (or copy-paste from logs)
3. **Your HTML file should render** in the browser
4. **The container keeps running** - refresh anytime to see your content

## Container Management

### Viewing Running Containers
```bash
# In Azure Portal
az container list --resource-group cloud-ops-sea
```

### Accessing Container Logs
```bash
az container logs --resource-group cloud-ops-sea --name cg-<app-name>-<id>
```

### Stopping a Container
```bash
az container stop --resource-group cloud-ops-sea --name cg-<app-name>-<id>
```

### Deleting a Container
```bash
az container delete --resource-group cloud-ops-sea --name cg-<app-name>-<id>
```

## Important Notes

1. **Persistent containers consume Azure resources** - they will incur costs as long as they're running
2. **One container per deployment** - older deployments continue running unless manually deleted
3. **Port 80** is exposed for HTTP access (perfect for web apps and static sites)
4. **FQDN is based on container group name** - follows pattern: `cg-<appname>-<deployid>`
5. **Environment variables** can be passed via the deployment if needed

## Configuration

No additional environment variables needed - uses existing `.env` settings:
- `AZURE_STORAGE_CONNECTION_STRING` (for logs)
- `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_CLIENT_SECRET` (Azure auth)
- `ACR_LOGIN_SERVER`, `ACR_USERNAME`, `ACR_PASSWORD` (Docker registry)

## Troubleshooting

If you don't see a live URL:
1. Check backend logs in terminal for any errors
2. Verify Azure credentials in `.env` are correct
3. Ensure Docker image builds successfully
4. Check that ACR credentials allow push/pull
5. Verify Azure region availability for ACI

## Next Steps

To manage long-running containers effectively, consider:
1. Implementing a container cleanup/scaling strategy
2. Adding cost monitoring for persistent deployments
3. Setting resource quotas per deployment
4. Implementing auto-shutdown after idle time
