# Database Testing Documentation

## Overview

The Danone POS Analytics app includes comprehensive database connectivity testing for the Databricks Postgres integration.

## Testing Methods

### 1. Automated Deployment Testing

Database connectivity is automatically tested during deployment:

```bash
./deploy.sh
```

The deployment script will:
- Build the application containers
- Test database connectivity using containerized environment
- Prompt for confirmation if database issues are detected
- Deploy to Databricks Apps
- Test the live application endpoints

### 2. Manual Database Testing

#### Containerized Testing (Recommended)

```bash
./test-database-docker.sh
```

This runs the database test within the Docker container where PostgreSQL dependencies are properly installed.

#### Direct Testing (Production Environment)

```bash
python3 test-database.py
```

Note: This requires PostgreSQL dependencies to be installed locally.

### 3. Health Check Endpoints

#### Basic Health Check
```bash
curl http://localhost:8000/health
```

#### Database Health Check
```bash
curl http://localhost:8000/health/database
```

Returns detailed database connectivity status:
- Connection pool status
- Schema access verification
- Table access verification
- Data availability
- Permission validation

## Database Configuration

The app connects to your Databricks Postgres database:

- **Host**: `instance-1203a90b-2a20-4155-b1cc-383360ea8797.database.cloud.databricks.com`
- **Database**: `databricks_postgres`
- **Schema**: `public`
- **Table**: `businesses`
- **User**: `app_account`

## Test Coverage

### Database Connection Tests
- ✅ Network connectivity to Databricks
- ✅ Authentication with app_account credentials
- ✅ SSL connection establishment
- ✅ PostgreSQL version verification

### Schema and Table Access
- ✅ public schema exists
- ✅ businesses table access
- ✅ Column mapping verification
- ✅ Data type validation

### Data Quality Tests
- ✅ Count of businesses with coordinates
- ✅ Sample business data retrieval
- ✅ Menu items data validation
- ✅ Danone customer status verification
- ✅ Business information completeness

### Permission Verification
- ✅ SELECT permissions on businesses table
- ✅ Schema access permissions
- ✅ Connection pool functionality

## Troubleshooting

### Common Issues

1. **Connection Timeout**
   - Check network connectivity to Databricks
   - Verify firewall/security group settings
   - Ensure Databricks instance is running

2. **Authentication Failed**
   - Verify app_account credentials
   - Check user permissions on database
   - Ensure SSL configuration is correct

3. **Schema/Table Not Found**
   - Verify public schema exists
   - Check businesses table structure
   - Validate data ingestion pipeline

4. **No Data Found**
   - Check if businesses have been processed
   - Verify latitude/longitude data exists
   - Check is_danone_customer status
   - Verify menu_items are populated

### Deployment Failures

If database tests fail during deployment:

1. **Review test output** for specific error messages
2. **Check connectivity** from deployment environment
3. **Verify credentials** and permissions
4. **Consider continuing** with deployment (app will use sample data)

## Integration Flow

1. **Pre-deployment**: Test database connectivity
2. **Build**: Create containers with PostgreSQL dependencies
3. **Deploy**: Upload to Databricks Apps
4. **Post-deployment**: Test live application endpoints
5. **Monitoring**: Use health check endpoints for ongoing validation

## Sample Test Output

```
🧪 Danone POS Analytics - Database Connection Test
============================================================
⏰ Test started at: 2025-09-03T08:05:31.839708

🔍 Testing Databricks Postgres database connection...
📍 Host: instance-1203a90b-2a20-4155-b1cc-383360ea8797.database.cloud.databricks.com
📍 Database: databricks_postgres
📍 User: app_account

✅ asyncpg module found
🔗 Establishing database connection...
✅ Database connection established successfully!
📊 Testing basic database query...
✅ Database version: PostgreSQL 16.9 on x86_64-pc-linux-gnu
🏗️  Testing schema access...
✅ public schema found
📋 Testing table access...
✅ businesses table found
🎯 Testing data query...
✅ Found 3 businesses with coordinates
📈 Testing sample data retrieval...
✅ Sample data retrieved (3 records):
   - ID: 1, Business: L'Ambroisie, Type: Restaurant, ✅ Danone Customer, Last Photo: 2025-09-03
   - ID: 2, Business: Le Train Bleu, Type: Restaurant, ✅ Danone Customer, Last Photo: 2025-09-02
   - ID: 3, Business: Café de la Paix, Type: Café, ❌ Not Customer, Last Photo: 2025-09-01
🔐 Testing database permissions...
✅ SELECT permission confirmed
✅ Database connection closed

📊 Database Connection Test Summary:
✅ Connection: SUCCESS
✅ Authentication: SUCCESS
✅ Schema Access: SUCCESS
✅ Table Access: SUCCESS
✅ Data Query: SUCCESS

🎉 Database is ready for production use!
```

## Next Steps

After successful database testing:

1. Deploy to Databricks Apps using `./deploy.sh`
2. Configure OAuth scopes in Databricks workspace
3. Start the application
4. Verify live data integration using the refresh button
5. Monitor using health check endpoints
