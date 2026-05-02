---
name: deploy
description: Deploy jungle-guess quiz game to AWS EC2 production server
user_invocable: true
---

# Deploy Jungle Guess

## Infrastructure

- **Domain**: https://jungle-guess.probooking.app
- **Server**: AWS EC2 at 3.90.215.126 (us-east-1)
- **SSH**: `ssh probooking` (configured in ~/.ssh/config, user: ubuntu, key: ~/.ssh/service.pem)
- **App path on server**: /opt/quize-game-webapp
- **Docker port**: 127.0.0.1:3013 → container port 80
- **Nginx**: /etc/nginx/sites-enabled/jungle-guess.probooking.app (HTTPS via certbot)
- **Docker project name**: `jungle-guess` (use `-p jungle-guess` with docker compose)
- **Container registry**: ghcr.io/fix2015/quize-game-webapp/frontend:latest

## CI/CD Pipeline

Push to `main` triggers:
1. **CI** (.github/workflows/ci.yml): Builds Docker image → pushes to GHCR
2. **Deploy** (.github/workflows/deploy.yml): SSHs into EC2, pulls image, restarts container, configures nginx on first deploy

GitHub Secrets required: `EC2_HOST`, `EC2_USER`, `EC2_SSH_PRIVATE_KEY` (base64-encoded ~/.ssh/service.pem)

## Static Assets

Images (296MB) and topic JSON files are hosted on S3, NOT bundled in Docker:
- **S3 bucket**: gport (eu-central-1)
- **S3 prefix**: jungle-guess/
- **URLs**: https://gport.s3.eu-central-1.amazonaws.com/jungle-guess/images/... and .../topics/...
- **Upload command**: `aws --profile gport s3 sync public/images/ s3://gport/jungle-guess/images/`

## Manual Deploy

```bash
ssh probooking
cd /opt/quize-game-webapp
git fetch origin main && git reset --hard origin/main
docker build -f Dockerfile.prod -t ghcr.io/fix2015/quize-game-webapp/frontend:latest .
cd infra && docker compose -f docker-compose.prod.yml -p jungle-guess up -d
```

## Health Check

```bash
ssh probooking "curl -sf http://127.0.0.1:3013/health"
curl -sf https://jungle-guess.probooking.app/
```
