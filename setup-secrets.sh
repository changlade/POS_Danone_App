#!/bin/bash

# Setup script for Danone POS Analytics secrets
# This script helps you configure your environment variables

echo "🔐 Danone POS Analytics - Secrets Setup"
echo "========================================="
echo ""

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists!"
    echo "Do you want to:"
    echo "1) Edit existing .env file"
    echo "2) Create backup and create new .env"
    echo "3) Cancel setup"
    read -p "Choice (1/2/3): " choice
    
    case $choice in
        1)
            echo "Opening existing .env file for editing..."
            ${EDITOR:-nano} .env
            exit 0
            ;;
        2)
            echo "Creating backup..."
            cp .env .env.backup.$(date +%Y%m%d-%H%M%S)
            echo "Backup created: .env.backup.$(date +%Y%m%d-%H%M%S)"
            ;;
        3)
            echo "Setup cancelled."
            exit 0
            ;;
        *)
            echo "Invalid choice. Setup cancelled."
            exit 1
            ;;
    esac
fi

echo ""
echo "📝 Setting up environment variables..."
echo "Please provide the following information:"
echo ""

# Get database configuration
echo "🗄️  Database Configuration"
echo "─────────────────────────────"

read -p "Database Host (e.g., instance-xxx.database.cloud.databricks.com): " db_host
read -p "Database Port [5432]: " db_port
db_port=${db_port:-5432}

read -p "Database Name [databricks_postgres]: " db_name
db_name=${db_name:-databricks_postgres}

read -p "Database User: " db_user

echo -n "Database Password: "
read -s db_password
echo ""

read -p "Database SSL Mode [require]: " db_ssl
db_ssl=${db_ssl:-require}

read -p "Database Schema [public]: " db_schema
db_schema=${db_schema:-public}

echo ""
echo "⚙️  Application Configuration"
echo "─────────────────────────────"

read -p "Environment (development/production) [development]: " env
env=${env:-development}

read -p "Debug Mode (true/false) [false]: " debug
debug=${debug:-false}

read -p "Log Level (DEBUG/INFO/WARNING/ERROR) [INFO]: " log_level
log_level=${log_level:-INFO}

# Create .env file
echo ""
echo "📄 Creating .env file..."

cat > .env << EOF
# Database Configuration for Databricks Postgres
DB_HOST=$db_host
DB_PORT=$db_port
DB_NAME=$db_name
DB_USER=$db_user
DB_PASSWORD=$db_password
DB_SSL=$db_ssl

# Application Configuration
ENV=$env
DEBUG=$debug
LOG_LEVEL=$log_level

# Database schema
DB_SCHEMA=$db_schema
EOF

echo "✅ .env file created successfully!"
echo ""
echo "🔒 Security Notes:"
echo "• .env file has been added to .gitignore"
echo "• Never commit .env files to version control"
echo "• Keep your database credentials secure"
echo "• Use different credentials for different environments"
echo ""
echo "🚀 Next Steps:"
echo "1. Test your configuration: ./test-database-docker.sh"
echo "2. Build the application: ./build.sh" 
echo "3. Deploy to Databricks: ./deploy.sh"
echo ""
echo "📖 For more information, see env.template"
