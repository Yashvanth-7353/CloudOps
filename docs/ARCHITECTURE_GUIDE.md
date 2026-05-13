# CloudOps - Production Architecture Guide

A comprehensive guide to building a scalable, production-grade cloud deployment platform.

---

## TABLE OF CONTENTS

1. [Architecture Overview](#architecture-overview)
2. [Complete Folder Structure](#complete-folder-structure)
3. [Phase-by-Phase Implementation](#phase-by-phase-implementation)
4. [API Design](#api-design)
5. [Database Schema](#database-schema)
6. [AWS Architecture](#aws-architecture)
7. [Docker Workflow](#docker-workflow)
8. [ECS Deployment Workflow](#ecs-deployment-workflow)
9. [Real-time Logs Architecture](#real-time-logs-architecture)
10. [Deployment Queue System](#deployment-queue-system)
11. [Production Deployment](#production-deployment)

---

## ARCHITECTURE OVERVIEW

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLOUDOPS PLATFORM                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                   FRONTEND (React + Vite)                    │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐    │  │
│  │  │ Dashboard   │  │  Deploy     │  │  Monitoring      │    │  │
│  │  │ Components  │  │  Forms      │  │  & Logs          │    │  │
│  │  └─────────────┘  └─────────────┘  └──────────────────┘    │  │
│  │         │                │                  │               │  │
│  │         └────────────────┴──────────────────┘               │  │
│  │                    Socket.IO                                │  │
│  │         (Real-time logs & deployment status)               │  │
│  └────────────────────┬───────────────────────────────────────┘  │
│                       │                                           │
│  ┌────────────────────┴───────────────────────────────────────┐  │
│  │              API GATEWAY / LOAD BALANCER                   │  │
│  │  (Request routing, authentication, rate limiting)          │  │
│  └────────────────────┬───────────────────────────────────────┘  │
│                       │                                           │
│  ┌────────────────────┴───────────────────────────────────────┐  │
│  │             BACKEND (Node.js + Express)                    │  │
│  │                                                             │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │  │
│  │  │ Controllers  │  │  Services    │  │  Repositories│    │  │
│  │  │              │  │              │  │  (MongoDB)   │    │  │
│  │  │ - Auth       │  │ - Deploy     │  │              │    │  │
│  │  │ - Deploy     │  │ - AWS        │  │ Deployment   │    │  │
│  │  │ - Monitor    │  │ - Docker     │  │ User         │    │  │
│  │  │ - GitHub     │  │ - Git        │  │ Log          │    │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │  │
│  │                                                             │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │  Middleware: Auth, Logging, Error Handling           │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  └────────────────────┬───────────────────────────────────────┘  │
│                       │                                           │
│  ┌────────────────────┴───────────────────────────────────────┐  │
│  │            MICROSERVICES & BACKGROUND JOBS                 │  │
│  │                                                             │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │  │
│  │  │   Docker     │  │   Git Clone  │  │   Framework  │    │  │
│  │  │   Builder    │  │   Service    │  │   Detector   │    │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │  │
│  │                                                             │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │  Job Queue (Redis + BullMQ)                          │  │  │
│  │  │  - Deployment queue                                 │  │  │
│  │  │  - Build queue                                      │  │  │
│  │  │  - Log streaming queue                              │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  └────────────────────┬───────────────────────────────────────┘  │
│                       │                                           │
│  ┌────────────────────┴───────────────────────────────────────┐  │
│  │               DATA LAYER                                    │  │
│  │                                                             │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │  │
│  │  │   MongoDB    │  │    Redis     │  │  CloudWatch  │    │  │
│  │  │              │  │              │  │    Logs      │    │  │
│  │  │ Persistence  │  │ Caching &    │  │              │    │  │
│  │  │              │  │ Job Queue    │  │ Monitoring   │    │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │  │
│  └────────────────────┬───────────────────────────────────────┘  │
│                       │                                           │
│  ┌────────────────────┴───────────────────────────────────────┐  │
│  │              AWS SERVICES (Cloud)                          │  │
│  │                                                             │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │  │
│  │  │     ECR      │  │   ECS Fargate│  │   CloudWatch │    │  │
│  │  │              │  │              │  │              │    │  │
│  │  │ Image Registry   │ Container  │  │ Logs &       │    │  │
│  │  │              │  │ Orchestration  │ Monitoring   │    │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │  │
│  │                                                             │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │  │
│  │  │   Route53    │  │     ALB      │  │    IAM       │    │  │
│  │  │              │  │              │  │              │    │  │
│  │  │ DNS & Custom │  │ Load Balancer│  │ Role-based   │    │  │
│  │  │ Subdomains   │  │              │  │ Access       │    │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

```

### Key Components

| Component | Purpose | Technology |
|-----------|---------|-----------|
| Frontend | User dashboard & deployment UI | React, Vite, TypeScript |
| Backend API | Core business logic | Node.js, Express.js |
| Database | Persistence layer | MongoDB |
| Cache & Queue | Job processing & rate limiting | Redis, BullMQ |
| Container Registry | Store Docker images | AWS ECR |
| Container Orchestration | Run containers at scale | AWS ECS Fargate |
| DNS Management | Custom subdomains | AWS Route53 |
| Load Balancing | Distribute traffic | AWS ALB |
| Monitoring | Logs & metrics | AWS CloudWatch |
| Git Integration | Repository management | GitHub API |

---

## COMPLETE FOLDER STRUCTURE

```
CloudOps/
│
├── backend/                               # Node.js backend
│   ├── src/
│   │   ├── config/                        # Configuration files
│   │   │   ├── database.js                # MongoDB connection
│   │   │   ├── redis.js                   # Redis connection
│   │   │   ├── aws.js                     # AWS SDK configuration
│   │   │   ├── github.js                  # GitHub API configuration
│   │   │   └── env.js                     # Environment variables
│   │   │
│   │   ├── controllers/                   # HTTP request handlers
│   │   │   ├── authController.js          # Authentication logic
│   │   │   ├── deployController.js        # Deployment endpoints
│   │   │   ├── projectController.js       # Project management
│   │   │   ├── logsController.js          # Logs endpoints
│   │   │   ├── monitoringController.js    # Monitoring endpoints
│   │   │   └── webhookController.js       # GitHub webhooks
│   │   │
│   │   ├── services/                      # Business logic layer
│   │   │   ├── deploymentService.js       # Orchestrate deployments
│   │   │   ├── gitService.js              # Git operations (clone, pull)
│   │   │   ├── dockerService.js           # Docker build operations
│   │   │   ├── awsService/
│   │   │   │   ├── ecrService.js          # AWS ECR operations
│   │   │   │   ├── ecsService.js          # AWS ECS operations
│   │   │   │   ├── route53Service.js      # Route53 DNS operations
│   │   │   │   ├── albService.js          # ALB operations
│   │   │   │   ├── iamService.js          # IAM role operations
│   │   │   │   └── cloudwatchService.js   # CloudWatch logs
│   │   │   ├── frameworkDetector.js       # Detect framework type
│   │   │   ├── dockerfileGenerator.js     # Generate Dockerfile
│   │   │   ├── logStreamService.js        # Real-time log streaming
│   │   │   └── webhookService.js          # GitHub webhook processing
│   │   │
│   │   ├── repositories/                  # Database access layer
│   │   │   ├── deploymentRepository.js    # Deployment queries
│   │   │   ├── projectRepository.js       # Project queries
│   │   │   ├── userRepository.js          # User queries
│   │   │   ├── logRepository.js           # Logs queries
│   │   │   └── webhookRepository.js       # Webhook queries
│   │   │
│   │   ├── middleware/                    # Express middleware
│   │   │   ├── authMiddleware.js          # JWT validation
│   │   │   ├── errorHandler.js            # Error handling
│   │   │   ├── logger.js                  # Request logging
│   │   │   ├── rateLimiter.js             # Rate limiting
│   │   │   ├── webhookValidator.js        # GitHub webhook validation
│   │   │   └── corsHandler.js             # CORS configuration
│   │   │
│   │   ├── models/                        # MongoDB schemas
│   │   │   ├── User.js                    # User schema
│   │   │   ├── Project.js                 # Project schema
│   │   │   ├── Deployment.js              # Deployment schema
│   │   │   ├── DeploymentLog.js           # Logs schema
│   │   │   └── Webhook.js                 # Webhook events
│   │   │
│   │   ├── jobs/                          # Background job definitions
│   │   │   ├── deploymentJob.js           # Deployment job
│   │   │   ├── buildImageJob.js           # Docker build job
│   │   │   ├── ecsDeployJob.js            # ECS deployment job
│   │   │   └── logStreamJob.js            # Log streaming job
│   │   │
│   │   ├── utils/                         # Utility functions
│   │   │   ├── validators.js              # Input validation
│   │   │   ├── helpers.js                 # Helper functions
│   │   │   ├── errors.js                  # Custom error classes
│   │   │   ├── logger.js                  # Logging utility
│   │   │   └── constants.js               # Application constants
│   │   │
│   │   ├── socket/                        # Socket.IO handlers
│   │   │   ├── events.js                  # Event definitions
│   │   │   ├── handlers.js                # Event handlers
│   │   │   └── middleware.js              # Socket middleware
│   │   │
│   │   ├── routes/                        # API routes
│   │   │   ├── authRoutes.js              # Auth endpoints
│   │   │   ├── projectRoutes.js           # Project endpoints
│   │   │   ├── deployRoutes.js            # Deploy endpoints
│   │   │   ├── logsRoutes.js              # Logs endpoints
│   │   │   ├── monitoringRoutes.js        # Monitoring endpoints
│   │   │   ├── webhookRoutes.js           # Webhook endpoints
│   │   │   └── index.js                   # Route aggregator
│   │   │
│   │   ├── validators/                    # Request validation
│   │   │   ├── deployValidator.js         # Deploy request validation
│   │   │   ├── projectValidator.js        # Project validation
│   │   │   └── authValidator.js           # Auth validation
│   │   │
│   │   ├── app.js                         # Express app setup
│   │   └── index.js                       # Server entry point
│   │
│   ├── scripts/                           # Setup & utility scripts
│   │   ├── setup-aws.js                   # AWS setup wizard
│   │   ├── create-docker-image.js         # Docker build script
│   │   └── seed-database.js               # Database seeding
│   │
│   ├── tests/                             # Test files
│   │   ├── unit/                          # Unit tests
│   │   ├── integration/                   # Integration tests
│   │   └── e2e/                           # End-to-end tests
│   │
│   ├── .env.example                       # Environment variables template
│   ├── .dockerignore                      # Docker ignore file
│   ├── Dockerfile                         # Backend Docker image
│   ├── docker-compose.yml                 # Local development setup
│   ├── package.json
│   └── README.md
│
├── frontend/                              # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── Layout.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── Dashboard.tsx          # Main dashboard
│   │   │   │   ├── ProjectList.tsx        # Project listing
│   │   │   │   ├── DeploymentStatus.tsx   # Deployment status
│   │   │   │   └── StatsCards.tsx         # Statistics
│   │   │   ├── deployments/
│   │   │   │   ├── DeployModal.tsx        # Deploy form
│   │   │   │   ├── EnvironmentForm.tsx    # Environment vars
│   │   │   │   ├── ReviewDeploy.tsx       # Deploy review
│   │   │   │   └── DeploymentHistory.tsx  # History view
│   │   │   ├── monitoring/
│   │   │   │   ├── LogViewer.tsx          # Real-time logs
│   │   │   │   ├── LogStream.tsx          # Log streaming
│   │   │   │   ├── DeploymentMetrics.tsx  # Metrics display
│   │   │   │   └── HealthStatus.tsx       # Health status
│   │   │   ├── analytics/
│   │   │   │   ├── AnalyticsDashboard.tsx
│   │   │   │   ├── Charts.tsx
│   │   │   │   └── Reports.tsx
│   │   │   ├── settings/
│   │   │   │   ├── Settings.tsx
│   │   │   │   ├── AWSConfig.tsx
│   │   │   │   └── WebhookConfig.tsx
│   │   │   └── ui/
│   │   │       ├── Button.tsx
│   │   │       ├── Modal.tsx
│   │   │       ├── Card.tsx
│   │   │       ├── Spinner.tsx
│   │   │       └── Alert.tsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useDeployment.ts
│   │   │   ├── useLogs.ts
│   │   │   ├── useSocket.ts
│   │   │   ├── useAuth.ts
│   │   │   └── useProjects.ts
│   │   │
│   │   ├── services/
│   │   │   ├── api/
│   │   │   │   ├── axiosInstance.ts
│   │   │   │   ├── endpoints.ts
│   │   │   │   └── types.ts
│   │   │   ├── deploymentService.ts
│   │   │   ├── projectService.ts
│   │   │   ├── logsService.ts
│   │   │   └── socketService.ts
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.tsx
│   │   │   ├── DeploymentContext.tsx
│   │   │   └── LogsContext.tsx
│   │   │
│   │   ├── types/
│   │   │   ├── deployment.ts
│   │   │   ├── project.ts
│   │   │   ├── user.ts
│   │   │   └── common.ts
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Deployments.tsx
│   │   │   ├── Monitoring.tsx
│   │   │   ├── Analytics.tsx
│   │   │   ├── Settings.tsx
│   │   │   └── NotFound.tsx
│   │   │
│   │   ├── store/                        # State management (Redux/Zustand)
│   │   │   ├── deploymentStore.ts
│   │   │   ├── projectStore.ts
│   │   │   └── uiStore.ts
│   │   │
│   │   ├── styles/
│   │   │   ├── globals.css
│   │   │   ├── dashboard.css
│   │   │   └── monitoring.css
│   │   │
│   │   ├── app/
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   ├── router.tsx
│   │   │   └── providers.tsx
│   │   │
│   │   └── index.tsx
│   │
│   ├── public/
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── package.json
│   └── Dockerfile
│
├── infra/                                 # Infrastructure as Code
│   ├── terraform/                         # Terraform configurations
│   │   ├── main.tf                        # Main infrastructure
│   │   ├── vpc.tf                         # VPC setup
│   │   ├── ecs.tf                         # ECS cluster
│   │   ├── ecr.tf                         # ECR registry
│   │   ├── rds.tf                         # Database
│   │   ├── elasticache.tf                 # Redis
│   │   ├── route53.tf                     # DNS
│   │   ├── alb.tf                         # Load balancer
│   │   ├── iam.tf                         # IAM roles
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── terraform.tfvars.example
│   │
│   └── docker/
│       ├── backend.dockerfile
│       ├── worker.dockerfile
│       └── nginx.dockerfile
│
├── docs/                                  # Documentation
│   ├── ARCHITECTURE.md                    # Architecture guide
│   ├── API_DESIGN.md                      # API documentation
│   ├── DATABASE.md                        # Database schema
│   ├── AWS_SETUP.md                       # AWS setup guide
│   ├── DEPLOYMENT.md                      # Deployment guide
│   ├── DOCKER_WORKFLOW.md                 # Docker workflow
│   ├── DEVELOPMENT.md                     # Development setup
│   └── TROUBLESHOOTING.md                 # Troubleshooting guide
│
├── docker-compose.yml                     # Local development
├── .env.example                           # Environment template
├── .gitignore
├── README.md
└── IMPLEMENTATION_PHASES.md               # Implementation roadmap

```

---

## PHASE-BY-PHASE IMPLEMENTATION

### PHASE 1: GitHub OAuth + Repository Listing (Current MVP)

**Status**: ✅ COMPLETE
**Duration**: 1-2 weeks

**Deliverables**:
- GitHub OAuth authentication
- Fetch user repositories
- Dashboard showing repositories
- Database models for User and Project

**Key Files**:
```
backend/src/controllers/authController.js
backend/src/services/githubService.js
backend/src/models/User.js
backend/src/models/Project.js
frontend/src/pages/Dashboard.tsx
```

---

### PHASE 2: Deployment Engine + Framework Detection

**Duration**: 2-3 weeks
**Dependencies**: Phase 1 complete

#### 2.1 Framework Detection

Detect the framework type of a repository:

**Supported Frameworks**:
- Node.js (npm, yarn, pnpm)
- Python (pip, poetry)
- Go (go.mod)
- Java (pom.xml, build.gradle)
- Ruby (Gemfile)
- PHP (composer.json)
- Static (HTML/CSS/JS)

**Implementation**:

```javascript
// backend/src/services/frameworkDetector.js
const fs = require('fs').promises;
const path = require('path');

class FrameworkDetector {
  async detectFramework(repoPath) {
    const indicators = {
      nodejs: ['package.json', 'yarn.lock', 'pnpm-lock.yaml'],
      python: ['requirements.txt', 'setup.py', 'Pipfile', 'pyproject.toml'],
      java: ['pom.xml', 'build.gradle', 'gradle.properties'],
      go: ['go.mod', 'go.sum'],
      ruby: ['Gemfile', 'Gemfile.lock'],
      php: ['composer.json', 'composer.lock'],
      rust: ['Cargo.toml', 'Cargo.lock'],
      dotnet: ['*.csproj', '*.sln'],
    };

    const detected = {
      framework: 'static', // default
      version: 'latest',
      buildCommand: 'echo "No build needed"',
      startCommand: 'echo "Static site"',
      port: 80,
    };

    // Check for each framework
    for (const [framework, files] of Object.entries(indicators)) {
      for (const file of files) {
        try {
          const filePath = path.join(repoPath, file);
          await fs.stat(filePath);
          detected.framework = framework;
          detected.buildCommand = this.getBuildCommand(framework);
          detected.startCommand = this.getStartCommand(framework);
          detected.port = this.getPort(framework);
          return detected;
        } catch (err) {
          // File doesn't exist, continue
        }
      }
    }

    return detected;
  }

  getBuildCommand(framework) {
    const commands = {
      nodejs: 'npm run build',
      python: 'pip install -r requirements.txt',
      java: 'mvn clean package',
      go: 'go build -o app .',
      ruby: 'bundle install',
      php: 'composer install',
      rust: 'cargo build --release',
      dotnet: 'dotnet publish -c Release',
      static: 'echo "No build needed"',
    };
    return commands[framework] || commands.static;
  }

  getStartCommand(framework) {
    const commands = {
      nodejs: 'npm start',
      python: 'python app.py',
      java: 'java -jar target/*.jar',
      go: './app',
      ruby: 'bundle exec rails s',
      php: 'php -S 0.0.0.0:8000',
      rust: './target/release/app',
      dotnet: 'dotnet run',
      static: 'http-server',
    };
    return commands[framework] || commands.static;
  }

  getPort(framework) {
    const ports = {
      nodejs: 3000,
      python: 5000,
      java: 8080,
      go: 8080,
      ruby: 3000,
      php: 8000,
      rust: 8080,
      dotnet: 5000,
      static: 80,
    };
    return ports[framework] || 80;
  }
}

module.exports = new FrameworkDetector();
```

#### 2.2 Dockerfile Generation

Generate Dockerfile dynamically based on detected framework:

```javascript
// backend/src/services/dockerfileGenerator.js
class DockerfileGenerator {
  generateDockerfile(framework, config) {
    const templates = {
      nodejs: this.generateNodeDockerfile(config),
      python: this.generatePythonDockerfile(config),
      go: this.generateGoDockerfile(config),
      java: this.generateJavaDockerfile(config),
      ruby: this.generateRubyDockerfile(config),
      php: this.generatePhpDockerfile(config),
      static: this.generateStaticDockerfile(config),
    };

    return templates[framework] || templates.static;
  }

  generateNodeDockerfile(config) {
    return `
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock* ./
COPY pnpm-lock.yaml* ./

# Install dependencies
RUN npm ci --only=production || npm install --only=production

# Copy application
COPY . .

# Build if needed
RUN npm run build || true

# Expose port
EXPOSE ${config.port}

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \\
  CMD node -e "require('http').get('http://localhost:${config.port}', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["npm", "start"]
    `;
  }

  generatePythonDockerfile(config) {
    return `
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose port
EXPOSE ${config.port}

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \\
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:${config.port}')"

# Start application
CMD ["python", "app.py"]
    `;
  }

  generateStaticDockerfile(config) {
    return `
FROM nginx:alpine

# Copy static files
COPY . /usr/share/nginx/html/

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \\
  CMD wget --quiet --tries=1 --spider http://localhost/

CMD ["nginx", "-g", "daemon off;"]
    `;
  }

  generateGoDockerfile(config) {
    return `
FROM golang:1.21-alpine AS builder

WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o app .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/app .

EXPOSE ${config.port}

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \\
  CMD wget --quiet --tries=1 --spider http://localhost:${config.port}/

CMD ["./app"]
    `;
  }

  generateJavaDockerfile(config) {
    return `
FROM maven:3.8.1-openjdk-17 AS builder

WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

FROM openjdk:17-alpine
COPY --from=builder /app/target/*.jar app.jar

EXPOSE ${config.port}

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \\
  CMD wget --quiet --tries=1 --spider http://localhost:${config.port}/

ENTRYPOINT ["java", "-jar", "app.jar"]
    `;
  }

  generateRubyDockerfile(config) {
    return `
FROM ruby:3.2

WORKDIR /app

RUN apt-get update && apt-get install -y build-essential

COPY Gemfile Gemfile.lock ./
RUN bundle install

COPY . .

RUN bundle exec rake assets:precompile || true

EXPOSE ${config.port}

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \\
  CMD curl -f http://localhost:${config.port}/ || exit 1

CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0"]
    `;
  }

  generatePhpDockerfile(config) {
    return `
FROM php:8.2-apache

WORKDIR /var/www/html

RUN docker-php-ext-install pdo pdo_mysql

COPY . .

RUN a2enmod rewrite

COPY apache.conf /etc/apache2/sites-available/000-default.conf

EXPOSE ${config.port}

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \\
  CMD curl -f http://localhost:${config.port}/ || exit 1

CMD ["apache2-foreground"]
    `;
  }
}

module.exports = new DockerfileGenerator();
```

#### 2.3 Clone and Build Service

```javascript
// backend/src/services/gitService.js
const simpleGit = require('simple-git');
const fs = require('fs').promises;
const path = require('path');

class GitService {
  async cloneRepository(repoUrl, targetPath) {
    try {
      const git = simpleGit();
      
      await git.clone(repoUrl, targetPath, {
        '--depth': 1, // Shallow clone for faster download
      });
      
      return {
        success: true,
        path: targetPath,
        message: 'Repository cloned successfully',
      };
    } catch (error) {
      throw new Error(`Failed to clone repository: ${error.message}`);
    }
  }

  async getRepositoryInfo(repoPath) {
    try {
      const git = simpleGit(repoPath);
      const commits = await git.log(['-1']);
      const branch = await git.revparse(['--abbrev-ref', 'HEAD']);
      
      return {
        latestCommit: commits.latest.hash,
        commitMessage: commits.latest.message,
        branch: branch.trim(),
        author: commits.latest.author_name,
        date: commits.latest.date,
      };
    } catch (error) {
      throw new Error(`Failed to get repository info: ${error.message}`);
    }
  }

  async cleanupRepository(repoPath) {
    try {
      await fs.rm(repoPath, { recursive: true, force: true });
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to cleanup repository: ${error.message}`);
    }
  }
}

module.exports = new GitService();
```

---

### PHASE 3: AWS Integration (ECR, ECS Fargate, IAM)

**Duration**: 3-4 weeks
**Dependencies**: Phase 1 & 2 complete

#### 3.1 AWS ECR Service

```javascript
// backend/src/services/awsService/ecrService.js
const AWS = require('aws-sdk');

class ECRService {
  constructor() {
    this.ecr = new AWS.ECR({
      region: process.env.AWS_REGION || 'us-east-1',
    });
  }

  async createRepository(repositoryName) {
    try {
      const params = {
        repositoryName,
        imageScanningConfiguration: {
          scanOnPush: true,
        },
        encryptionConfiguration: {
          encryptionType: 'AES256',
        },
      };

      const result = await this.ecr.createRepository(params).promise();
      return {
        success: true,
        uri: result.repository.repositoryUri,
        arn: result.repository.repositoryArn,
      };
    } catch (error) {
      if (error.code === 'RepositoryAlreadyExistsException') {
        return {
          success: true,
          existing: true,
          uri: `${process.env.AWS_ACCOUNT_ID}.dkr.ecr.${process.env.AWS_REGION}.amazonaws.com/${repositoryName}`,
        };
      }
      throw error;
    }
  }

  async pushImage(imageName, imageTag, imageUri) {
    // Docker push handled by backend service
    // This just tracks the push in our system
    return {
      success: true,
      uri: `${imageUri}:${imageTag}`,
      pushed: new Date(),
    };
  }

  async getImageDetails(repositoryName, imageTag) {
    try {
      const params = {
        repositoryName,
        imageIds: [{ imageTag }],
      };

      const result = await this.ecr.describeImages(params).promise();
      return result.imageDetails[0];
    } catch (error) {
      throw error;
    }
  }

  async deleteImage(repositoryName, imageTag) {
    try {
      const params = {
        repositoryName,
        imageIds: [{ imageTag }],
      };

      await this.ecr.batchDeleteImage(params).promise();
      return { success: true };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ECRService();
```

#### 3.2 AWS ECS Service

```javascript
// backend/src/services/awsService/ecsService.js
const AWS = require('aws-sdk');

class ECSService {
  constructor() {
    this.ecs = new AWS.ECS({
      region: process.env.AWS_REGION || 'us-east-1',
    });
  }

  async createTaskDefinition(projectName, imageUri, environment = []) {
    try {
      const params = {
        family: `${projectName}-task`,
        networkMode: 'awsvpc',
        requiresCompatibilities: ['FARGATE'],
        cpu: '256',
        memory: '512',
        containerDefinitions: [
          {
            name: projectName,
            image: imageUri,
            essential: true,
            portMappings: [
              {
                containerPort: 80,
                protocol: 'tcp',
              },
            ],
            environment,
            logConfiguration: {
              logDriver: 'awslogs',
              options: {
                'awslogs-group': `/ecs/${projectName}`,
                'awslogs-region': process.env.AWS_REGION,
                'awslogs-stream-prefix': 'ecs',
              },
            },
          },
        ],
      };

      const result = await this.ecs.registerTaskDefinition(params).promise();
      return {
        success: true,
        taskDefinitionArn: result.taskDefinition.taskDefinitionArn,
        revision: result.taskDefinition.revision,
      };
    } catch (error) {
      throw error;
    }
  }

  async createService(clusterName, serviceName, taskDefinition, desiredCount = 1) {
    try {
      const params = {
        cluster: clusterName,
        serviceName,
        taskDefinition,
        desiredCount,
        launchType: 'FARGATE',
        networkConfiguration: {
          awsvpcConfiguration: {
            subnets: process.env.SUBNET_IDS.split(','),
            securityGroups: process.env.SECURITY_GROUP_IDS.split(','),
            assignPublicIp: 'ENABLED',
          },
        },
        deploymentConfiguration: {
          maximumPercent: 200,
          minimumHealthyPercent: 100,
          deploymentCircuitBreaker: {
            enable: true,
            rollback: true,
          },
        },
      };

      const result = await this.ecs.createService(params).promise();
      return {
        success: true,
        serviceArn: result.service.serviceArn,
        serviceName: result.service.serviceName,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateService(clusterName, serviceName, newTaskDefinition) {
    try {
      const params = {
        cluster: clusterName,
        service: serviceName,
        taskDefinition: newTaskDefinition,
        forceNewDeployment: true,
      };

      const result = await this.ecs.updateService(params).promise();
      return {
        success: true,
        serviceArn: result.service.serviceArn,
        status: result.service.status,
      };
    } catch (error) {
      throw error;
    }
  }

  async getServiceStatus(clusterName, serviceName) {
    try {
      const params = {
        cluster: clusterName,
        services: [serviceName],
      };

      const result = await this.ecs.describeServices(params).promise();
      const service = result.services[0];

      return {
        status: service.status,
        desiredCount: service.desiredCount,
        runningCount: service.runningCount,
        deployments: service.deployments,
        events: service.events.slice(0, 10),
      };
    } catch (error) {
      throw error;
    }
  }

  async listTasks(clusterName, serviceName) {
    try {
      const listParams = {
        cluster: clusterName,
        serviceName,
      };

      const listResult = await this.ecs.listTasks(listParams).promise();

      if (listResult.taskArns.length === 0) {
        return [];
      }

      const describeParams = {
        cluster: clusterName,
        tasks: listResult.taskArns,
      };

      const describeResult = await this.ecs.describeTasks(describeParams).promise();
      return describeResult.tasks;
    } catch (error) {
      throw error;
    }
  }

  async stopService(clusterName, serviceName) {
    try {
      await this.updateService(clusterName, serviceName, null);
      
      const params = {
        cluster: clusterName,
        service: serviceName,
        desiredCount: 0,
      };

      await this.ecs.updateService(params).promise();
      return { success: true };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ECSService();
```

#### 3.3 IAM Service

```javascript
// backend/src/services/awsService/iamService.js
const AWS = require('aws-sdk');

class IAMService {
  constructor() {
    this.iam = new AWS.IAM();
  }

  async createECSTaskRole(projectName) {
    try {
      // Create task execution role
      const executionRoleParams = {
        RoleName: `${projectName}-ecs-task-execution-role`,
        AssumeRolePolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: {
                Service: 'ecs-tasks.amazonaws.com',
              },
              Action: 'sts:AssumeRole',
            },
          ],
        }),
      };

      const executionRole = await this.iam.createRole(executionRoleParams).promise();

      // Attach policy for CloudWatch Logs
      await this.iam.attachRolePolicy({
        RoleName: executionRole.Role.RoleName,
        PolicyArn: 'arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy',
      }).promise();

      // Create task role
      const taskRoleParams = {
        RoleName: `${projectName}-ecs-task-role`,
        AssumeRolePolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: {
                Service: 'ecs-tasks.amazonaws.com',
              },
              Action: 'sts:AssumeRole',
            },
          ],
        }),
      };

      const taskRole = await this.iam.createRole(taskRoleParams).promise();

      return {
        executionRoleArn: executionRole.Role.Arn,
        taskRoleArn: taskRole.Role.Arn,
      };
    } catch (error) {
      throw error;
    }
  }

  async addS3AccessToRole(roleName, bucketName) {
    try {
      const policyDocument = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: ['s3:GetObject', 's3:PutObject', 's3:ListBucket'],
            Resource: [
              `arn:aws:s3:::${bucketName}`,
              `arn:aws:s3:::${bucketName}/*`,
            ],
          },
        ],
      };

      await this.iam.putRolePolicy({
        RoleName: roleName,
        PolicyName: `${bucketName}-policy`,
        PolicyDocument: JSON.stringify(policyDocument),
      }).promise();

      return { success: true };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new IAMService();
```

---

## DATABASE SCHEMA

### MongoDB Collections

**users**
```javascript
{
  _id: ObjectId,
  githubId: String,
  username: String,
  email: String,
  avatar: String,
  accessToken: String, // encrypted
  refreshToken: String, // encrypted
  awsAccessKeyId: String, // encrypted
  awsSecretAccessKey: String, // encrypted
  ecsClusterName: String,
  createdAt: Date,
  updatedAt: Date,
}
```

**projects**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  repositoryUrl: String,
  repositoryName: String,
  repositoryOwner: String,
  framework: String,
  description: String,
  isPrivate: Boolean,
  status: 'connected' | 'deploying' | 'active' | 'failed',
  liveUrl: String,
  domainName: String,
  environmentVariables: [{
    key: String,
    value: String,
    encrypted: Boolean,
  }],
  webhookId: String,
  lastDeployedAt: Date,
  createdAt: Date,
  updatedAt: Date,
}
```

**deployments**
```javascript
{
  _id: ObjectId,
  projectId: ObjectId,
  userId: ObjectId,
  status: 'pending' | 'building' | 'pushing' | 'deploying' | 'success' | 'failed',
  commitHash: String,
  commitMessage: String,
  commitAuthor: String,
  buildTime: Number,
  deployTime: Number,
  ecsTaskDefinitionArn: String,
  ecsServiceArn: String,
  imageUri: String,
  imageTag: String,
  logs: [{
    timestamp: Date,
    message: String,
    level: 'info' | 'error' | 'warning',
  }],
  error: String,
  triggeredBy: 'manual' | 'webhook',
  startedAt: Date,
  completedAt: Date,
}
```

**deployment_logs**
```javascript
{
  _id: ObjectId,
  deploymentId: ObjectId,
  projectId: ObjectId,
  timestamp: Date,
  source: 'docker' | 'ecs' | 'system',
  level: 'debug' | 'info' | 'warning' | 'error',
  message: String,
  metadata: Object,
}
```

---

## AWS ARCHITECTURE

### AWS Infrastructure Diagram

```
┌─────────────────────────────────────────────────────────┐
│              AWS ACCOUNT                                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │           AWS VPC                                │  │
│  │                                                  │  │
│  │  ┌──────────────────────────────────────────┐   │  │
│  │  │  Public Subnets (2)                      │   │  │
│  │  │                                          │   │  │
│  │  │  ┌─────────────────────────────────────┐│   │  │
│  │  │  │ Application Load Balancer (ALB)     ││   │  │
│  │  │  │ - Listens on 80/443                 ││   │  │
│  │  │  │ - Routes to Fargate tasks           ││   │  │
│  │  │  │ - Health checks enabled             ││   │  │
│  │  │  └─────────────────────────────────────┘│   │  │
│  │  └──────────────────────────────────────────┘   │  │
│  │                       ↓                          │  │
│  │  ┌──────────────────────────────────────────┐   │  │
│  │  │  Private Subnets (2)                     │   │  │
│  │  │                                          │   │  │
│  │  │  ┌─────────────────────────────────────┐│   │  │
│  │  │  │  ECS Fargate Cluster                ││   │  │
│  │  │  │                                     ││   │  │
│  │  │  │  ┌──────────────────────────────┐   ││   │  │
│  │  │  │  │ Task 1: Container Instance  │   ││   │  │
│  │  │  │  │ - Image from ECR            │   ││   │  │
│  │  │  │  │ - Port: 80                  │   ││   │  │
│  │  │  │  │ - CloudWatch Logs           │   ││   │  │
│  │  │  │  └──────────────────────────────┘   ││   │  │
│  │  │  │                                     ││   │  │
│  │  │  │  ┌──────────────────────────────┐   ││   │  │
│  │  │  │  │ Task 2: Container Instance  │   ││   │  │
│  │  │  │  │ - Image from ECR            │   ││   │  │
│  │  │  │  │ - Port: 80                  │   ││   │  │
│  │  │  │  │ - CloudWatch Logs           │   ││   │  │
│  │  │  │  └──────────────────────────────┘   ││   │  │
│  │  │  │                                     ││   │  │
│  │  │  │  Auto Scaling Group:                ││   │  │
│  │  │  │  - Min: 1 Task                      ││   │  │
│  │  │  │  - Max: 10 Tasks                    ││   │  │
│  │  │  │  - Target Tracking: CPU 70%         ││   │  │
│  │  │  └─────────────────────────────────────┘│   │  │
│  │  └──────────────────────────────────────────┘   │  │
│  │                       ↓                          │  │
│  │  ┌──────────────────────────────────────────┐   │  │
│  │  │  NAT Gateway (for outbound traffic)      │   │  │
│  │  └──────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  ECR (Elastic Container Registry)               │  │
│  │  - One repository per project                   │  │
│  │  - Image scanning enabled                       │  │
│  │  - Encryption enabled                           │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Route53 (DNS Management)                        │  │
│  │  - Wildcard DNS: *.cloudops.dev                  │  │
│  │  - Alias records to ALB                          │  │
│  │  - Health checks enabled                         │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  CloudWatch (Monitoring & Logging)               │  │
│  │  - Log Groups: /ecs/{projectName}                │  │
│  │  - Metrics: CPU, Memory, Network                 │  │
│  │  - Alarms: Deployment failures                   │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  IAM (Identity & Access Management)              │  │
│  │  - Task Execution Role                           │  │
│  │  - Task Role                                     │  │
│  │  - Service-linked role for ECS                   │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
└─────────────────────────────────────────────────────────┘
       │                          │
       ↓                          ↓
┌──────────────┐        ┌──────────────────┐
│   GitHub     │        │  Internet Users  │
│   Webhooks   │        │  (HTTPS)         │
└──────────────┘        └──────────────────┘
```

---

## DOCKER WORKFLOW

### Build Process Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   DOCKER BUILD WORKFLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PHASE 1: PREPARATION                                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 1. Create temporary build directory: /tmp/cloudops-{uid}   │ │
│  │ 2. Clone repository from GitHub                            │ │
│  │ 3. Detect framework (Node.js, Python, Go, etc.)            │ │
│  │ 4. Generate Dockerfile based on framework                  │ │
│  │ 5. Create .dockerignore to optimize image size            │ │
│  │ 6. Inject environment variables as build args              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                            ↓                                     │
│  PHASE 2: BUILD                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 1. docker build -t {imageName}:{tag} .                     │ │
│  │    - Multi-stage builds for smaller images                 │ │
│  │    - Layer caching for faster builds                       │ │
│  │    - Build args for environment variables                  │ │
│  │                                                             │ │
│  │ 2. Build stages:                                            │ │
│  │    - Dependencies: Install OS packages & app deps          │ │
│  │    - Build: Compile/transpile code                         │ │
│  │    - Runtime: Minimal base image with only essentials      │ │
│  │    - Health checks: Add /health endpoint                   │ │
│  │                                                             │ │
│  │ 3. Security scanning:                                       │ │
│  │    - Scan for vulnerabilities                              │ │
│  │    - Run as non-root user                                  │ │
│  │    - Use read-only filesystem where possible               │ │
│  │                                                             │ │
│  │ 4. Image optimization:                                      │ │
│  │    - ~200-500 MB typical image size                         │ │
│  │    - Alpine base (5 MB vs 300 MB)                           │ │
│  │    - Remove unnecessary files                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                            ↓                                     │
│  PHASE 3: TAGGING                                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ docker tag {imageId} {ecrUri}:{imageTag}                   │ │
│  │                                                             │ │
│  │ Tag format:                                                 │ │
│  │ - {account}.dkr.ecr.{region}.amazonaws.com/{repo}:commit-  │ │
│  │   {sha}-{timestamp}                                         │ │
│  │ - Example: 123456789.dkr.ecr.us-east-1.amazonaws.com/      │ │
│  │   myapp:commit-abc123-20240513                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                            ↓                                     │
│  PHASE 4: PUSH TO ECR                                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 1. Authenticate Docker with ECR                             │ │
│  │    aws ecr get-login-password | docker login ...            │ │
│  │                                                             │ │
│  │ 2. Push image to ECR                                        │ │
│  │    docker push {ecrUri}:{tag}                               │ │
│  │                                                             │ │
│  │ 3. Verify image in ECR                                      │ │
│  │    aws ecr describe-images --repo-name {repo}               │ │
│  │                                                             │ │
│  │ 4. Enable image scanning                                    │ │
│  │    - Scan on push enabled in ECR repository                │ │
│  │    - Receive findings report                               │ │
│  └────────────────────────────────────────────────────────────┘ │
│                            ↓                                     │
│  PHASE 5: CLEANUP                                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 1. Remove build directory                                  │ │
│  │ 2. Remove dangling images                                  │ │
│  │ 3. Save build artifacts (logs, manifest)                   │ │
│  │ 4. Record build status in MongoDB                          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

TOTAL TIME: 3-10 minutes (depending on framework & dependencies)
IMAGE SIZE: 150-800 MB (after optimization)
```

### Docker Service Implementation

```javascript
// backend/src/services/dockerService.js
const { exec } = require('child_process');
const path = require('path');
const util = require('util');
const fs = require('fs').promises;

const execAsync = util.promisify(exec);

class DockerService {
  async buildImage(projectName, repoPath, dockerfile, envVars = {}) {
    try {
      // Create build arguments from env vars
      const buildArgs = Object.entries(envVars)
        .map(([key, value]) => `--build-arg ${key}=${value}`)
        .join(' ');

      // Build command
      const imageTag = `${projectName}:${Date.now()}`;
      const buildCommand = `
        docker build \\
          -t ${imageTag} \\
          ${buildArgs} \\
          -f ${dockerfile} \\
          ${repoPath}
      `.trim();

      console.log(`Building image: ${imageTag}`);
      const { stdout, stderr } = await execAsync(buildCommand, {
        maxBuffer: 10 * 1024 * 1024, // 10 MB buffer
      });

      console.log('Build output:', stdout);

      // Get image ID
      const getImageIdCommand = `docker images --quiet ${imageTag}`;
      const { stdout: imageId } = await execAsync(getImageIdCommand);

      return {
        success: true,
        imageId: imageId.trim(),
        imageTag,
        size: await this.getImageSize(imageTag),
        buildTime: new Date(),
      };
    } catch (error) {
      throw new Error(`Docker build failed: ${error.message}`);
    }
  }

  async tagImage(imageId, ecrUri, tag) {
    try {
      const fullTag = `${ecrUri}:${tag}`;
      const command = `docker tag ${imageId} ${fullTag}`;
      
      await execAsync(command);
      
      return {
        success: true,
        fullTag,
      };
    } catch (error) {
      throw new Error(`Failed to tag image: ${error.message}`);
    }
  }

  async pushImage(ecrUri, tag) {
    try {
      const fullTag = `${ecrUri}:${tag}`;
      
      // Authenticate with ECR
      const loginCommand = `
        aws ecr get-login-password --region ${process.env.AWS_REGION} | 
        docker login --username AWS --password-stdin ${ecrUri.split('/')[0]}
      `.trim();
      
      await execAsync(loginCommand);
      
      // Push image
      const pushCommand = `docker push ${fullTag}`;
      console.log(`Pushing image: ${fullTag}`);
      
      const { stdout } = await execAsync(pushCommand, {
        maxBuffer: 10 * 1024 * 1024,
      });
      
      console.log('Push output:', stdout);
      
      return {
        success: true,
        uri: fullTag,
        pushedAt: new Date(),
      };
    } catch (error) {
      throw new Error(`Failed to push image: ${error.message}`);
    }
  }

  async getImageSize(imageTag) {
    try {
      const command = `docker inspect ${imageTag} | grep -i size`;
      const { stdout } = await execAsync(command);
      
      const match = stdout.match(/"Size": (\d+)/);
      return match ? parseInt(match[1]) : 0;
    } catch (error) {
      return 0;
    }
  }

  async removeImage(imageId) {
    try {
      await execAsync(`docker rmi ${imageId} -f`);
      return { success: true };
    } catch (error) {
      console.error('Failed to remove image:', error);
      return { success: false };
    }
  }
}

module.exports = new DockerService();
```

---

## ECS DEPLOYMENT WORKFLOW

### Deployment Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│              ECS DEPLOYMENT LIFECYCLE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PHASE 1: PREPARATION                                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 1. Get project details from database                       │ │
│  │ 2. Validate AWS credentials & IAM permissions              │ │
│  │ 3. Check ECS cluster status                                │ │
│  │ 4. Create CloudWatch log group (if not exists)             │ │
│  │ 5. Create or update IAM roles                              │ │
│  │ 6. Create ECR repository (if not exists)                   │ │
│  │ 7. Build & push Docker image                               │ │
│  └────────────────────────────────────────────────────────────┘ │
│                            ↓                                     │
│  PHASE 2: TASK DEFINITION                                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 1. Create/update ECS task definition                       │ │
│  │    Parameters:                                              │ │
│  │    - Container name                                        │ │
│  │    - Image URI (from ECR)                                  │ │
│  │    - Port mappings (container→host)                        │ │
│  │    - Environment variables                                 │ │
│  │    - CPU: 256 vCPU                                         │ │
│  │    - Memory: 512 MB                                        │ │
│  │    - Log configuration: CloudWatch                         │ │
│  │    - Task role & execution role                            │ │
│  │                                                             │ │
│  │ 2. Register task definition revision                       │ │
│  │    - Each new revision is version N+1                      │ │
│  │    - Can rollback to previous revision                     │ │
│  │    - Stores complete container config                      │ │
│  └────────────────────────────────────────────────────────────┘ │
│                            ↓                                     │
│  PHASE 3: SERVICE CREATION/UPDATE                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 1. Check if service exists                                 │ │
│  │                                                             │ │
│  │    IF NOT EXISTS:                                           │ │
│  │    a. Create ECS service                                   │ │
│  │       - Service name: {projectName}                        │ │
│  │       - Cluster: user's ECS cluster                        │ │
│  │       - Launch type: FARGATE                               │ │
│  │       - Desired count: 1 task                              │ │
│  │       - Network: Public subnets with security group        │ │
│  │       - Assign public IP: ENABLED                          │ │
│  │       - Load balancer: ALB (optional, initially)           │ │
│  │                                                             │ │
│  │    IF EXISTS:                                               │ │
│  │    a. Update service with new task definition              │ │
│  │    b. Set forceNewDeployment = true                        │ │
│  │    c. Enable deployment circuit breaker:                   │ │
│  │       - Auto-rollback on failure                           │ │
│  │       - Max failed tasks allowed                           │ │
│  │                                                             │ │
│  │ 2. Configure auto-scaling (optional)                       │ │
│  │    - Min tasks: 1                                          │ │
│  │    - Max tasks: 3-10 (based on tier)                       │ │
│  │    - CPU target: 70%                                       │ │
│  │    - Memory target: 80%                                    │ │
│  └────────────────────────────────────────────────────────────┘ │
│                            ↓                                     │
│  PHASE 4: TASK LAUNCH                                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 1. ECS scheduler places task on Fargate                    │ │
│  │    - Allocates vCPU & memory                               │ │
│  │    - Pulls image from ECR                                  │ │
│  │    - Creates container from image                          │ │
│  │    - Assigns ENI (network interface)                       │ │
│  │    - Assigns public IP (if configured)                     │ │
│  │                                                             │ │
│  │ 2. Container starts                                        │ │
│  │    - Runs CMD from Dockerfile                              │ │
│  │    - Logs sent to CloudWatch                               │ │
│  │    - Health check starts (if configured)                   │ │
│  │                                                             │ │
│  │ 3. Task reaches RUNNING state                              │ │
│  │    - Container is now serving traffic                      │ │
│  │    - All dependencies should be ready                      │ │
│  │                                                             │ │
│  │ 4. Track task status:                                       │ │
│  │    - PROVISIONING → Container registering ENI              │ │
│  │    - PENDING → Waiting for resources                       │ │
│  │    - ACTIVATING → Starting application                     │ │
│  │    - RUNNING → Ready to serve traffic                      │ │
│  │    - DEACTIVATING → Graceful shutdown                      │ │
│  │    - STOPPING → Stopping container                         │ │
│  │    - DEPROVISIONING → Releasing ENI                        │ │
│  │    - STOPPED → Container stopped                           │ │
│  └────────────────────────────────────────────────────────────┘ │
│                            ↓                                     │
│  PHASE 5: HEALTH CHECKS & MONITORING                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 1. ELB Health Check (if ALB is configured)                 │ │
│  │    - Sends HTTP GET to /health (or /)                      │ │
│  │    - Interval: 30 seconds                                  │ │
│  │    - Timeout: 5 seconds                                    │ │
│  │    - Healthy threshold: 2 consecutive passes               │ │
│  │    - Unhealthy threshold: 3 consecutive failures           │ │
│  │                                                             │ │
│  │ 2. CloudWatch Monitoring                                   │ │
│  │    - CPU utilization %                                     │ │
│  │    - Memory utilization %                                  │ │
│  │    - Network in/out bytes                                  │ │
│  │    - Task count (desired vs running)                       │ │
│  │                                                             │ │
│  │ 3. Log aggregation                                         │ │
│  │    - Application logs → CloudWatch Logs                    │ │
│  │    - Real-time streaming to frontend                       │ │
│  │    - Log retention: 7 days default                         │ │
│  └────────────────────────────────────────────────────────────┘ │
│                            ↓                                     │
│  PHASE 6: DNS & ROUTING                                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 1. Get task public IP                                      │ │
│  │    - Each task has ENI with public IP                      │ │
│  │    - IP persists until task stops                          │ │
│  │                                                             │ │
│  │ 2. Create Route53 record (subdomain)                       │ │
│  │    - Record type: A (IPv4) or AAAA (IPv6)                 │ │
│  │    - TTL: 300 seconds (5 minutes)                          │ │
│  │    - Target: ALB DNS name or task public IP                │ │
│  │    - Subdomain format: {projectName}-{random}.cloudops.dev │ │
│  │                                                             │ │
│  │ 3. Configure ALB (if using)                                │ │
│  │    - Target group created for service                      │ │
│  │    - Rules forward traffic to target group                 │ │
│  │    - HTTPS/TLS termination at ALB                          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                            ↓                                     │
│  PHASE 7: COMPLETION & NOTIFICATION                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 1. Update deployment record in MongoDB                     │ │
│  │    - Status: success                                       │ │
│  │    - Live URL: {subdomain}.cloudops.dev                    │ │
│  │    - ECS task ARN                                          │ │
│  │    - Completion timestamp                                  │ │
│  │                                                             │ │
│  │ 2. Update project status                                   │ │
│  │    - Status: active                                        │ │
│  │    - Live URL stored                                       │ │
│  │    - Last deployment time                                  │ │
│  │                                                             │ │
│  │ 3. Notify user                                             │ │
│  │    - WebSocket event: deployment_success                   │ │
│  │    - Email notification                                    │ │
│  │    - Display live URL in dashboard                         │ │
│  │                                                             │ │
│  │ 4. Record metrics                                          │ │
│  │    - Build time: X minutes                                 │ │
│  │    - Deploy time: Y minutes                                │ │
│  │    - Total time: X + Y minutes                             │ │
│  │    - Success rate: track for analytics                     │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

TYPICAL TIMING:
- Docker build: 2-5 minutes
- Image push to ECR: 1-2 minutes
- Task launch: 1-3 minutes
- Health check pass: 0.5-2 minutes
- TOTAL: 4-12 minutes from click to live
```

---

## REAL-TIME LOGS ARCHITECTURE

### Socket.IO Log Streaming

```
┌─────────────────────────────────────────────────────────────────┐
│           REAL-TIME LOG STREAMING WITH SOCKET.IO                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  WEBSOCKET CONNECTION FLOW                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                                                             │ │
│  │  Frontend (Client)              Backend (Server)            │ │
│  │       │                                │                    │ │
│  │       │  1. Connect to WebSocket       │                    │ │
│  │       │──────────────────────────────→│                    │ │
│  │       │                                │                    │ │
│  │       │  2. Auth with JWT token        │                    │ │
│  │       │  { token: "jwt_token" }        │                    │ │
│  │       │──────────────────────────────→│                    │ │
│  │       │                                │ Verify token      │ │
│  │       │                                │ Join room         │ │
│  │       │ 3. Connection established      │                    │ │
│  │       │←──────────────────────────────│ 'connected'        │ │
│  │       │                                │ event             │ │
│  │       │                                │                    │ │
│  │       │ 4. Subscribe to deployment     │                    │ │
│  │       │  { action: 'watch_deployment', │                    │ │
│  │       │    deploymentId: '...' }       │                    │ │
│  │       │──────────────────────────────→│ Join deployment   │ │
│  │       │                                │ room              │ │
│  │       │                                │                    │ │
│  │       │ 5. Receive deployment logs     │                    │ │
│  │       │ (real-time stream)             │ Listen to ECR     │ │
│  │       │ { level: 'info',               │ & ECS logs        │ │
│  │       │   message: '...',              │                    │ │
│  │       │   timestamp: '...' }           │                    │ │
│  │       │←──────────────────────────────│ 'deployment_log'   │ │
│  │       │                                │ event (every 1-2s) │ │
│  │       │                                │                    │ │
│  │       │ [Log stream continues...]      │                    │ │
│  │       │←──────────────────────────────│ More log events    │ │
│  │       │                                │                    │ │
│  │       │ 6. Deployment complete        │                    │ │
│  │       │ { status: 'success',           │                    │ │
│  │       │   liveUrl: '...' }             │                    │ │
│  │       │←──────────────────────────────│ 'deployment_complete'
│  │       │                                │                    │ │
│  │       │ 7. Disconnect                  │                    │ │
│  │       │──────────────────────────────→│ Leave room         │ │
│  │       │                                │                    │ │
│  │                                                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  LOG COLLECTION FLOW                                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                                                             │ │
│  │  ECR/Docker                 Backend                        │ │
│  │      │                          │                          │ │
│  │      │ 1. Build container       │                          │ │
│  │      │    Logs: ────────────────→│                         │ │
│  │      │ "Step 1/10: FROM node"    │ Collect logs            │ │
│  │      │ "Step 2/10: RUN npm i"    │                         │ │
│  │      │ "Successfully built..."   │ Store in buffer         │ │
│  │      │                           │                          │ │
│  │      └─ Image pushed to ECR      │                         │
│  │                                  │                          │ │
│  │  ECS                             │                          │ │
│  │      │                           │                          │ │
│  │      │ 2. Task launched          │                          │ │
│  │      │    Logs: ───────────────→│                         │ │
│  │      │ "Task starting..."        │ Pull from CloudWatch    │ │
│  │      │ "Container port 80 ready" │ Logs                    │
│  │      │ "Application listening"   │                          │ │
│  │      │ "Health check passed"     │ Emit via Socket.IO      │ │
│  │      │                           │ to Frontend             │ │
│  │      │ 3. Application running    │                          │ │
│  │      │    Logs: ───────────────→│ App logs flow through    │ │
│  │      │ "GET /api/users"          │ CloudWatch continuously │ │
│  │      │ "DB connected"            │                          │ │
│  │      │ "Cache initialized"       │                          │ │
│  │      │                           │                          │ │
│  │                                                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  LOG FILTERING & PROCESSING                                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                                                             │ │
│  │  Raw Log Stream                                            │ │
│  │  ↓                                                          │ │
│  │  ┌─────────────────────────────────────────────────────┐  │ │
│  │  │ Filter by:                                          │  │ │
│  │  │ - Deployment ID                                    │  │ │
│  │  │ - Time range                                       │  │ │
│  │  │ - Log level (error, warn, info)                   │  │ │
│  │  │ - Source (docker, ecs, app)                       │  │ │
│  │  └─────────────────────────────────────────────────────┘  │ │
│  │  ↓                                                          │ │
│  │  ┌─────────────────────────────────────────────────────┐  │ │
│  │  │ Enhance with metadata:                              │  │ │
│  │  │ - Timestamp                                         │  │ │
│  │  │ - Severity icon                                    │  │ │
│  │  │ - Color coding                                     │  │ │
│  │  │ - Source badge                                    │  │ │
│  │  └─────────────────────────────────────────────────────┘  │ │
│  │  ↓                                                          │ │
│  │  ┌─────────────────────────────────────────────────────┐  │ │
│  │  │ Store in database                                   │  │ │
│  │  │ (deployment_logs collection)                        │  │ │
│  │  └─────────────────────────────────────────────────────┘  │ │
│  │  ↓                                                          │ │
│  │  ┌─────────────────────────────────────────────────────┐  │ │
│  │  │ Emit to subscribed clients                          │  │ │
│  │  │ via Socket.IO                                       │  │ │
│  │  │                                                     │  │ │
│  │  │ {                                                   │  │ │
│  │  │   "deploymentId": "...",                            │  │ │
│  │  │   "timestamp": "2024-05-13T10:30:45Z",              │  │ │
│  │  │   "source": "ecs",                                  │  │ │
│  │  │   "level": "info",                                  │  │ │
│  │  │   "message": "Task is running"                      │  │ │
│  │  │ }                                                   │  │ │
│  │  └─────────────────────────────────────────────────────┘  │ │
│  │  ↓                                                          │ │
│  │  ┌─────────────────────────────────────────────────────┐  │ │
│  │  │ Display in frontend                                │  │ │
│  │  │ - Terminal-like log viewer                         │  │ │
│  │  │ - Syntax highlighting                              │  │ │
│  │  │ - Auto-scroll to latest                            │  │ │
│  │  │ - Search & filter                                  │  │ │
│  │  │ - Export logs                                      │  │ │
│  │  └─────────────────────────────────────────────────────┘  │ │
│  │                                                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Socket.IO Implementation

```javascript
// backend/src/socket/handlers.js
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const Deployment = require('../models/Deployment');
const DeploymentLog = require('../models/DeploymentLog');

class SocketHandlers {
  constructor(io) {
    this.io = io;
    this.setupMiddleware();
    this.setupHandlers();
  }

  setupMiddleware() {
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication failed'));
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        socket.username = decoded.username;
        next();
      } catch (error) {
        next(new Error('Invalid token'));
      }
    });
  }

  setupHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.userId} connected (${socket.id})`);

      // Watch deployment logs
      socket.on('watch_deployment', async (data) => {
        const { deploymentId } = data;
        const room = `deployment_${deploymentId}`;

        // Verify user owns this deployment
        const deployment = await Deployment.findById(deploymentId);
        if (!deployment || deployment.userId.toString() !== socket.userId) {
          return socket.emit('error', 'Unauthorized');
        }

        // Join room
        socket.join(room);
        socket.emit('watching_deployment', { deploymentId });

        // Fetch existing logs
        const logs = await DeploymentLog.find({ deploymentId })
          .sort({ timestamp: 1 })
          .limit(100);

        socket.emit('deployment_logs_history', logs);
      });

      // Stop watching
      socket.on('stop_watching', (data) => {
        const { deploymentId } = data;
        const room = `deployment_${deploymentId}`;
        socket.leave(room);
      });

      // Disconnect
      socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected (${socket.id})`);
      });
    });
  }

  // Emit log to all clients watching deployment
  async emitLog(deploymentId, logData) {
    const room = `deployment_${deploymentId}`;
    
    // Save to database
    const log = new DeploymentLog({
      deploymentId,
      ...logData,
    });
    await log.save();

    // Emit to all clients in room
    this.io.to(room).emit('deployment_log', log);
  }

  // Emit deployment status update
  async emitStatusUpdate(deploymentId, status) {
    const room = `deployment_${deploymentId}`;
    
    // Update deployment
    await Deployment.findByIdAndUpdate(deploymentId, { status });

    // Emit to all clients
    this.io.to(room).emit('deployment_status', { deploymentId, status });
  }

  // Emit deployment complete
  async emitDeploymentComplete(deploymentId, liveUrl) {
    const room = `deployment_${deploymentId}`;
    
    // Update deployment
    await Deployment.findByIdAndUpdate(deploymentId, {
      status: 'success',
      completedAt: new Date(),
    });

    // Emit to all clients
    this.io.to(room).emit('deployment_complete', {
      deploymentId,
      liveUrl,
      completedAt: new Date(),
    });
  }
}

module.exports = SocketHandlers;
```

---

## DEPLOYMENT QUEUE SYSTEM (Redis + BullMQ)

### Job Queue Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│        DEPLOYMENT QUEUE WITH REDIS + BULLMQ                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  REQUEST FLOW                                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                                                             │ │
│  │  1. User clicks Deploy button                              │ │
│  │     POST /api/deploy/start                                 │ │
│  │                    │                                        │ │
│  │                    ↓                                        │ │
│  │  2. Backend receives request                               │ │
│  │     - Validate input                                       │ │
│  │     - Create Deployment record (status: pending)           │ │
│  │                    │                                        │ │
│  │                    ↓                                        │ │
│  │  3. Add job to queue                                       │ │
│  │     deploymentQueue.add({                                  │ │
│  │       deploymentId: '...',                                 │ │
│  │       projectId: '...',                                    │ │
│  │       repoUrl: '...',                                      │ │
│  │       envVars: {...}                                       │ │
│  │     }, {                                                    │ │
│  │       attempts: 3,                                         │ │
│  │       backoff: { type: 'exponential', delay: 2000 },       │ │
│  │       removeOnComplete: true,                              │ │
│  │       priority: 1                                          │ │
│  │     })                                                      │ │
│  │                    │                                        │ │
│  │                    ↓                                        │ │
│  │  4. Return immediately to user                             │ │
│  │     { deploymentId: '...', status: 'queued' }              │ │
│  │                                                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  QUEUE STORAGE (Redis)                                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                                                             │ │
│  │  WAIT queue: Jobs waiting to be processed                  │ │
│  │  ├─ Job 1: deploymentId=abc123 (priority 1)               │ │
│  │  ├─ Job 2: deploymentId=def456 (priority 1)               │ │
│  │  └─ Job 3: deploymentId=ghi789 (priority 2)               │ │
│  │                                                             │ │
│  │  ACTIVE queue: Currently being processed                   │ │
│  │  ├─ Job 1: deploymentId=jkl012 (started 5 min ago)       │ │
│  │  └─ Job 2: deploymentId=mno345 (started 2 min ago)       │ │
│  │                                                             │ │
│  │  COMPLETED queue: Successfully finished                    │ │
│  │  ├─ Job 1: deploymentId=pqr678 (completed 10 min ago)    │ │
│  │  └─ Job 2: deploymentId=stu901 (completed 20 min ago)    │ │
│  │                                                             │ │
│  │  FAILED queue: Failed jobs (will retry)                    │ │
│  │  ├─ Job 1: deploymentId=vwx234 (retry 1/3)               │ │
│  │  └─ Job 2: deploymentId=yz012 (retry 2/3)                │ │
│  │                                                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  JOB PROCESSING                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                                                             │ │
│  │  Worker: Deployment Job Processor                          │ │
│  │                                                             │ │
│  │  process(job) {                                             │ │
│  │    1. Get deployment data                                  │ │
│  │       const deployment = await Deployment.findById(...)    │ │
│  │                                                             │ │
│  │    2. Emit status: cloning                                 │ │
│  │       socket.emit('deployment_status', 'cloning')          │ │
│  │                                                             │ │
│  │    3. Clone repository                                     │ │
│  │       const repoPath = await gitService.clone(...)         │ │
│  │       socket.emit('log', 'Repository cloned')              │ │
│  │                                                             │ │
│  │    4. Detect framework                                     │ │
│  │       const framework = await detector.detect(...)         │ │
│  │       socket.emit('log', `Detected: ${framework}`)         │ │
│  │                                                             │ │
│  │    5. Generate Dockerfile                                  │ │
│  │       const dockerfile = await generator.generate(...)     │ │
│  │       socket.emit('log', 'Dockerfile generated')           │ │
│  │                                                             │ │
│  │    6. Emit status: building                                │ │
│  │       socket.emit('deployment_status', 'building')         │ │
│  │                                                             │ │
│  │    7. Build Docker image                                   │ │
│  │       const image = await docker.build(...)               │ │
│  │       socket.emit('log', `Image built: ${image}`)          │ │
│  │                                                             │ │
│  │    8. Emit status: pushing                                 │ │
│  │       socket.emit('deployment_status', 'pushing')          │ │
│  │                                                             │ │
│  │    9. Push to ECR                                          │ │
│  │       await docker.push(imageUri)                          │ │
│  │       socket.emit('log', 'Image pushed to ECR')            │ │
│  │                                                             │ │
│  │    10. Emit status: deploying                              │ │
│  │        socket.emit('deployment_status', 'deploying')       │ │
│  │                                                             │ │
│  │    11. Deploy to ECS                                       │ │
│  │        const taskDef = await ecs.createTaskDef(...)        │ │
│  │        const service = await ecs.createService(...)        │ │
│  │        socket.emit('log', 'Deployed to ECS')               │ │
│  │                                                             │ │
│  │    12. Create DNS record                                   │ │
│  │        const subdomain = await route53.create(...)         │ │
│  │        socket.emit('log', `Live URL: ${liveUrl}`)          │ │
│  │                                                             │ │
│  │    13. Mark deployment complete                            │ │
│  │        await deployment.update({ status: 'success' })      │ │
│  │        socket.emit('deployment_complete', liveUrl)         │ │
│  │                                                             │ │
│  │    14. Return result                                       │ │
│  │        return { success: true, liveUrl }                   │ │
│  │  }                                                          │ │
│  │                                                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ERROR HANDLING & RETRIES                                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                                                             │ │
│  │  If job fails:                                              │ │
│  │  ├─ Log error message                                      │ │
│  │  ├─ Emit error via socket                                  │ │
│  │  ├─ Check retry count                                      │ │
│  │  │  ├─ If retries < maxRetries: retry with backoff          │ │
│  │  │  │  (delay doubles each time: 2s, 4s, 8s)              │ │
│  │  │  └─ If retries >= maxRetries: mark as failed            │ │
│  │  ├─ Update deployment status to 'failed'                   │ │
│  │  ├─ Send error notification to user                        │ │
│  │  └─ Alert DevOps team if critical                          │ │
│  │                                                             │ │
│  │  User can:                                                  │ │
│  │  ├─ View error logs                                        │ │
│  │  ├─ Retry deployment                                       │ │
│  │  └─ Contact support                                        │ │
│  │                                                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  CONCURRENCY & SCALING                                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                                                             │ │
│  │  Worker Configuration                                       │ │
│  │  ├─ Workers: 1-3 (based on server capacity)                │ │
│  │  ├─ Each worker processes 1 job at a time                  │ │
│  │  ├─ Max concurrent: Workers × 1                            │ │
│  │  ├─ Job timeout: 30 minutes                                │ │
│  │  └─ Processing: FIFO with priority                         │ │
│  │                                                             │ │
│  │  Scaling Strategy                                            │ │
│  │  ├─ If queue grows > 10 jobs: auto-scale workers          │ │
│  │  ├─ If queue < 2 jobs: scale down workers                  │ │
│  │  ├─ Monitor Redis memory: trigger alerts at 80%            │ │
│  │  └─ Periodic cleanup: remove completed jobs > 7 days old   │ │
│  │                                                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## PRODUCTION DEPLOYMENT

### Production Checklist

```
INFRASTRUCTURE:
☑ AWS account setup with IAM
☑ VPC with public & private subnets
☑ ECS cluster created
☑ RDS database provisioned
☑ ElastiCache Redis cluster
☑ Route53 hosted zone
☑ ACM SSL certificates
☑ S3 buckets for backups

SECURITY:
☑ Secrets Manager for credentials
☑ VPC security groups configured
☑ IAM roles with least privilege
☑ Database encryption enabled
☑ API authentication (JWT)
☑ Rate limiting implemented
☑ CORS properly configured
☑ HTTPS/TLS enforced

MONITORING:
☑ CloudWatch alarms setup
☑ CloudWatch Logs configured
☑ Performance metrics dashboards
☑ Error logging & alerts
☑ Uptime monitoring
☑ Budget alerts configured

BACKEND:
☑ Environment variables set
☑ Database migrations run
☑ Redis connection tested
☑ AWS credentials configured
☑ Docker images built
☑ API endpoints tested
☑ Error handling robust

FRONTEND:
☑ Production build tested
☑ CDN configured
☑ Static assets compressed
☑ API endpoints updated
☑ Environment variables set
☑ Performance optimized

DEPLOYMENT:
☑ DNS records updated
☑ Load balancer configured
☑ Auto-scaling policies set
☑ Backup strategy implemented
☑ Rollback procedure documented
☑ Incident response plan ready
```

---

**This guide provides complete architectural foundations for building CloudOps. Proceed with Phase-by-Phase implementation as outlined above.**

---

**Next Steps:**
1. Review and confirm the architecture
2. Proceed with Phase 2: Deployment Engine Implementation
3. Create all necessary AWS resources
4. Implement each service layer systematically
