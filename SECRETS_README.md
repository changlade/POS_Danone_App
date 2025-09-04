# 🔐 Secrets Management for Danone POS Analytics

This guide explains how to securely manage secrets and environment variables for the Danone POS Analytics application.

## 🛡️ Security Overview

The application has been configured to:
- ✅ **Never store secrets in code** - All sensitive data is loaded from environment variables
- ✅ **Git-ignore secrets files** - `.env` files are automatically excluded from version control
- ✅ **Provide secure defaults** - Fallback configuration for development with warnings
- ✅ **Environment-specific configs** - Different settings for development/production

## 🚀 Quick Setup

### Option 1: Interactive Setup (Recommended)
```bash
./setup-secrets.sh
```

### Option 2: Manual Setup
```bash
# Copy the template
cp env.template .env

# Edit with your credentials
nano .env
```

## 📝 Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | Databricks Postgres host | `instance-xxx.database.cloud.databricks.com` |
| `DB_PORT` | Database port | `5432` |
| `DB_NAME` | Database name | `databricks_postgres` |
| `DB_USER` | Database username | `app_account` |
| `DB_PASSWORD` | Database password | `your_secure_password` |
| `DB_SSL` | SSL mode | `require` |
| `DB_SCHEMA` | Database schema | `public` |
| `ENV` | Environment type | `development` or `production` |
| `DEBUG` | Debug mode | `true` or `false` |
| `LOG_LEVEL` | Logging level | `INFO`, `DEBUG`, `WARNING`, `ERROR` |

## 🏗️ Configuration System

### Backend Configuration (`backend/config.py`)
- Loads environment variables using `python-dotenv`
- Validates required variables
- Provides fallback for development
- Exports `DATABASE_CONFIG` and `APP_CONFIG`

### Environment Files
- **`.env`** - Your actual secrets (git-ignored)
- **`env.template`** - Template with example values
- **`.env.local`** - Local overrides (git-ignored)
- **`.env.production`** - Production-specific variables (git-ignored)

## 🔒 Security Best Practices

### ✅ DO:
- Use the interactive setup script
- Keep different credentials for dev/staging/production
- Regularly rotate database passwords
- Use strong, unique passwords
- Store production secrets in secure systems (Azure Key Vault, AWS Secrets Manager)

### ❌ DON'T:
- Commit `.env` files to git
- Share credentials via email/chat
- Use weak or default passwords
- Hard-code secrets in application code
- Use production credentials in development

## 🐳 Docker & Deployment

### Local Docker Development
```bash
# Create your .env file first
./setup-secrets.sh

# Build with environment variables
./build.sh

# Run locally
docker run --env-file .env -p 8000:8000 danone-backend
```

### Databricks Apps Deployment
The deployment process automatically includes your `.env` configuration:

```bash
# Deploy with your environment configuration
./deploy.sh
```

## 🧪 Testing Configuration

### Test Database Connection
```bash
# Test locally
./test-database-docker.sh

# Test specific environment
ENV=production ./test-database-docker.sh
```

### Verify Configuration
```bash
# Check what config is loaded
python -c "from backend.config import DATABASE_CONFIG; print(DATABASE_CONFIG)"
```

## 🚨 Troubleshooting

### Missing Environment Variables
```
⚠️  Warning: Missing required environment variables: ['DB_HOST', 'DB_PASSWORD']
🔧 Please check your .env file or environment configuration
```

**Solution**: Run `./setup-secrets.sh` or check your `.env` file.

### Database Connection Failed
```
Failed to initialize database pool: connection failed
```

**Solution**: 
1. Verify credentials in `.env`
2. Test connection: `./test-database-docker.sh`
3. Check network connectivity
4. Verify database permissions

### Development Mode Warning
```
🚨 Using fallback configuration for development
```

**Solution**: This is normal for development. Create `.env` file to remove warning.

## 📁 File Structure

```
POS_Danone_App/
├── .env                    # Your secrets (git-ignored)
├── env.template           # Template file
├── .gitignore             # Includes .env patterns
├── setup-secrets.sh       # Interactive setup
├── backend/
│   ├── config.py          # Configuration loader
│   ├── app.py             # Uses config instead of hardcoded values
│   └── requirements.txt   # Includes python-dotenv
└── SECRETS_README.md      # This file
```

## 🔄 Migration from Hardcoded Secrets

If you're migrating from hardcoded secrets:

1. **Run the setup**: `./setup-secrets.sh`
2. **Enter your existing values** when prompted
3. **Test the configuration**: `./test-database-docker.sh`
4. **Deploy**: `./deploy.sh`

The application will automatically use environment variables instead of hardcoded values.

## 🆘 Support

If you encounter issues:
1. Check this guide first
2. Verify your `.env` file format
3. Test database connectivity
4. Check application logs
5. Contact the development team

---

**Remember: Security is everyone's responsibility! 🔐**
