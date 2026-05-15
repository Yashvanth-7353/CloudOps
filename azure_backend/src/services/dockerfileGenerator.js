/**
 * Dockerfile Generator Service
 * Generates optimized Dockerfiles for different frameworks
 */

const path = require('path');
const fs = require('fs').promises;

class DockerfileGenerator {
  /**
   * Generate Dockerfile for a framework
   * @param {string} framework - Framework name
   * @param {Object} config - Configuration object
   * @returns {string} Dockerfile content
   */
  generateDockerfile(framework, config = {}) {
    const {
      port = 3000,
      buildCommand = 'npm run build',
      startCommand = 'npm start',
      workdir = '/app',
      baseImage = null,
      envVars = {},
    } = config;

    const generators = {
      nodejs: () => this.generateNodeDockerfile(port, buildCommand, startCommand, workdir),
      python: () => this.generatePythonDockerfile(port, buildCommand, startCommand, workdir),
      java: () => this.generateJavaDockerfile(port, buildCommand, startCommand, workdir),
      go: () => this.generateGoDockerfile(port, buildCommand, startCommand, workdir),
      ruby: () => this.generateRubyDockerfile(port, buildCommand, startCommand, workdir),
      php: () => this.generatePhpDockerfile(port, buildCommand, startCommand, workdir),
      rust: () => this.generateRustDockerfile(port, buildCommand, startCommand, workdir),
      dotnet: () => this.generateDotnetDockerfile(port, buildCommand, startCommand, workdir),
      static: () => this.generateStaticDockerfile(port),
    };

    return generators[framework]?.() || generators.static();
  }

  /**
   * Generate Node.js Dockerfile (Multi-stage build)
   */
  generateNodeDockerfile(port, buildCommand, startCommand, workdir) {
    return `# Build stage
FROM node:18-alpine AS builder

WORKDIR ${workdir}

# Copy package files
COPY package*.json ./
COPY yarn.lock* ./
COPY pnpm-lock.yaml* ./

# Install dependencies
RUN npm ci --only=production || npm install --only=production || yarn install --production || pnpm install --prod

# Copy source code
COPY . .

# Build application (if needed)
RUN npm run build 2>/dev/null || true

# Runtime stage
FROM node:18-alpine

WORKDIR ${workdir}

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copy from builder
COPY --from=builder --chown=nodejs:nodejs ${workdir} ${workdir}

# Set environment
ENV NODE_ENV=production
ENV PORT=${port}

# Expose port
EXPOSE ${port}

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \\
  CMD node -e "require('http').get('http://localhost:${port}', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Run as non-root
USER nodejs

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["npm", "start"]
`;
  }

  /**
   * Generate Python Dockerfile (Multi-stage build)
   */
  generatePythonDockerfile(port, buildCommand, startCommand, workdir) {
    return `# Build stage
FROM python:3.11-slim AS builder

WORKDIR ${workdir}

# Install build dependencies
RUN apt-get update && apt-get install -y \\
    build-essential \\
    git \\
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements*.txt ./

# Install Python dependencies
RUN pip install --user --no-cache-dir -r requirements.txt

# Runtime stage
FROM python:3.11-slim

WORKDIR ${workdir}

# Install runtime dependencies
RUN apt-get update && apt-get install -y \\
    curl \\
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -m -u 1001 python

# Copy dependencies from builder
COPY --from=builder /root/.local /home/python/.local

# Copy application
COPY --chown=python:python . .

# Set environment
ENV PATH=/home/python/.local/bin:\$PATH
ENV PYTHONUNBUFFERED=1
ENV PORT=${port}

# Expose port
EXPOSE ${port}

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \\
  CMD curl -f http://localhost:${port}/health || exit 1

# Run as non-root
USER python

# Start application
CMD ["python", "app.py"]
`;
  }

  /**
   * Generate Java Dockerfile (Multi-stage build)
   */
  generateJavaDockerfile(port, buildCommand, startCommand, workdir) {
    return `# Build stage
FROM maven:3.8.1-openjdk-17 AS builder

WORKDIR ${workdir}

COPY . .

RUN mvn clean package -DskipTests -q

# Runtime stage
FROM openjdk:17-jdk-slim

WORKDIR ${workdir}

# Create non-root user
RUN groupadd -r java && useradd -r -g java java

# Copy JAR from builder
COPY --from=builder ${workdir}/target/*.jar app.jar

# Set environment
ENV PORT=${port}
ENV JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0 -XX:InitialRAMPercentage=25.0"

# Expose port
EXPOSE ${port}

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \\
  CMD curl -f http://localhost:${port}/actuator/health || exit 1

# Run as non-root
USER java

# Start application
ENTRYPOINT ["sh", "-c", "java \$JAVA_OPTS -jar app.jar"]
`;
  }

  /**
   * Generate Go Dockerfile (Multi-stage build)
   */
  generateGoDockerfile(port, buildCommand, startCommand, workdir) {
    return `# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR ${workdir}

# Install build dependencies
RUN apk add --no-cache git

COPY go.mod go.sum* ./

RUN go mod download || true

COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -a -installsuffix cgo -o app .

# Runtime stage
FROM alpine:3.18

WORKDIR ${workdir}

# Install runtime dependencies
RUN apk add --no-cache ca-certificates curl

# Create non-root user
RUN addgroup -g 1001 -S appgroup && \\
    adduser -u 1001 -S appuser -G appgroup

# Copy binary from builder
COPY --from=builder ${workdir}/app .

# Set environment
ENV PORT=${port}

# Expose port
EXPOSE ${port}

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \\
  CMD wget --quiet --tries=1 --spider http://localhost:${port}/health || exit 1

# Run as non-root
USER appuser

# Start application
CMD ["./app"]
`;
  }

  /**
   * Generate Ruby Dockerfile
   */
  generateRubyDockerfile(port, buildCommand, startCommand, workdir) {
    return `FROM ruby:3.2-alpine

WORKDIR ${workdir}

# Install build dependencies
RUN apk add --no-cache \\
    build-base \\
    git \\
    postgresql-dev \\
    nodejs \\
    yarn

# Create non-root user
RUN addgroup -g 1001 -S ruby && \\
    adduser -u 1001 -S ruby -G ruby

# Copy Gemfile
COPY Gemfile Gemfile.lock* ./

# Install gems
RUN bundle config set --local deployment 'true' && \\
    bundle config set --local without 'development test' && \\
    bundle install && \\
    rm -rf /usr/local/bundle/cache/*.gem && \\
    find /usr/local/bundle/gems -name "*.c" -delete && \\
    find /usr/local/bundle/gems -name "*.h" -delete

# Copy application
COPY --chown=ruby:ruby . .

# Precompile assets if Rails app
RUN bundle exec rake assets:precompile 2>/dev/null || true

# Set environment
ENV RAILS_ENV=production
ENV PORT=${port}

# Expose port
EXPOSE ${port}

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \\
  CMD curl -f http://localhost:${port}/ || exit 1

# Run as non-root
USER ruby

# Start application
CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0", "-p", "3000"]
`;
  }

  /**
   * Generate PHP Dockerfile
   */
  generatePhpDockerfile(port, buildCommand, startCommand, workdir) {
    return `FROM php:8.2-apache

WORKDIR ${workdir}

# Install PHP extensions
RUN docker-php-ext-install \\
    pdo \\
    pdo_mysql \\
    json \\
    curl \\
    intl \\
    gd

# Enable Apache modules
RUN a2enmod rewrite
RUN a2enmod headers

# Create non-root user
RUN useradd -m -u 1001 www-data-user

# Copy application
COPY --chown=www-data:www-data . .

# Install Composer dependencies if composer.json exists
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
RUN if [ -f composer.json ]; then composer install --no-dev --optimize-autoloader; fi

# Apache configuration
RUN echo '<Directory /var/www/html>' > /etc/apache2/sites-available/000-default.conf && \\
    echo '    Options Indexes FollowSymLinks' >> /etc/apache2/sites-available/000-default.conf && \\
    echo '    AllowOverride All' >> /etc/apache2/sites-available/000-default.conf && \\
    echo '    Require all granted' >> /etc/apache2/sites-available/000-default.conf && \\
    echo '</Directory>' >> /etc/apache2/sites-available/000-default.conf

# Set environment
ENV PORT=${port}

# Expose port
EXPOSE ${port}

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \\
  CMD curl -f http://localhost:${port}/ || exit 1

# Start Apache
CMD ["apache2-foreground"]
`;
  }

  /**
   * Generate Rust Dockerfile (Multi-stage build)
   */
  generateRustDockerfile(port, buildCommand, startCommand, workdir) {
    return `# Build stage
FROM rust:1.70-alpine AS builder

WORKDIR ${workdir}

# Install build dependencies
RUN apk add --no-cache musl-dev

COPY Cargo.* ./

RUN mkdir src && echo "fn main() {}" > src/main.rs && \\
    cargo build --release && \\
    rm -rf src

COPY . .

RUN cargo build --release

# Runtime stage
FROM alpine:3.18

WORKDIR ${workdir}

# Install runtime dependencies
RUN apk add --no-cache ca-certificates curl

# Create non-root user
RUN addgroup -g 1001 -S rust && \\
    adduser -u 1001 -S rust -G rust

# Copy binary from builder
COPY --from=builder ${workdir}/target/release/app .

# Set environment
ENV PORT=${port}

# Expose port
EXPOSE ${port}

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \\
  CMD wget --quiet --tries=1 --spider http://localhost:${port}/ || exit 1

# Run as non-root
USER rust

# Start application
CMD ["./app"]
`;
  }

  /**
   * Generate .NET Dockerfile (Multi-stage build)
   */
  generateDotnetDockerfile(port, buildCommand, startCommand, workdir) {
    return `# Build stage
FROM mcr.microsoft.com/dotnet/sdk:7.0 AS builder

WORKDIR ${workdir}

COPY . .

RUN dotnet restore
RUN dotnet build -c Release --no-restore
RUN dotnet publish -c Release --no-build -o /app/published

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:7.0

WORKDIR ${workdir}

# Create non-root user
RUN groupadd -r dotnet && useradd -r -g dotnet dotnet

# Copy from builder
COPY --from=builder /app/published .

# Set environment
ENV ASPNETCORE_URLS=http://+:${port}
ENV ASPNETCORE_ENVIRONMENT=Production

# Expose port
EXPOSE ${port}

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \\
  CMD curl -f http://localhost:${port}/health || exit 1

# Run as non-root
USER dotnet

# Start application
CMD ["dotnet", "YourApp.dll"]
`;
  }

  /**
   * Generate Static Site Dockerfile (Nginx)
   */
  generateStaticDockerfile(port) {
    return `FROM nginx:1.25-alpine

# Copy static files
COPY . /usr/share/nginx/html/

# Create custom nginx configuration
RUN echo 'server {' > /etc/nginx/conf.d/default.conf && \\
    echo '    listen 80 default_server;' >> /etc/nginx/conf.d/default.conf && \\
    echo '    server_name _;' >> /etc/nginx/conf.d/default.conf && \\
    echo '    root /usr/share/nginx/html;' >> /etc/nginx/conf.d/default.conf && \\
    echo '    index index.html;' >> /etc/nginx/conf.d/default.conf && \\
    echo '    location / {' >> /etc/nginx/conf.d/default.conf && \\
    echo '        try_files \$uri \$uri/ /index.html;' >> /etc/nginx/conf.d/default.conf && \\
    echo '    }' >> /etc/nginx/conf.d/default.conf && \\
    echo '    location /health {' >> /etc/nginx/conf.d/default.conf && \\
    echo '        access_log off;' >> /etc/nginx/conf.d/default.conf && \\
    echo '        return 200 "healthy\\n";' >> /etc/nginx/conf.d/default.conf && \\
    echo '        add_header Content-Type text/plain;' >> /etc/nginx/conf.d/default.conf && \\
    echo '    }' >> /etc/nginx/conf.d/default.conf && \\
    echo '}' >> /etc/nginx/conf.d/default.conf

# Set environment
ENV PORT=80

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \\
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
`;
  }

  /**
   * Generate .dockerignore file
   * @returns {string} .dockerignore content
   */
  generateDockerignore() {
    return `# Git
.git
.gitignore
.gitattributes

# Dependencies
node_modules/
.npm
yarn.lock
package-lock.json
pnpm-lock.yaml
vendor/
Gemfile.lock
go.sum
.gradle/
target/
dist/
build/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Testing
.nyc_output/
coverage/
.pytest_cache/
__pycache__/

# Build output
out/
dist/
build/
*.zip
*.tar.gz

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Temporary files
tmp/
temp/
*.tmp

# CI/CD
.github/
.gitlab-ci.yml
.travis.yml
Jenkinsfile

# Docker
Dockerfile
docker-compose.yml
.dockerignore

# Documentation
README.md
CHANGELOG.md
docs/
`;
  }

  /**
   * Save Dockerfile to file
   * @param {string} content - Dockerfile content
   * @param {string} outputPath - Output path
   */
  async saveDockerfile(content, outputPath) {
    try {
      await fs.writeFile(outputPath, content, 'utf-8');
      return { success: true, path: outputPath };
    } catch (error) {
      throw new Error(`Failed to save Dockerfile: ${error.message}`);
    }
  }

  /**
   * Save .dockerignore file
   * @param {string} outputPath - Output path
   */
  async saveDockerigno (outputPath) {
    try {
      const content = this.generateDockerignore();
      await fs.writeFile(outputPath, content, 'utf-8');
      return { success: true, path: outputPath };
    } catch (error) {
      throw new Error(`Failed to save .dockerignore: ${error.message}`);
    }
  }
}

module.exports = new DockerfileGenerator();
