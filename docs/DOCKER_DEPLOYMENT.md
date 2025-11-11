# ENXP Platform - Docker Deployment Guide

## 📋 Overview

This guide explains how to deploy the ENXP Platform using Docker and Docker Compose. The platform consists of three main services:

- **Frontend**: React application served by Nginx
- **Backend**: Express API server with plugin system
- **PostgreSQL**: Database for persistent storage

## 🚀 Quick Start

### Prerequisites

- Docker Engine 20.10 or higher
- Docker Compose 2.0 or higher
- 2GB+ available RAM
- 5GB+ available disk space

### 1. Clone and Configure

```bash
# Copy environment file
cp .env.example .env

# Edit .env and set your configuration
# Especially change DB_PASSWORD to a secure value
nano .env
```

### 2. Build and Run

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check service health
docker-compose ps
```

### 3. Access the Application

- **Frontend**: http://localhost (or http://localhost:80)
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **Database**: localhost:5432 (postgres/postgres)

## 🏗️ Architecture

```
┌─────────────────┐
│   Frontend      │
│   (Nginx)       │ :80
│   React App     │
└────────┬────────┘
         │
         │ API Proxy
         │
┌────────▼────────┐
│   Backend       │
│   (Node.js)     │ :3000
│   Express API   │
└────────┬────────┘
         │
         │ TypeORM
         │
┌────────▼────────┐
│   PostgreSQL    │ :5432
│   Database      │
└─────────────────┘
```

## 🔧 Configuration

### Environment Variables

All configuration is done via the `.env` file:

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (production/development) | `production` |
| `BACKEND_PORT` | Backend API port | `3000` |
| `FRONTEND_PORT` | Frontend web port | `80` |
| `DB_HOST` | Database hostname | `postgres` |
| `DB_PORT` | Database port | `5432` |
| `DB_USERNAME` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` |
| `DB_DATABASE` | Database name | `enxp` |
| `DB_SYNCHRONIZE` | Auto-sync schema (dev only!) | `false` |
| `DB_LOGGING` | Enable SQL logging | `false` |
| `VITE_API_URL` | API URL for frontend | `http://localhost:3000` |

### Database Configuration

**Production Settings** (in `.env`):
```env
DB_SYNCHRONIZE=false  # Never auto-sync in production!
DB_LOGGING=false
```

**Development Settings**:
```env
DB_SYNCHRONIZE=true   # Auto-create tables
DB_LOGGING=true       # See SQL queries
```

## 🛠️ Development Mode

For local development with hot reload:

```bash
# Use the override file (automatically loaded)
docker-compose up -d

# Or explicitly specify both files
docker-compose -f docker-compose.yml -f docker-compose.override.yml up
```

This will:
- Mount source code for hot reload
- Enable TypeScript watch mode
- Enable Vite dev server
- Auto-sync database schema
- Show SQL query logs

## 📊 Database Management

### Connect to PostgreSQL

```bash
# Using docker exec
docker exec -it enxp-postgres psql -U postgres -d enxp

# Or from host (if port 5432 is exposed)
psql -h localhost -U postgres -d enxp
```

### Backup Database

```bash
# Backup
docker exec enxp-postgres pg_dump -U postgres enxp > backup.sql

# Restore
cat backup.sql | docker exec -i enxp-postgres psql -U postgres -d enxp
```

### View Database Data

```bash
# Check persistent volume
docker volume inspect enxp_postgres_data
```

## 🔍 Monitoring

### Health Checks

```bash
# Backend health
curl http://localhost:3000/health

# Frontend health
curl http://localhost/

# Check all services
docker-compose ps
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Resource Usage

```bash
# Check CPU/Memory usage
docker stats

# Check disk usage
docker system df
```

## 🚨 Troubleshooting

### Backend won't start

```bash
# Check if database is ready
docker-compose logs postgres

# Check backend logs
docker-compose logs backend

# Restart backend
docker-compose restart backend
```

### Frontend shows 502 Bad Gateway

```bash
# Check if backend is healthy
curl http://localhost:3000/health

# Check nginx logs
docker-compose logs frontend

# Verify API proxy configuration
docker exec enxp-frontend cat /etc/nginx/conf.d/default.conf
```

### Database connection failed

```bash
# Verify database is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Test connection
docker exec enxp-backend node -e "require('pg').Pool({host:'postgres',user:'postgres',password:'postgres'}).query('SELECT 1')"
```

### Port already in use

```bash
# Find what's using the port
lsof -i :3000
lsof -i :80
lsof -i :5432

# Change ports in .env
BACKEND_PORT=3001
FRONTEND_PORT=8080
DB_PORT=5433
```

## 🧹 Cleanup

### Stop services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes database!)
docker-compose down -v

# Remove images as well
docker-compose down --rmi all
```

### Clean up disk space

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Full cleanup
docker system prune -a --volumes
```

## 🔐 Security

### Production Checklist

- [ ] Change default database password in `.env`
- [ ] Set `DB_SYNCHRONIZE=false` (never auto-sync in production)
- [ ] Use strong passwords (16+ characters)
- [ ] Enable HTTPS with reverse proxy (nginx/traefik)
- [ ] Set up firewall rules
- [ ] Regular database backups
- [ ] Keep Docker images updated
- [ ] Review nginx security headers
- [ ] Enable rate limiting
- [ ] Set up monitoring/alerting

### Recommended .env for Production

```env
NODE_ENV=production
DB_PASSWORD=<generate-strong-password-here>
DB_SYNCHRONIZE=false
DB_LOGGING=false
VITE_API_URL=https://api.yourdomain.com
```

## 📝 Common Tasks

### Rebuild after code changes

```bash
# Rebuild specific service
docker-compose build backend
docker-compose build frontend

# Rebuild and restart
docker-compose up -d --build
```

### Scale services

```bash
# Run multiple backend instances
docker-compose up -d --scale backend=3

# Note: You'll need a load balancer for this
```

### Update dependencies

```bash
# Update packages in backend
docker-compose exec backend npm update

# Rebuild image
docker-compose build backend
docker-compose up -d backend
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [TypeORM Documentation](https://typeorm.io/)
- [Nginx Configuration Guide](https://nginx.org/en/docs/)

## 🆘 Support

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Verify configuration: `cat .env`
3. Check service health: `docker-compose ps`
4. Review this guide's troubleshooting section
5. Open an issue on GitHub with logs and configuration

## 📄 License

See LICENSE file for details.
