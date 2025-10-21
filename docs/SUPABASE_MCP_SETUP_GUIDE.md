# Supabase MCP Server Setup Guide - Disruptors AI Marketing Hub

## Overview

This guide provides setup instructions for the Supabase MCP Server specifically configured for the Disruptors AI Marketing Hub project. The server is already configured and ready to use with your existing Supabase project (`ubqxflzuvxowigbjmqfb`).

## Prerequisites

- Node.js (LTS version or newer)
- Supabase account
- MCP-compatible client (Cursor, Claude, etc.)
- Supabase project with API access

## Step 1: Create Supabase Personal Access Token

1. **Navigate to Supabase Dashboard**
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Sign in to your account

2. **Access Token Settings**
   - Click on your profile icon (top right)
   - Select "Account Settings"
   - Navigate to "Access Tokens" tab

3. **Create New Token**
   - Click "Generate new token"
   - Enter a descriptive name: "MCP Server Access"
   - Select appropriate scopes:
     - ✅ Read access to projects
     - ✅ Write access to projects (if needed)
     - ✅ Access to organizations
   - Click "Generate token"

4. **Save the Token**
   - Copy the token immediately (you won't see it again)
   - Store it securely (password manager recommended)

## Step 2: Get Your Project Reference

1. **Navigate to Your Project**
   - Go to your Supabase project dashboard
   - Click on "Settings" in the left sidebar
   - Select "General"

2. **Find Project Reference**
   - Look for "Project ID" or "Reference ID"
   - Copy this value (format: `xxxxxxxxxxxxxxxxx`)

## Step 3: Configure MCP Client

### For Cursor IDE (Already Configured)

Your Cursor IDE is already configured with the Supabase MCP server. The configuration is located at:
`C:\Users\Will\.cursor\mcp.json`

```json
{
  "supabase": {
    "command": "npx",
    "args": [
      "-y",
      "@supabase/mcp-server-supabase@latest",
      "--project-ref=ubqxflzuvxowigbjmqfb"
    ],
    "env": {
      "SUPABASE_ACCESS_TOKEN": "sbp_56a2e431ef624e18a3e8abd072c339b3f5550596"
    }
  }
}
```

**Project Details:**
- Project Reference: `ubqxflzuvxowigbjmqfb`
- Project URL: `https://ubqxflzuvxowigbjmqfb.supabase.co`
- Access Token: Already configured

### For Claude Desktop

1. **Open Claude Desktop**
   - Go to "Settings" → "MCP Servers"

2. **Add New Server**
   - Click "Add Server"
   - Enter server name: "supabase"
   - Configure as shown above

### For Windsurf

1. **Open Windsurf Settings**
   - Go to "Preferences" → "MCP"

2. **Add Supabase Server**
   - Use the same configuration as above

## Step 4: Configuration Options

### Basic Configuration (Recommended)
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--read-only",
        "--project-ref=YOUR_PROJECT_REF"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "YOUR_ACCESS_TOKEN"
      }
    }
  }
}
```

### Advanced Configuration
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--read-only",
        "--project-ref=YOUR_PROJECT_REF",
        "--features=database,docs,debugging,development"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "YOUR_ACCESS_TOKEN"
      }
    }
  }
}
```

### Windows Configuration
For Windows users, use this configuration:
```json
{
  "mcpServers": {
    "supabase": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--read-only",
        "--project-ref=YOUR_PROJECT_REF"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "YOUR_ACCESS_TOKEN"
      }
    }
  }
}
```

## Step 5: Feature Groups Configuration

### Available Feature Groups

| Group | Description | Default |
|-------|-------------|---------|
| `account` | Project and organization management | ✅ |
| `database` | Database operations and queries | ✅ |
| `debugging` | Logs and performance monitoring | ✅ |
| `development` | API keys and TypeScript generation | ✅ |
| `docs` | Documentation search | ✅ |
| `functions` | Edge Functions management | ✅ |
| `storage` | File storage operations | ❌ |
| `branching` | Development branches (paid plans) | ✅ |

### Custom Feature Selection
```bash
--features=database,docs,debugging
```

## Step 6: Security Configuration

### Read-Only Mode (Recommended)
```bash
--read-only
```
- Prevents accidental data modification
- Executes queries as read-only Postgres user
- Disables destructive operations

### Project Scoping
```bash
--project-ref=YOUR_PROJECT_REF
```
- Limits access to specific project
- Prevents access to other projects in your account
- Recommended for production use

### Feature Restrictions
```bash
--features=database,docs
```
- Enables only necessary tools
- Reduces attack surface
- Customizes available functionality

## Step 7: Testing the Setup

### Test Script
Create a test file `test-supabase-mcp.js`:

```javascript
import { spawn } from 'child_process';

console.log('🧪 Testing Supabase MCP Server...');

const testServer = () => {
  return new Promise((resolve, reject) => {
    const server = spawn('npx', [
      '-y',
      '@supabase/mcp-server-supabase@latest',
      '--project-ref=YOUR_PROJECT_REF',
      '--read-only'
    ], {
      env: {
        ...process.env,
        SUPABASE_ACCESS_TOKEN: 'YOUR_ACCESS_TOKEN'
      },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let errorOutput = '';

    server.stdout.on('data', (data) => {
      output += data.toString();
    });

    server.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    // Test MCP initialization
    const testRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'test-client',
          version: '1.0.0'
        }
      }
    };

    setTimeout(() => {
      server.stdin.write(JSON.stringify(testRequest) + '\n');
    }, 1000);

    setTimeout(() => {
      server.kill();
      resolve({
        success: true,
        output: output,
        error: errorOutput
      });
    }, 3000);

    server.on('error', (error) => {
      reject({
        success: false,
        error: error.message
      });
    });
  });
};

// Run test
testServer()
  .then(result => {
    if (result.success) {
      console.log('✅ Supabase MCP Server is working!');
    } else {
      console.log('❌ Server test failed:', result.error);
    }
  })
  .catch(error => {
    console.log('❌ Test failed:', error.message);
  });
```

### Run the Test
```bash
node test-supabase-mcp.js
```

## Step 8: Usage Examples

### Database Operations
```
"Show me all tables in my database"
"Generate TypeScript types for my schema"
"Check the logs for my API service"
```

### Project Management
```
"List all my Supabase projects"
"Get details for my current project"
"Show me the API URL and keys"
```

### Development Workflow
```
"Deploy a new Edge Function"
"Create a database migration"
"Search the Supabase documentation for RLS setup"
```

## Troubleshooting

### Common Issues

#### Server Not Starting
- **Issue**: MCP server fails to start
- **Solution**: 
  - Verify Node.js is installed: `node -v`
  - Check access token is valid
  - Ensure project reference is correct

#### Permission Errors
- **Issue**: "Access denied" or "Unauthorized"
- **Solution**:
  - Verify access token has necessary permissions
  - Check project reference exists
  - Ensure you're not in read-only mode for write operations

#### Windows Compatibility
- **Issue**: Server doesn't work on Windows
- **Solution**:
  - Use `cmd /c` prefix in configuration
  - Ensure Node.js is in system PATH
  - Consider using WSL for better compatibility

#### Connection Timeouts
- **Issue**: Server times out or doesn't respond
- **Solution**:
  - Check internet connection
  - Verify Supabase service status
  - Try with different project reference

### Debug Mode
Enable debug logging:
```bash
DEBUG=supabase-mcp npx @supabase/mcp-server-supabase@latest
```

### Log Files
Check MCP client logs for detailed error information:
- **Cursor**: Check Developer Console
- **Claude**: Check application logs
- **Windsurf**: Check MCP server logs

## Best Practices

### Security
1. **Use Read-Only Mode**: Enable `--read-only` for production
2. **Project Scoping**: Limit access to specific projects
3. **Feature Groups**: Enable only necessary tools
4. **Token Management**: Store tokens securely
5. **Regular Rotation**: Rotate access tokens periodically

### Development
1. **Development Projects**: Use separate projects for testing
2. **Branching**: Use Supabase branching for safe development
3. **Backup**: Regular database backups before major changes
4. **Monitoring**: Monitor logs and performance metrics

### Performance
1. **Connection Pooling**: Optimize database connections
2. **Query Optimization**: Use efficient SQL queries
3. **Caching**: Implement appropriate caching strategies
4. **Rate Limiting**: Respect API rate limits

## Integration Examples

### With Cursor IDE
```javascript
// Ask Cursor: "Show me my database schema"
// The AI will use the Supabase MCP server to:
// 1. Connect to your project
// 2. List all tables
// 3. Display schema information
// 4. Generate TypeScript types if requested
```

### With Claude Desktop
```
User: "Help me set up Row Level Security for my users table"
Claude: I'll help you set up RLS. Let me first check your current database schema and then provide the appropriate RLS policies.
```

### With Windsurf
```
User: "Deploy a new Edge Function for user authentication"
Windsurf: I'll help you create and deploy an Edge Function. Let me first check your existing functions and then create the new one.
```

## Support and Resources

### Documentation
- [Supabase MCP Server Docs](https://github.com/supabase-community/supabase-mcp)
- [Model Context Protocol](https://modelcontextprotocol.io/introduction)
- [Supabase Documentation](https://supabase.com/docs)

### Community
- [GitHub Issues](https://github.com/supabase-community/supabase-mcp/issues)
- [Supabase Discord](https://discord.supabase.com)
- [MCP Community](https://modelcontextprotocol.io/community)

### Professional Support
- [Supabase Support](https://supabase.com/support)
- [Enterprise Support](https://supabase.com/enterprise)

## Next Steps

1. **Explore Features**: Try different MCP server capabilities
2. **Integrate Workflows**: Combine with other MCP servers
3. **Customize Configuration**: Adjust settings for your needs
4. **Monitor Usage**: Track API usage and performance
5. **Scale Up**: Consider paid plans for advanced features

---

**Note**: This setup guide is designed for the Disruptors AI Marketing Hub project. Adjust configurations as needed for your specific use case.




















