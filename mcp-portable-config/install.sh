#!/bin/bash

##############################################################################
# MCP Configuration Installer
# Sets up MCP servers on a new machine
##############################################################################

set -e  # Exit on error

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║           MCP Configuration Installer                            ║"
echo "║           Setting up 22 MCP servers on new machine              ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Detect OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    OS="windows"
else
    echo -e "${RED}❌ Unsupported OS: $OSTYPE${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Detected OS: $OS${NC}"
echo ""

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found${NC}"
    echo "   Install from: https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm --version)${NC}"

# Check git
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ git not found${NC}"
    echo "   Install git first"
    exit 1
fi
echo -e "${GREEN}✓ git $(git --version)${NC}"

# Check if Claude Code is installed
if [ ! -d "$HOME/.cursor" ]; then
    echo -e "${YELLOW}⚠️  Claude Code directory not found${NC}"
    echo "   Creating ~/.cursor directory..."
    mkdir -p "$HOME/.cursor"
fi
echo -e "${GREEN}✓ Claude Code directory exists${NC}"

echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Check for required files
echo "📦 Checking configuration files..."

if [ ! -f "$SCRIPT_DIR/mcp-config.json" ]; then
    echo -e "${RED}❌ mcp-config.json not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ mcp-config.json${NC}"

if [ ! -f "$SCRIPT_DIR/.env.template" ]; then
    echo -e "${YELLOW}⚠️  .env.template not found${NC}"
else
    echo -e "${GREEN}✓ .env.template${NC}"
fi

echo ""

# Setup credentials
echo "🔐 Setting up credentials..."

if [ ! -f "$SCRIPT_DIR/.env" ]; then
    if [ -f "$SCRIPT_DIR/.env.template" ]; then
        echo -e "${YELLOW}⚠️  .env file not found${NC}"
        echo "   Copying .env.template to .env..."
        cp "$SCRIPT_DIR/.env.template" "$SCRIPT_DIR/.env"
        echo ""
        echo -e "${YELLOW}   📝 Edit $SCRIPT_DIR/.env with your API keys${NC}"
        echo "   📖 See credentials.md for where to get each key"
        echo ""
        read -p "Press Enter when you've filled in .env (or continue with placeholders)..."
    else
        echo -e "${RED}❌ No .env or .env.template file found${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ .env file exists${NC}"
fi

echo ""

# Install MCP configuration
echo "⚙️  Installing MCP configuration..."

MCP_CONFIG_PATH="$HOME/.cursor/mcp.json"

# Backup existing config
if [ -f "$MCP_CONFIG_PATH" ]; then
    BACKUP_PATH="$MCP_CONFIG_PATH.backup.$(date +%Y%m%d-%H%M%S)"
    echo "   Backing up existing config to: $BACKUP_PATH"
    cp "$MCP_CONFIG_PATH" "$BACKUP_PATH"
fi

# Copy new config
echo "   Installing new MCP configuration..."
cp "$SCRIPT_DIR/mcp-config.json" "$MCP_CONFIG_PATH"

echo -e "${GREEN}✅ MCP configuration installed${NC}"
echo ""

# Setup project sync (optional)
echo "🔗 Project Integration (optional)"
read -p "Do you want to integrate with a project? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter project directory path: " PROJECT_DIR

    if [ -d "$PROJECT_DIR" ]; then
        # Create symlink to portable config
        if [ -d "$PROJECT_DIR/mcp-portable-config" ]; then
            echo "   Removing existing mcp-portable-config..."
            rm -rf "$PROJECT_DIR/mcp-portable-config"
        fi

        echo "   Creating symlink..."
        ln -s "$SCRIPT_DIR" "$PROJECT_DIR/mcp-portable-config"

        echo -e "${GREEN}✓ Project integrated${NC}"
    else
        echo -e "${RED}❌ Project directory not found${NC}"
    fi
fi

echo ""

# Summary
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                    Installation Complete                         ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}✅ MCP configuration installed to: $MCP_CONFIG_PATH${NC}"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. ${BLUE}Fill in credentials${NC}"
echo "   Edit: $SCRIPT_DIR/.env"
echo "   See: $SCRIPT_DIR/credentials.md for API key sources"
echo ""
echo "2. ${BLUE}Choose a profile${NC}"
echo "   Minimal (3 servers):  node scripts/mcp-manager.js profile minimal"
echo "   Dev (7 servers):      node scripts/mcp-manager.js profile dev"
echo "   Full (22 servers):    node scripts/mcp-manager.js profile full"
echo ""
echo "3. ${BLUE}Restart Claude Code${NC}"
echo "   Close and reopen Claude Code to load MCP servers"
echo ""
echo "4. ${BLUE}Verify installation${NC}"
echo "   Check Claude Code Output → Model Context Protocol"
echo ""
echo "📚 Documentation:"
echo "   - README: $SCRIPT_DIR/README.md"
echo "   - Credentials: $SCRIPT_DIR/credentials.md"
echo ""
echo "🎉 Happy coding!"
echo ""
