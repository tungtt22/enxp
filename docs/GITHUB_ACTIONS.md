# GitHub Actions CI/CD

## 📋 Overview

ENXP Platform sử dụng GitHub Actions để tự động hóa quy trình CI/CD, bao gồm:

- ✅ Build và test code
- 🔍 Source code scanning và security analysis
- 🐳 Build Docker images
- 📦 Publish images lên GitHub Container Registry
- 🚀 Deploy tự động (optional)

## 🔄 Workflows

### 1. CI/CD Pipeline (`.github/workflows/ci-cd.yml`)

**Trigger:** Push hoặc PR tới `main`, `develop`, hoặc tags `v*`

**Jobs:**

#### Backend Build & Test
- Checkout code
- Setup Node.js 20
- Install dependencies
- Build TypeScript code
- Run tests
- Upload artifacts

#### Frontend Build & Test
- Checkout code
- Setup Node.js 20
- Install dependencies
- Build React app với Vite
- Run tests
- Upload artifacts

#### Code Scan
- ESLint analysis
- npm audit security check
- Optional: SonarCloud, Snyk integration

#### Build Backend Image
- Setup Docker Buildx
- Login to GitHub Container Registry (ghcr.io)
- Build multi-platform image (amd64, arm64)
- Push to registry
- Trivy vulnerability scan
- Upload security results

#### Build Frontend Image
- Setup Docker Buildx
- Login to GitHub Container Registry
- Build multi-platform image (amd64, arm64)
- Push to registry
- Trivy vulnerability scan
- Upload security results

#### Deploy (Production)
- Chỉ chạy khi push lên `main`
- Deploy notification
- Custom deployment steps (K8s, Azure, AWS, etc.)

### 2. Dependency Review (`.github/workflows/dependency-review.yml`)

**Trigger:** Pull requests

**Features:**
- Review dependencies thay đổi
- Fail nếu có vulnerability mức high trở lên
- Block GPL licenses
- Comment summary vào PR

### 3. CodeQL Security (`.github/workflows/codeql.yml`)

**Trigger:** 
- Push/PR tới `main`, `develop`
- Weekly schedule (Monday 00:00 UTC)

**Features:**
- Static code analysis
- Security vulnerability detection
- Code quality checks
- Upload results to GitHub Security

## 🚀 Usage

### Automatic Triggers

```bash
# Push to main → Full CI/CD + Deploy
git push origin main

# Push to develop → Build + Test + Scan
git push origin develop

# Create tag → Release build
git tag v1.0.0
git push origin v1.0.0

# Create PR → Build + Test + Scan + Dependency Review
gh pr create --base main
```

### Manual Triggers

Vào **Actions** tab trên GitHub → Chọn workflow → Click **Run workflow**

## 📦 Docker Images

Images được publish tự động lên GitHub Container Registry:

```bash
# Pull images
docker pull ghcr.io/tungtt22/enxp/backend:latest
docker pull ghcr.io/tungtt22/enxp/frontend:latest

# Hoặc specific version
docker pull ghcr.io/tungtt22/enxp/backend:v1.0.0
docker pull ghcr.io/tungtt22/enxp/frontend:main-abc123
```

### Image Tags

Workflow tự động tạo nhiều tags:

- `latest` - Latest build từ main branch
- `main`, `develop` - Branch name
- `pr-123` - Pull request number
- `v1.0.0`, `v1.0`, `v1` - Semantic version từ git tags
- `main-abc123` - Branch + commit SHA

## 🔐 Secrets Configuration

### Required Secrets

Không cần config gì thêm! Workflow sử dụng `GITHUB_TOKEN` tự động.

### Optional Secrets

Để enable advanced features, thêm secrets sau:

```yaml
# SonarCloud
SONAR_TOKEN: <your-sonar-token>

# Snyk
SNYK_TOKEN: <your-snyk-token>

# Deployment
KUBE_CONFIG: <your-kubeconfig>
AZURE_CREDENTIALS: <azure-service-principal>
AWS_ACCESS_KEY_ID: <aws-key>
AWS_SECRET_ACCESS_KEY: <aws-secret>
```

**Cách thêm secrets:**
1. Vào repository Settings
2. Secrets and variables → Actions
3. New repository secret
4. Nhập name và value

## 🔧 Customization

### Enable SonarCloud

Uncomment trong `.github/workflows/ci-cd.yml`:

```yaml
- name: SonarCloud Scan
  uses: SonarSource/sonarcloud-github-action@master
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

### Enable Snyk

Uncomment trong `.github/workflows/ci-cd.yml`:

```yaml
- name: Run Snyk to check for vulnerabilities
  uses: snyk/actions/node@master
  env:
    SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

### Custom Deployment

Sửa job `deploy` trong `.github/workflows/ci-cd.yml`:

```yaml
# Kubernetes deployment
- name: Deploy to Kubernetes
  run: |
    kubectl set image deployment/backend backend=${{ env.REGISTRY }}/${{ env.IMAGE_NAME_BACKEND }}:latest
    kubectl set image deployment/frontend frontend=${{ env.REGISTRY }}/${{ env.IMAGE_NAME_FRONTEND }}:latest

# Azure Container Apps
- name: Deploy to Azure
  uses: azure/webapps-deploy@v2
  with:
    app-name: enxp-app
    images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME_BACKEND }}:latest

# Docker Compose on VM
- name: SSH Deploy
  run: |
    ssh user@server "cd /app && docker-compose pull && docker-compose up -d"
```

## 📊 Monitoring

### View Workflow Runs

1. Vào **Actions** tab
2. Chọn workflow run để xem details
3. Click vào job để xem logs

### Security Alerts

1. Vào **Security** tab
2. **Code scanning alerts** - CodeQL results
3. **Dependabot alerts** - Dependency vulnerabilities
4. **Secret scanning** - Exposed secrets

### Container Registry

1. Vào **Packages** (bên phải repo page)
2. Xem all published images
3. Click image để xem tags, vulnerabilities, usage

## ⚡ Performance Tips

### Cache Dependencies

Workflow đã config cache cho npm:

```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'  # Tự động cache node_modules
```

### Docker Build Cache

Sử dụng GitHub Actions cache:

```yaml
cache-from: type=gha
cache-to: type=gha,mode=max
```

### Parallel Jobs

Jobs chạy song song để tiết kiệm thời gian:
- Backend build & Frontend build (parallel)
- Code scan (sau khi build xong)
- Image builds (parallel sau code scan)

## 🐛 Troubleshooting

### Build fails: "permission denied"

Kiểm tra repository settings:
- Settings → Actions → General
- Workflow permissions → Read and write permissions

### Images không push được

1. Check GITHUB_TOKEN permissions
2. Settings → Actions → General → Workflow permissions
3. Enable "Read and write permissions"

### Tests fail

```bash
# Chạy local để debug
npm test

# Xem logs chi tiết trên GitHub Actions
# Actions → Click job → View raw logs
```

### Docker build timeout

Tăng timeout hoặc optimize Dockerfile:

```yaml
- name: Build image
  timeout-minutes: 30  # Default is 360
```

## 📈 Best Practices

### ✅ Do's

- ✅ Always run tests before merge
- ✅ Review dependency alerts weekly
- ✅ Use semantic versioning for tags
- ✅ Monitor workflow execution time
- ✅ Keep secrets secure, never commit
- ✅ Use environment protection rules

### ❌ Don'ts

- ❌ Don't skip security scans
- ❌ Don't commit secrets to code
- ❌ Don't deploy without tests passing
- ❌ Don't ignore vulnerability alerts
- ❌ Don't use outdated base images

## 🔄 Workflow Status Badges

Thêm vào README.md:

```markdown
![CI/CD](https://github.com/tungtt22/enxp/actions/workflows/ci-cd.yml/badge.svg)
![CodeQL](https://github.com/tungtt22/enxp/actions/workflows/codeql.yml/badge.svg)
```

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [CodeQL](https://codeql.github.com/)
- [Trivy Scanner](https://github.com/aquasecurity/trivy)

## 🆘 Support

Nếu gặp vấn đề:

1. Check workflow logs
2. Review job annotations
3. Check security alerts
4. Review documentation
5. Open issue với logs và error details
