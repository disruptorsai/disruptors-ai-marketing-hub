# Supabase MCP Server Documentation

## Overview

The Supabase MCP Server connects your Supabase projects to AI assistants like Cursor, Claude, and Windsurf through the Model Context Protocol (MCP). It provides a standardized way for Large Language Models to interact with Supabase services, enabling tasks like database management, project configuration, and data querying.

## Features

### Core Capabilities
- **Database Operations**: Query and manage database tables, schemas, and migrations
- **Project Management**: Create, configure, and manage Supabase projects
- **Edge Functions**: Deploy and manage serverless functions
- **Storage Management**: Handle file storage and bucket operations
- **Documentation Search**: Access up-to-date Supabase documentation
- **Debugging Tools**: Monitor logs and performance metrics
- **Branching Support**: Development branch management (paid plans)

### Security Features
- **Read-only Mode**: Restrict operations to read-only queries
- **Project Scoping**: Limit access to specific projects
- **Feature Groups**: Enable/disable specific tool categories
- **Access Token Authentication**: Secure API access

## Installation & Setup

### Prerequisites
- Node.js (LTS version or newer)
- Supabase account with personal access token
- MCP-compatible client (Cursor, Claude, etc.)

### 1. Create Personal Access Token
1. Go to [Supabase Settings](https://supabase.com/dashboard/account/tokens)
2. Create a new personal access token
3. Give it a descriptive name (e.g., "Cursor MCP Server")
4. Copy the token (you won't see it again)

### 2. Configure MCP Client
Add the following configuration to your MCP client:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--read-only",
        "--project-ref=<your-project-ref>"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "<your-personal-access-token>"
      }
    }
  }
}
```

### 3. Configuration Options

#### Project Scoping
```bash
--project-ref=<project-id>
```
Limits server access to a specific Supabase project. Find your project ID in the project settings.

#### Read-only Mode
```bash
--read-only
```
Restricts all database operations to read-only queries. **Recommended for production use.**

#### Feature Groups
```bash
--features=database,docs,debugging
```
Available groups: `account`, `database`, `debugging`, `development`, `docs`, `functions`, `storage`, `branching`

#### Windows Configuration
For Windows users, prefix the command with `cmd /c`:

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
        "--project-ref=<project-ref>"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "<personal-access-token>"
      }
    }
  }
}
```

## Available Tools

### Account Management
- `list_projects`: List all Supabase projects
- `get_project`: Get project details
- `create_project`: Create new project
- `pause_project`: Pause project
- `restore_project`: Restore paused project
- `list_organizations`: List user organizations
- `get_organization`: Get organization details

### Database Operations
- `list_tables`: List database tables
- `list_extensions`: List database extensions
- `list_migrations`: List database migrations
- `apply_migration`: Apply SQL migrations
- `execute_sql`: Execute raw SQL queries

### Development Tools
- `get_project_url`: Get project API URL
- `get_anon_key`: Get anonymous API key
- `generate_typescript_types`: Generate TypeScript types from schema

### Edge Functions
- `list_edge_functions`: List all Edge Functions
- `get_edge_function`: Get Edge Function contents
- `deploy_edge_function`: Deploy new Edge Function

### Storage Management
- `list_storage_buckets`: List storage buckets
- `get_storage_config`: Get storage configuration
- `update_storage_config`: Update storage settings

### Debugging & Monitoring
- `get_logs`: Get service logs (API, Postgres, Edge Functions, Auth, Storage, Realtime)
- `get_advisors`: Get security and performance advisories

### Documentation
- `search_docs`: Search Supabase documentation for up-to-date information

### Branching (Experimental, Paid Plans)
- `create_branch`: Create development branch
- `list_branches`: List development branches
- `delete_branch`: Delete development branch
- `merge_branch`: Merge branch to production
- `reset_branch`: Reset branch migrations
- `rebase_branch`: Rebase branch on production

## Security Best Practices

### Risk Mitigation
1. **Use Development Projects**: Never connect to production data
2. **Enable Read-only Mode**: Prevents accidental data modification
3. **Project Scoping**: Limit access to specific projects
4. **Feature Groups**: Enable only necessary tools
5. **Review Tool Calls**: Always review MCP client tool calls before execution

### Prompt Injection Protection
The server includes built-in protections against prompt injection attacks:
- SQL results are wrapped with security instructions
- Manual approval required for all tool calls
- Read-only mode prevents destructive operations

### Recommended Configuration
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--read-only",
        "--project-ref=<dev-project-ref>",
        "--features=database,docs,debugging"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "<your-token>"
      }
    }
  }
}
```

## Usage Examples

### Database Query
```
"Show me all tables in my database"
```
The AI will use `list_tables` to show your database schema.

### Schema Analysis
```
"Generate TypeScript types for my database schema"
```
The AI will use `generate_typescript_types` to create type definitions.

### Debugging
```
"Check the logs for my API service"
```
The AI will use `get_logs` to retrieve and analyze service logs.

### Documentation Search
```
"How do I set up Row Level Security?"
```
The AI will use `search_docs` to find relevant documentation.

## Troubleshooting

### Common Issues

#### Server Not Starting
- Verify Node.js is installed and in PATH
- Check that the access token is valid
- Ensure project reference is correct

#### Permission Errors
- Verify your access token has necessary permissions
- Check that the project reference exists
- Ensure you're not in read-only mode for write operations

#### Windows Issues
- Use `cmd /c` prefix for Windows
- Ensure Node.js is in system PATH
- Consider using WSL for better compatibility

### Debug Mode
Enable debug logging by setting:
```bash
DEBUG=supabase-mcp
```

## Integration with Other Tools

### With Cursor
The Supabase MCP server integrates seamlessly with Cursor's AI features, allowing you to:
- Query your database through natural language
- Generate code based on your schema
- Debug issues with real-time log access

### With Claude
Claude can use the Supabase MCP server to:
- Analyze your database structure
- Help with schema design
- Provide documentation and best practices

### With Other MCP Servers
The Supabase MCP server works alongside other MCP servers:
- **GitHub MCP**: Version control your database migrations
- **Filesystem MCP**: Manage local development files
- **Memory MCP**: Remember database patterns and preferences

## Development & Contributing

### Local Development
```bash
git clone https://github.com/supabase-community/supabase-mcp.git
cd supabase-mcp
npm install
npm run build
```

### Testing
```bash
npm test
npm run test:coverage
```

### Contributing
See [CONTRIBUTING.md](https://github.com/supabase-community/supabase-mcp/blob/main/CONTRIBUTING.md) for development guidelines.

## Resources

- [Model Context Protocol](https://modelcontextprotocol.io/introduction)
- [Supabase Documentation](https://supabase.com/docs)
- [MCP Registry](https://mcp.reg.dev)
- [GitHub Repository](https://github.com/supabase-community/supabase-mcp)

## License

This project is licensed under Apache 2.0. See the [LICENSE](https://github.com/supabase-community/supabase-mcp/blob/main/LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/supabase-community/supabase-mcp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/supabase-community/supabase-mcp/discussions)
- **Documentation**: [Supabase Docs](https://supabase.com/docs)












