# Claude Code CLI Setup Script for Windows
# This script sets up the Claude Code CLI tool properly on Windows

Write-Host "🔧 Setting up Claude Code CLI tool..." -ForegroundColor Cyan

# Add Claude Code to PATH permanently
$claudePath = "$env:USERPROFILE\.local\bin"
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")

if ($currentPath -notlike "*$claudePath*") {
    Write-Host "Adding Claude Code to PATH..." -ForegroundColor Yellow
    [Environment]::SetEnvironmentVariable("PATH", "$currentPath;$claudePath", "User")
    $env:PATH += ";$claudePath"
    Write-Host "✅ Claude Code added to PATH" -ForegroundColor Green
} else {
    Write-Host "✅ Claude Code already in PATH" -ForegroundColor Green
}

# Verify installation
try {
    $version = & claude --version 2>$null
    Write-Host "✅ Claude Code CLI installed: $version" -ForegroundColor Green
} catch {
    Write-Host "❌ Claude Code CLI not found. Please run: npx @anthropic-ai/claude-code install" -ForegroundColor Red
    exit 1
}

# Check if authentication is needed
Write-Host "`n🔐 Authentication Status:" -ForegroundColor Cyan
try {
    & claude mcp list 2>$null | Out-Null
    Write-Host "✅ Authentication configured" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Authentication required. Run: claude setup-token" -ForegroundColor Yellow
}

Write-Host "`n🚀 Claude Code CLI is ready!" -ForegroundColor Green
Write-Host "Available commands:" -ForegroundColor Cyan
Write-Host "  claude                    - Start interactive session" -ForegroundColor White
Write-Host "  claude --help            - Show help" -ForegroundColor White
Write-Host "  claude setup-token       - Set up authentication" -ForegroundColor White
Write-Host "  claude mcp list          - List MCP servers" -ForegroundColor White
Write-Host "  claude --mcp-config mcp-claude.json - Use with MCP servers" -ForegroundColor White

Write-Host "`n📚 Next steps:" -ForegroundColor Cyan
Write-Host "1. Run 'claude setup-token' to authenticate" -ForegroundColor White
Write-Host "2. Run 'claude' to start an interactive session" -ForegroundColor White
Write-Host "3. Use 'claude --mcp-config mcp-claude.json' for MCP integration" -ForegroundColor White
