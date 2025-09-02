# 🔍 Databricks Apps 403 Error Troubleshooting Guide

**Deployment ID**: `01f084ed3bb512d7846d6bfeb69e9537`  
**Status**: Successfully deployed with enhanced diagnostics

## 🎯 Quick Diagnostic Steps

### Step 1: Run Comprehensive Diagnostics
Access these endpoints in your Databricks App to identify the root cause:

```
GET <your-app-url>/health/claude
GET <your-app-url>/diagnostic/oauth-test
```

### Step 2: Check Authentication Flow
The diagnostic endpoints will show:
- ✅ **Authentication flow type** (User OBO vs Service Principal)
- ✅ **Token presence and format**
- ✅ **OAuth scope analysis**
- ✅ **Specific 403 error details**

## 📋 Databricks Recommended Troubleshooting Steps

### 🔐 **Step 1: Triple-check Authentication Flow and Identity**

**What to check:**
- Is your app using **service principal token** or **x-forwarded-access-token**?
- If using OBO, does the current user have **'Can Query'** on the endpoint?

**How to verify:**
1. Access `/diagnostic/oauth-test` endpoint
2. Look for `authentication_analysis.flow_type`
3. Check `claude_test.status` for each flow

**Expected results:**
- **User OBO flow**: `"flow_type": "user_obo"`
- **Service Principal flow**: `"flow_type": "service_principal"`

### 🔑 **Step 2: Validate OAuth Scopes**

**Required scopes:**
- `serving.serving-endpoints` OR `all-apis`

**What to check:**
1. **Databricks Workspace** → **Apps** → **danone-pos-analytics** → **OAuth Configuration**
2. Look for scopes in app integration settings
3. **Critical**: If you updated scopes after app creation → **restart app** and **clear browser cache**

**Actions if scopes are missing:**
```bash
# Re-deploy with updated OAuth configuration
./deploy.sh

# Clear browser cache and cookies
# Open app in new incognito session
```

### 🔄 **Step 3: Check Behavior Using Both Auth Flows**

**Test methodology:**
1. Access `/diagnostic/oauth-test` endpoint
2. Compare results for `user_obo_flow` vs `service_principal_flow`
3. Identify which authentication method is failing

**Interpretation:**
- **Both fail**: OAuth scope issue
- **Only User OBO fails**: User permission issue  
- **Only Service Principal fails**: Service principal permission issue

### 📊 **Step 4: Look at Workspace/Endpoint Logs**

**Where to check:**
1. **Databricks Workspace** → **Admin Console** → **Audit Logs**
2. Filter for events:
   - `"apps"` events
   - `"serverlessRealTimeInference"` events
3. Look for **HTTP 403** responses

**What to look for:**
```json
{
  "event": "serverlessRealTimeInference",
  "principal": "user@company.com OR service-principal-id",
  "endpoint": "databricks-claude-3-7-sonnet",
  "response_code": 403
}
```

### 🆕 **Step 5: Try from Another App**

**Test approach:**
1. Create a minimal test app with same OAuth configuration
2. Test Claude endpoint access
3. Compare results with current app

**If new app works:**
- **Issue**: Stale configuration in original app
- **Solution**: Re-deploy or recreate original app

### 🔄 **Step 6: Confirm No Stale Permissions**

**Actions to take:**
1. **Admin re-consent**: If scopes/permissions were changed
2. **Force user re-login**: Clear all session data
3. **Re-deploy app**: Ensure new auth token is minted

**Commands:**
```bash
# Force complete re-deployment
./deploy.sh

# User actions:
# - Clear browser cache and cookies
# - Log out and log back into Databricks
# - Access app in new incognito session
```

## 🛠️ **Enhanced Error Diagnostics**

### **Detailed 403 Error Analysis**

When you encounter a 403 error, the diagnostic endpoints now provide:

```json
{
  "error": {
    "status_code": 403,
    "databricks_403_analysis": {
      "likely_causes": [
        "Missing 'serving.serving-endpoints' or 'all-apis' OAuth scope",
        "User token lacks 'Can Query' permission on Claude endpoint",
        "Stale OAuth scopes - app needs restart and user re-consent",
        "Service principal lacks proper endpoint permissions"
      ],
      "immediate_actions": [
        "Check app OAuth configuration in Databricks workspace",
        "Verify user has 'Can Query' access to databricks-claude-3-7-sonnet endpoint", 
        "Try restarting app and clearing browser cache/cookies",
        "Test with different user or service principal"
      ]
    }
  }
}
```

### **Authentication Flow Detection**

The system automatically detects and tests:

1. **User OBO (On-Behalf-Of)**
   - Uses `x-forwarded-access-token` header
   - Requires user to have endpoint permissions
   - Most common for user-facing apps

2. **Service Principal**
   - Uses `Authorization: Bearer` header
   - Requires service principal to have endpoint permissions
   - Used for backend/automated apps

## 🚀 **Step-by-Step Resolution Process**

### **Immediate Actions** (Do These First)

1. **Access diagnostic endpoints**:
   ```
   GET <your-app-url>/diagnostic/oauth-test
   GET <your-app-url>/health/claude
   ```

2. **Check OAuth configuration**:
   - Databricks Workspace → Apps → danone-pos-analytics → OAuth settings
   - Verify `serving.serving-endpoints` or `all-apis` scope is present

3. **Verify endpoint permissions**:
   - Databricks Workspace → Serving → databricks-claude-3-7-sonnet
   - Check 'Can Query' permission for your user/service principal

### **If Immediate Actions Don't Work**

4. **Force complete refresh**:
   ```bash
   ./deploy.sh  # Re-deploy app
   ```
   - Clear browser cache and cookies
   - Open app in new incognito session

5. **Check audit logs**:
   - Admin Console → Audit Logs
   - Filter for `serverlessRealTimeInference` events
   - Look for 403 responses with your principal

6. **Test with minimal app**:
   - Create new test app with same configuration
   - Compare Claude endpoint access results

### **Advanced Troubleshooting**

7. **Service Principal vs User OBO**:
   - Compare diagnostic results for both authentication flows
   - Focus on the flow that's actually being used

8. **Scope propagation issues**:
   - If scopes were updated after app creation
   - May require admin re-consent and user re-login

## 📞 **Escalation Path**

If all troubleshooting steps fail:

### **Gather Information**
- Diagnostic endpoint results (`/health/claude`, `/diagnostic/oauth-test`)
- Audit log entries showing 403 responses
- OAuth configuration screenshots
- Current user/service principal permissions

### **Open Engineering Ticket**
Include in ticket:
- **Principal identity** (user email or service principal ID)
- **Token scopes** from diagnostic results
- **Audit log output** for failed requests
- **App configuration** details
- **Timeline** of when issue started

## 🎯 **Success Indicators**

You'll know the issue is resolved when:

✅ `/health/claude` returns `"status": "success"`  
✅ `/diagnostic/oauth-test` shows successful Claude tests  
✅ Application displays AI recommendations instead of errors  
✅ No 403 errors in application logs  

---

**Your enhanced Danone POS Analytics app now provides comprehensive diagnostics to quickly identify and resolve 403 authentication issues!** 🚀

