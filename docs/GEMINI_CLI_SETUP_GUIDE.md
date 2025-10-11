# Gemini CLI Setup Guide

This guide shows you how to set up and use the Google Gemini CLI tool that's now installed in your project.

## ✅ Installation Status

The Gemini CLI is already installed globally on your system:
- **Package**: `@google/gemini-cli@0.8.2`
- **Installation**: Global (accessible from any directory)
- **Command**: `npx @google/gemini-cli` or `gemini` (if PATH is configured)

## 🔑 API Key Setup

### 1. Get Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy the key for configuration

### 2. Set Environment Variable

**Windows PowerShell:**
```powershell
$env:GEMINI_API_KEY = "your_actual_api_key_here"
```

**Windows Command Prompt:**
```cmd
set GEMINI_API_KEY=your_actual_api_key_here
```

**Permanent Setup (Windows):**
1. Open System Properties → Environment Variables
2. Add new user variable:
   - Name: `GEMINI_API_KEY`
   - Value: `your_actual_api_key_here`

**macOS/Linux:**
```bash
export GEMINI_API_KEY="your_actual_api_key_here"
```

## 🚀 Usage Examples

### Basic Interactive Mode
```bash
npx @google/gemini-cli
```
This launches an interactive CLI where you can chat with Gemini.

### One-Shot Prompts
```bash
npx @google/gemini-cli "Write a Python function to calculate fibonacci numbers"
```

### Interactive with Initial Prompt
```bash
npx @google/gemini-cli -i "Help me debug this JavaScript code"
```

### Using with Your Project
```bash
# From your project directory
npx @google/gemini-cli "Review my React components and suggest improvements"
```

## 🛠️ Advanced Features

### MCP (Model Context Protocol) Servers
```bash
npx @google/gemini-cli mcp
```
Manage MCP servers for enhanced capabilities.

### Extensions Management
```bash
npx @google/gemini-cli extensions list
npx @google/gemini-cli extensions install <extension-name>
```

### YOLO Mode (Auto-approve all actions)
```bash
npx @google/gemini-cli -y "Refactor my code"
```
⚠️ Use with caution - automatically approves all file modifications.

### Debug Mode
```bash
npx @google/gemini-cli -d "Debug this issue"
```

### Specific Model Selection
```bash
npx @google/gemini-cli -m "gemini-2.0-flash-exp" "Generate code for a REST API"
```

## 📁 Project Integration

### Using with Your Current Project

Since your project already has Gemini integration in the codebase, you can use the CLI to:

1. **Code Review**: Review your existing Gemini integration code
2. **Debugging**: Help debug API issues or integration problems
3. **Enhancement**: Suggest improvements to your AI orchestrator
4. **Documentation**: Generate documentation for your Gemini features

### Example Commands for Your Project

```bash
# Review your AI orchestrator
npx @google/gemini-cli "Review the code in src/lib/ai-orchestrator.js and suggest improvements"

# Debug image generation
npx @google/gemini-cli "Help me debug the Gemini image generation in src/lib/gemini-image.js"

# Generate tests
npx @google/gemini-cli "Create comprehensive tests for the Gemini integration in this project"

# Code optimization
npx @google/gemini-cli "Optimize the cost calculation functions in the AI orchestrator"
```

## 🔧 Configuration

### Settings File
The CLI uses a settings file for configuration. It's typically located at:
- **Windows**: `%APPDATA%\gemini\settings.json`
- **macOS**: `~/Library/Application Support/gemini/settings.json`
- **Linux**: `~/.config/gemini/settings.json`

### Key Settings
```json
{
  "telemetry": {
    "enabled": false,
    "target": "local"
  },
  "general": {
    "checkpointing": {
      "enabled": true
    }
  },
  "ui": {
    "showMemoryUsage": true
  },
  "approval": {
    "mode": "default"
  }
}
```

## 🚨 Troubleshooting

### Common Issues

#### "Command not found"
```bash
# Use npx instead of direct command
npx @google/gemini-cli --version
```

#### "API Key not found"
```bash
# Check if environment variable is set
echo $env:GEMINI_API_KEY  # Windows PowerShell
echo $GEMINI_API_KEY      # Linux/macOS
```

#### "Authentication failed"
- Verify your API key is correct
- Check if you have sufficient quota
- Ensure the key has proper permissions

#### "Rate limit exceeded"
- Wait for quota reset (usually daily)
- Consider upgrading to paid tier
- Use different API keys for different projects

### Debug Information
```bash
npx @google/gemini-cli -d --help
```

## 📊 Available Models

The CLI supports various Gemini models:
- `gemini-2.0-flash-exp` - Latest experimental model
- `gemini-1.5-pro` - High-quality responses
- `gemini-1.5-flash` - Fast responses
- `gemini-1.0-pro` - Standard model

## 🔗 Integration with Your Existing Setup

Your project already has:
- ✅ Gemini API integration (`@google/genai`, `@google/generative-ai`)
- ✅ AI orchestrator with Gemini support
- ✅ Image generation with Nano Banana model
- ✅ Comprehensive testing suite

The CLI adds:
- ✅ Interactive coding assistance
- ✅ File editing capabilities
- ✅ MCP server management
- ✅ Extension system
- ✅ Advanced debugging tools

## 🎯 Next Steps

1. **Set up your API key** using the environment variable method above
2. **Test basic functionality** with a simple prompt
3. **Explore your codebase** using the CLI to review your Gemini integration
4. **Set up MCP servers** for enhanced capabilities
5. **Configure extensions** for your specific use cases

## 📚 Additional Resources

- [Official Gemini CLI Documentation](https://developers.google.com/gemini-code-assist/docs/gemini-cli)
- [Google AI Studio](https://aistudio.google.com/)
- [Gemini API Documentation](https://ai.google.dev/gemini-api)
- [MCP Protocol Documentation](https://modelcontextprotocol.io/)

---

**Note**: The CLI is now installed and ready to use. Just add your API key and you can start using Gemini directly from your terminal!
