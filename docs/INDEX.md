# CloudOps Documentation Index

## Overview
Centralized documentation repository for the CloudOps multi-cloud deployment platform.

---

## 📋 Core Documentation

### Project Architecture & Planning
- [Phase 2 Architecture](./PHASE_2_ARCHITECTURE.md) - System design and component overview
- [Phase 2 Integration Checklist](./PHASE_2_INTEGRATION_CHECKLIST.md) - Integration requirements and tasks
- [Phase 2 Implementation](./PHASE_2_IMPLEMENTATION.md) - Implementation roadmap
- [Project Complete Details](./PROJECT_COMPLETE_DETAILS.md) - Final project specifications
- [Implementation Details](./IMPLEMENTATION_DETAILS.md) - Detailed technical specifications
- [Connected Repos Guide](./CONNECTED_REPOS_GUIDE.md) - Repository integration documentation

---

## ☁️ Cloud Deployment Guides

### AWS Deployment
- [AWS Integration Guide](./aws/AWS_INTEGRATION_GUIDE.md) - Complete AWS integration documentation
- [AWS Implementation Summary](./aws/AWS_IMPLEMENTATION_SUMMARY.md) - AWS feature overview
- [AWS Quick Reference](./aws/AWS_QUICK_REFERENCE.md) - Quick lookup guide
- [AWS Integration Examples](./aws/AWS_INTEGRATION_EXAMPLES.js) - Code examples

### Azure Deployment
- [Azure Integration](./azure/AZURE_INTEGRATION.md) - Azure Container Instance integration
- [Azure Integration Summary](./AZURE_INTEGRATION_SUMMARY.md) - Feature overview

---

## 📚 Archived Documentation

### Frontend Documentation (Legacy)
Archive of frontend development documentation:
- [ARCHITECTURE.md](./archived/frontend/ARCHITECTURE.md)
- [DEPLOYMENT_PIPELINE_SETUP.md](./archived/frontend/DEPLOYMENT_PIPELINE_SETUP.md)
- [FEATURES_CREATION_SUMMARY.md](./archived/frontend/FEATURES_CREATION_SUMMARY.md)
- [FEATURES_DELIVERY_SUMMARY.md](./archived/frontend/FEATURES_DELIVERY_SUMMARY.md)
- [FEATURES_DOCUMENTATION_INDEX.md](./archived/frontend/FEATURES_DOCUMENTATION_INDEX.md)
- [FEATURES_QUICK_REFERENCE.md](./archived/frontend/FEATURES_QUICK_REFERENCE.md)
- [HERO_CREATION_SUMMARY.md](./archived/frontend/HERO_CREATION_SUMMARY.md)
- [REQUIREMENTS_CHECKLIST.md](./archived/frontend/REQUIREMENTS_CHECKLIST.md)

---

## 🔧 Additional Resources

### Repository Structure
```
CloudOps/
├── backend/              # Node.js REST API & deployment engine
│   ├── src/             # Source code (controllers, models, services, etc.)
│   ├── package.json     # Dependencies
│   └── index.js         # Entry point
├── frontend/            # React 18 SPA dashboard
│   ├── src/            # React components and pages
│   ├── vite.config.ts  # Vite configuration
│   └── package.json    # Dependencies
├── azure/              # Azure orchestration
│   └── orchestrator/   # Python Azure SDK integration
├── scripts/            # Utility scripts
│   └── check_db.js    # Database verification
├── docs/               # Documentation (this folder)
└── README.md           # Project overview
```

### Key Files
- `backend/src/services/deploymentEngineService.js` - Core deployment orchestration
- `frontend/src/components/DeployProject.tsx` - Deployment interface
- `azure/orchestrator/core/aci_runner.py` - Azure Container Instance runner

---

## 📖 How to Use This Documentation

1. **Getting Started**: See README.md in project root
2. **Architecture Questions**: Check Phase 2 Architecture and Implementation Details
3. **Deployment Help**: 
   - AWS: See AWS Integration Guide
   - Azure: See Azure Integration
4. **Legacy Info**: Check archived documentation for historical context

---

**Last Updated**: January 2026
**Project**: CloudOps Multi-Cloud Deployment Platform
**Version**: 2.0
