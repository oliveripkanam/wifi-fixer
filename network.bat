@echo off
echo Running network reset commands...

:: Run each command with admin privileges
netsh winsock reset
netsh int ip reset
ipconfig /release
ipconfig /renew

echo Network reset complete.
pause
