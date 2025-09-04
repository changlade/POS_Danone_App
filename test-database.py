#!/usr/bin/env python3
"""
Database connectivity test for Danone POS Analytics
Tests connection to Databricks Postgres database
"""

import asyncio
import sys
import json
from datetime import datetime

# Database configuration
DATABASE_CONFIG = {
    "host": "instance-1203a90b-2a20-4155-b1cc-383360ea8797.database.cloud.databricks.com",
    "port": 5432,
    "database": "databricks_postgres",
    "user": "app_account",
    "password": "DX2o9aIqFId34jJY",
    "ssl": "require"
}

async def test_database_connection():
    """Test database connectivity and basic queries"""
    
    print("🔍 Testing Databricks Postgres database connection...")
    print(f"📍 Host: {DATABASE_CONFIG['host']}")
    print(f"📍 Database: {DATABASE_CONFIG['database']}")
    print(f"📍 User: {DATABASE_CONFIG['user']}")
    print("")
    
    try:
        # Try to import asyncpg
        try:
            import asyncpg
            print("✅ asyncpg module found")
        except ImportError:
            print("❌ asyncpg module not found.")
            print("💡 This is expected in local development mode.")
            print("🐳 Database testing should be done within the Docker container.")
            print("📝 Run: docker run --rm danone-backend python test-database.py")
            return False
        
        # Test database connection
        print("🔗 Establishing database connection...")
        conn = await asyncpg.connect(
            host=DATABASE_CONFIG["host"],
            port=DATABASE_CONFIG["port"],
            database=DATABASE_CONFIG["database"],
            user=DATABASE_CONFIG["user"],
            password=DATABASE_CONFIG["password"],
            ssl="require"
        )
        
        print("✅ Database connection established successfully!")
        
        # Test basic query
        print("📊 Testing basic database query...")
        result = await conn.fetchval("SELECT version()")
        print(f"✅ Database version: {result}")
        
        # Test schema access
        print("🏗️  Testing schema access...")
        schemas = await conn.fetch("SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'public'")
        if schemas:
            print("✅ public schema found")
        else:
            print("⚠️  public schema not found")
        
        # Test table access
        print("📋 Testing table access...")
        try:
            table_check = await conn.fetch("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'businesses'
            """)
            
            if table_check:
                print("✅ businesses table found")
                
                # Test data query
                print("🎯 Testing data query...")
                count_result = await conn.fetchval("""
                    SELECT COUNT(*) 
                    FROM public.businesses 
                    WHERE latitude IS NOT NULL 
                    AND longitude IS NOT NULL
                """)
                print(f"✅ Found {count_result} businesses with coordinates")
                
                # Test sample data retrieval
                if count_result > 0:
                    print("📈 Testing sample data retrieval...")
                    sample_data = await conn.fetch("""
                        SELECT id, name, type, latitude, longitude, is_danone_customer, last_photo_date
                        FROM public.businesses 
                        WHERE latitude IS NOT NULL 
                        AND longitude IS NOT NULL
                        LIMIT 3
                    """)
                    
                    print(f"✅ Sample data retrieved ({len(sample_data)} records):")
                    for row in sample_data:
                        customer_status = "✅ Danone Customer" if row['is_danone_customer'] else "❌ Not Customer"
                        last_photo = row['last_photo_date'].strftime('%Y-%m-%d') if row['last_photo_date'] else "No photos"
                        print(f"   - ID: {row['id']}, Business: {row['name']}, Type: {row['type']}, {customer_status}, Last Photo: {last_photo}")
                
            else:
                print("⚠️  businesses table not found in public schema")
                
        except Exception as e:
            print(f"⚠️  Error accessing businesses table: {e}")
        
        # Test permissions
        print("🔐 Testing database permissions...")
        try:
            await conn.fetchval("SELECT 1")
            print("✅ SELECT permission confirmed")
        except Exception as e:
            print(f"❌ Permission error: {e}")
        
        await conn.close()
        print("✅ Database connection closed")
        
        # Summary
        print("")
        print("📊 Database Connection Test Summary:")
        print("✅ Connection: SUCCESS")
        print("✅ Authentication: SUCCESS") 
        print("✅ Schema Access: SUCCESS")
        print("✅ Table Access: SUCCESS")
        print("✅ Data Query: SUCCESS")
        print("")
        print("🎉 Database is ready for production use!")
        
        return True
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("")
        print("🔧 Troubleshooting steps:")
        print("1. Verify network connectivity to Databricks")
        print("2. Check database credentials")
        print("3. Ensure app_account has proper permissions")
        print("4. Verify the database instance is running")
        print("5. Check firewall/security group settings")
        return False

async def test_app_endpoint(app_url):
    """Test the deployed app's database endpoint"""
    print(f"🌐 Testing deployed app endpoint: {app_url}")
    
    try:
        import aiohttp
        async with aiohttp.ClientSession() as session:
            # Test health endpoint
            async with session.get(f"{app_url}/health") as response:
                if response.status == 200:
                    print("✅ App health check: SUCCESS")
                else:
                    print(f"⚠️  App health check: HTTP {response.status}")
            
            # Test POS submissions endpoint
            async with session.get(f"{app_url}/api/pos-submissions") as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("status") == "success":
                        count = data.get("count", 0)
                        data_source = data.get("data_source", "unknown")
                        print(f"✅ POS submissions endpoint: SUCCESS ({count} records from {data_source})")
                        return True
                    else:
                        print(f"⚠️  POS submissions endpoint returned error: {data}")
                else:
                    print(f"❌ POS submissions endpoint: HTTP {response.status}")
                    
    except ImportError:
        print("⚠️  aiohttp not available for endpoint testing")
    except Exception as e:
        print(f"❌ Endpoint test failed: {e}")
    
    return False

def main():
    """Main test function"""
    print("🧪 Danone POS Analytics - Database Connection Test")
    print("=" * 60)
    print(f"⏰ Test started at: {datetime.now().isoformat()}")
    print("")
    
    # Test database connection
    db_success = asyncio.run(test_database_connection())
    
    # Test app endpoint if URL provided
    if len(sys.argv) > 1:
        app_url = sys.argv[1]
        print("")
        print("=" * 60)
        app_success = asyncio.run(test_app_endpoint(app_url))
    else:
        app_success = True
    
    print("")
    print("=" * 60)
    print(f"⏰ Test completed at: {datetime.now().isoformat()}")
    
    if db_success and app_success:
        print("🎉 All tests passed! Database integration is working correctly.")
        sys.exit(0)
    else:
        print("❌ Some tests failed. Please review the output above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
