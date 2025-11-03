@echo off
REM setup-dual-push.bat
REM Run this script on each new Windows device to configure dual-push remotes

echo Setting up dual-push configuration...

REM Add both push URLs to origin
git remote set-url --add --push origin https://github.com/TechIntegrationLabs/disruptors-ai-marketing-hub.git
git remote set-url --add --push origin https://github.com/DisruptorsAI/disruptors-ai-marketing-hub.git

REM Verify configuration
echo.
echo Configuration complete! Current remotes:
git remote -v

echo.
echo Test with: git push origin [branch-name]
echo    This will push to BOTH repositories
