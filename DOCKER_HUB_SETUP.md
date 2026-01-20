# Docker Hub & GitHub Actions Setup Guide

## Overview

This guide explains how to push Wunero to Docker Hub automatically using GitHub Actions CI/CD.

## Prerequisites

- Docker Hub account (free at https://hub.docker.com)
- GitHub repository with push access
- GitHub Actions enabled (default for public repos)

## Step 1: Create Docker Hub Access Token

1. **Log in to Docker Hub** at https://hub.docker.com
2. Click on your profile → **Account Settings**
3. Go to **Security** → **New Access Token**
4. Name it: `wunero-github-actions`
5. Make it **Read, Write, Delete**
6. Click **Generate** and copy the token

## Step 2: Add GitHub Secrets

1. Go to your GitHub repository
2. Settings → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add two secrets:

| Name | Value |
|------|-------|
| `DOCKER_USERNAME` | Your Docker Hub username |
| `DOCKER_PASSWORD` | The access token from Step 1 |

## Step 3: Trigger a Build

### Option A: Push to main branch (builds as `latest`)

```bash
git push origin main
```

### Option B: Create a release tag (builds with version)

```bash
git tag v1.0.0
git push origin v1.0.0
```

This will automatically trigger the GitHub Actions workflow!

### Option C: Manual trigger

Go to **Actions** tab → **Build and Push to Docker Hub** → **Run workflow**

## What the Workflow Does

```
┌─────────────┐
│ Push event  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│ Checkout code           │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Login to Docker Hub     │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Build Docker image      │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Push to Docker Hub      │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Cache for next build    │
└─────────────────────────┘
```

## Image Tags

The workflow automatically creates these tags:

- **On push to main**: `yourusername/wunero:main`, `yourusername/wunero:latest`
- **On tag v1.0.0**: `yourusername/wunero:v1.0.0`, `yourusername/wunero:1.0`, `yourusername/wunero:latest`
- **On any commit**: `yourusername/wunero:main-<commit-sha>`

## Pull the Image

```bash
# Latest version
docker pull yourusername/wunero:latest

# Specific version
docker pull yourusername/wunero:v1.0.0

# Main branch
docker pull yourusername/wunero:main
```

## Run with Docker Compose

Create `docker-compose.prod.yml`:

```yaml
services:
  keycloak:
    image: quay.io/keycloak/keycloak:latest
    environment:
      - KEYCLOAK_ADMIN=admin
      - KEYCLOAK_ADMIN_PASSWORD=${KEYCLOAK_ADMIN_PASSWORD:-admin}
      - KC_DB=sqlite
    ports:
      - "8080:8080"
    volumes:
      - keycloak-data:/opt/keycloak/data
    command: start-dev
    restart: unless-stopped

  wunero:
    image: yourusername/wunero:latest
    ports:
      - "3000:3000"
    volumes:
      - wunero-data:/app/data
    environment:
      - NODE_ENV=production
      - DB_PATH=/app/data
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - KEYCLOAK_URL=http://keycloak:8080
      - KEYCLOAK_REALM=master
      - KEYCLOAK_CLIENT_ID=wunero
      - KEYCLOAK_CLIENT_SECRET=${KEYCLOAK_CLIENT_SECRET}
    depends_on:
      - keycloak
    restart: unless-stopped

volumes:
  wunero-data:
  keycloak-data:
```

Run it:

```bash
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

## Manual Docker Build & Push

If you want to manually build and push:

```bash
# Build image
docker build -t yourusername/wunero:v1.0.0 .

# Tag as latest
docker tag yourusername/wunero:v1.0.0 yourusername/wunero:latest

# Login to Docker Hub
docker login

# Push images
docker push yourusername/wunero:v1.0.0
docker push yourusername/wunero:latest
```

## Troubleshooting

### "Authentication Error" in GitHub Actions

- Verify `DOCKER_USERNAME` and `DOCKER_PASSWORD` are set correctly in GitHub Secrets
- Check the access token hasn't expired in Docker Hub
- Regenerate token if needed

### Build Fails

- Check the **Actions** tab for error logs
- Verify `Dockerfile` and `docker-compose.yml` are valid
- Ensure all environment variables in Dockerfile are set

### Image Not Appearing on Docker Hub

- Check the workflow completed successfully (green checkmark)
- Refresh Docker Hub page
- Verify the correct username is used in `DOCKER_USERNAME`

## CI/CD Pipeline Status

View build status in GitHub:

```
Actions → Build and Push to Docker Hub → Latest runs
```

Click on any run to see:
- Build logs
- Push status
- Image tags created
- Build duration

## Best Practices

1. **Use semantic versioning**: `v1.0.0`, `v1.1.0`, `v2.0.0`
2. **Keep `main` stable**: Only merge tested code
3. **Monitor builds**: Check Actions for failures
4. **Use specific tags in production**: Don't rely on `latest`
5. **Update docker-compose.prod.yml** with new versions

## Next Steps

- [ ] Set up automatic deployments to a server
- [ ] Add build status badge to README
- [ ] Configure image retention policy on Docker Hub
- [ ] Set up Renovate for dependency updates
