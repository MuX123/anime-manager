# SQL Error 42601 Investigation and Fix Guide

## 🚨 Error Details
```
ERROR: 42601: syntax error at or near "PS" LINE 1: PS D:\cod\server2\CivisOS> opencode ^
```

## 🔍 Root Cause Analysis
This error occurs when PowerShell commands are being executed as SQL. The `PS D:\cod\server2\CivisOS>` is a PowerShell prompt being interpreted by PostgreSQL.

## 🛠️ Common Scenarios & Solutions

### Scenario 1: Script Output Piping to SQL
**Problem**: PowerShell script output being piped to psql or database connection
```bash
# WRONG - This can cause the error
powershell_script | psql database_name
```

**Solution**: Redirect output properly or use proper parameters
```bash
# CORRECT
psql database_name -c "$(powershell_script -query_only)"
```

### Scenario 2: Command Injection in Web App
**Problem**: User input containing PowerShell commands being executed as SQL
```javascript
// VULNERABLE
const query = `SELECT * FROM users WHERE input = '${userInput}'`;
```

**Solution**: Use parameterized queries
```javascript
// SECURE
const query = 'SELECT * FROM users WHERE input = $1';
await client.query(query, [userInput]);
```

### Scenario 3: Database Connection Script Issues
**Problem**: Script mixing PowerShell and SQL execution
```powershell
# PROBLEMATIC
$sql = psql -c "SELECT ..."; $result = powershell $sql
```

**Solution**: Separate execution contexts
```powershell
# CORRECT
$result = psql -c "SELECT ..." -tA
# Process $result separately in PowerShell
```

## 🎯 Specific Fixes for Your Environment

### Fix 1: Check Database Connection Scripts
1. Review any Python scripts that connect to database
2. Look for subprocess calls that might capture PowerShell output
3. Ensure SQL queries are properly formatted

### Fix 2: Examine Web Application Code
1. Check JavaScript files for dynamic SQL construction
2. Verify all user inputs are sanitized
3. Use parameterized queries throughout

### Fix 3: Review Development Workflow
1. Check if any build scripts mix PowerShell and SQL
2. Ensure database migrations run in proper context
3. Verify environment variables don't contain PowerShell prompts

## 🔧 Immediate Actions

### 1. Search for Problematic Code
```bash
# Find files that might have command injection
grep -r "PS \|> \|powershell" --include="*.py" --include="*.js" --include="*.sql"
```

### 2. Check Database Connection Functions
Review these functions in your codebase:
- All `subprocess` calls in Python
- Database connection initialization
- Any dynamic SQL construction

### 3. Test with Isolated Queries
```sql
-- Test basic SQL first
SELECT 1;

-- Then test your actual queries
SELECT COUNT(*) FROM site_visitors;
```

## 📋 Verification Checklist

After applying fixes, verify:

- [ ] No PowerShell prompts in error logs
- [ ] All SQL queries execute without syntax errors  
- [ ] Database connections work properly
- [ ] Web application loads without errors
- [ ] Analytics functions work correctly

## 🆘 If Problem Persists

1. **Check environment variables** - Look for `PS` or prompt variables
2. **Review recent changes** - Identify what introduced the issue
3. **Isolate the source** - Test each component separately
4. **Use proper SQL clients** - Ensure psql/supabase client is used correctly

## 📞 Additional Help

If you need immediate assistance:
1. Check the exact source of the PowerShell command
2. Look for scripts running in `D:\cod\server2\CivisOS\`
3. Verify how `opencode` is being executed

This error is typically a configuration/environment issue rather than a fundamental code problem.