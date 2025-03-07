/**
 * Fix script-related functions for the WiFi Diagnostics Tool
 */

// Function to download a fix script
function downloadFixScript() {
    // Get the detected issues from results
    const issues = getDetectedIssues();
    
    // Create the batch file content with targeted fixes
    const batchContent = generateFixScriptContent(issues);
    
    // Create a Blob with the batch file content
    const blob = new Blob([batchContent], { type: 'application/bat' });
    
    // Create a download link
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = 'network-fix.bat';
    
    // Trigger the download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

// Function to get detected issues from the test results
function getDetectedIssues() {
    const issues = [];
    const resultItems = document.querySelectorAll('.result-item.warning, .result-item.bad');
    
    resultItems.forEach(item => {
        const text = item.textContent;
        if (text.includes('Ping') || text.includes('Latency')) issues.push('high_latency');
        if (text.includes('Download Speed')) issues.push('slow_download');
        if (text.includes('Upload Speed')) issues.push('slow_upload');
        if (text.includes('Connection Stability')) issues.push('unstable_connection');
        if (text.includes('DNS')) issues.push('dns_issues');
        if (text.includes('Packet Loss')) issues.push('packet_loss');
    });
    
    return issues;
}

// Function to generate fix script content based on detected issues
function generateFixScriptContent(issues) {
    let content = `@echo off
echo WiFi Diagnostics Fix Script
echo Generated on: %date% %time%
echo.

echo Checking for administrator privileges...
net session >nul 2>&1
if %errorLevel% neq 0 (
  echo Error: This script requires administrator privileges.
  echo Please right-click and select 'Run as administrator'.
  pause
  exit /b 1
)

`;
    
    // Add commands for specific issues
    if (issues.includes('dns_issues')) {
        content += `
echo Fixing DNS issues...
ipconfig /flushdns
echo Setting DNS to Google DNS...
netsh interface ip set dns "Wi-Fi" static 8.8.8.8
netsh interface ip add dns "Wi-Fi" 8.8.4.4 index=2
echo.
`;
    }
    
    if (issues.includes('packet_loss')) {
        content += `
echo Fixing packet loss issues...
netsh winsock reset
echo.
`;
    }
    
    if (issues.includes('high_latency')) {
        content += `
echo Fixing high latency issues...
netsh int tcp set global autotuninglevel=normal
netsh int tcp set global chimney=enabled
netsh int tcp set global ecncapability=enabled
echo.
`;
    }
    
    if (issues.includes('slow_download') || issues.includes('slow_upload')) {
        content += `
echo Fixing slow connection issues...
netsh int tcp set global congestionprovider=ctcp
echo.
`;
    }
    
    // Always include the basic reset commands
    content += `
echo Running basic network reset commands...
netsh winsock reset
netsh int ip reset
ipconfig /release
ipconfig /renew

echo Network reset complete.
echo It's recommended to restart your computer now.
pause
`;
    
    return content;
} 