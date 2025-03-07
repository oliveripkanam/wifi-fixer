/**
 * UI-related functions for the WiFi Diagnostics Tool
 */

// Function to show the roadmap page
function showRoadmap() {
    document.getElementById('main-page').style.display = 'none';
    document.getElementById('history-page').style.display = 'none';
    document.getElementById('roadmap-page').style.display = 'block';
}

// Function to show the main diagnostics page
function showMainPage() {
    document.getElementById('roadmap-page').style.display = 'none';
    document.getElementById('history-page').style.display = 'none';
    document.getElementById('main-page').style.display = 'block';
}

// Function to update the progress bar
function updateProgress(percent) {
    const progressBar = document.getElementById('progress-bar');
    progressBar.style.width = percent + '%';
    progressBar.textContent = percent + '%';
}

// Function to add a result item to the results container
function addResult(test, result, status) {
    const resultsDiv = document.getElementById('results');
    const resultItem = document.createElement('div');
    resultItem.className = `result-item ${status}`;
    resultItem.innerHTML = `<strong>${test}:</strong> ${result}`;
    resultsDiv.appendChild(resultItem);
}

// Function to toggle dark mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    // Save preference to localStorage
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
}

// Function to toggle visibility of fix explanations
function toggleFixExplanation(id) {
    const explanation = document.getElementById(id);
    if (explanation.style.display === 'block') {
        explanation.style.display = 'none';
    } else {
        explanation.style.display = 'block';
    }
}

// Function to show recommendations based on test results
function showRecommendations() {
    const resultsDiv = document.getElementById('results');
    const resultItems = document.querySelectorAll('.result-item.warning, .result-item.bad');
    
    if (resultItems.length > 0) {
        const recommendationsDiv = document.createElement('div');
        recommendationsDiv.className = 'result-item';
        
        let recommendationsHTML = '<strong>Recommended Fixes:</strong>';
        
        // Process each non-green result
        resultItems.forEach((item, index) => {
            const testName = item.querySelector('strong').textContent.replace(':', '');
            
            recommendationsHTML += `<div style="margin-top: 10px;"><strong>${testName}</strong><ul>`;
            
            if (testName.includes('Ping') || testName.includes('Latency')) {
                recommendationsHTML += `
                    <li>Reduce the number of devices on your network</li>
                    <li>Move closer to your router</li>
                    <li>Check for interference from other electronic devices</li>
                `;
                
                // Add detailed explanation toggle
                recommendationsHTML += `
                    <span class="fix-details-toggle" onclick="toggleFixExplanation('ping-${index}')">Learn more about high latency issues</span>
                    <div id="ping-${index}" class="fix-explanation">
                        <p><strong>What is latency?</strong> Latency (ping) is the time it takes for data to travel from your device to a server and back. High latency causes delays in online activities.</p>
                        <p><strong>Common causes:</strong></p>
                        <ul>
                            <li><strong>Distance from router:</strong> Walls and distance weaken WiFi signals</li>
                            <li><strong>Network congestion:</strong> Too many devices using bandwidth simultaneously</li>
                            <li><strong>Interference:</strong> Microwaves, cordless phones, and other electronics can disrupt WiFi signals</li>
                            <li><strong>Outdated equipment:</strong> Older routers may not handle modern internet demands</li>
                        </ul>
                    </div>
                `;
            }
            
            if (testName.includes('Download Speed')) {
                recommendationsHTML += `
                    <li>Check if other devices are using bandwidth</li>
                    <li>Restart your router</li>
                    <li>Contact your ISP if speeds are consistently slow</li>
                `;
                
                // Add detailed explanation toggle
                recommendationsHTML += `
                    <span class="fix-details-toggle" onclick="toggleFixExplanation('download-${index}')">Learn more about slow download speeds</span>
                    <div id="download-${index}" class="fix-explanation">
                        <p><strong>Why is my download speed slow?</strong> Download speed determines how quickly data comes to your device from the internet.</p>
                        <p><strong>Common causes:</strong></p>
                        <ul>
                            <li><strong>Shared bandwidth:</strong> Other devices on your network streaming video or downloading large files</li>
                            <li><strong>ISP throttling:</strong> Some providers limit speeds at peak usage times</li>
                            <li><strong>Outdated router:</strong> Older routers may not support faster speeds</li>
                            <li><strong>WiFi channel congestion:</strong> Neighbors' WiFi networks may be interfering with yours</li>
                        </ul>
                        <p><strong>Pro tip:</strong> Try a wired Ethernet connection to test if the issue is with your WiFi specifically.</p>
                    </div>
                `;
            }
            
            if (testName.includes('Upload Speed')) {
                recommendationsHTML += `
                    <li>Close applications that might be uploading in the background</li>
                    <li>Check for malware that might be using your connection</li>
                    <li>Contact your ISP if speeds are consistently slow</li>
                `;
                
                // Add detailed explanation toggle
                recommendationsHTML += `
                    <span class="fix-details-toggle" onclick="toggleFixExplanation('upload-${index}')">Learn more about slow upload speeds</span>
                    <div id="upload-${index}" class="fix-explanation">
                        <p><strong>Why is upload speed important?</strong> Upload speed affects video calls, sending emails with attachments, and cloud backups.</p>
                        <p><strong>Common causes of slow uploads:</strong></p>
                        <ul>
                            <li><strong>Asymmetric connection:</strong> Most home internet plans have much slower upload than download speeds by design</li>
                            <li><strong>Background processes:</strong> Cloud backup services, file sharing applications, or other uploads</li>
                            <li><strong>Router settings:</strong> Quality of Service (QoS) settings may be limiting upload speeds</li>
                        </ul>
                    </div>
                `;
            }
            
            if (testName.includes('Connection Stability') || testName.includes('Basic Connectivity')) {
                recommendationsHTML += `
                    <li>Restart your router</li>
                    <li>Check for loose cable connections</li>
                    <li>Try connecting to a different WiFi network if available</li>
                `;
                
                // Add detailed explanation toggle
                recommendationsHTML += `
                    <span class="fix-details-toggle" onclick="toggleFixExplanation('stability-${index}')">Learn more about connection stability issues</span>
                    <div id="stability-${index}" class="fix-explanation">
                        <p><strong>Why does my connection drop?</strong> Unstable connections can be caused by various factors:</p>
                        <ul>
                            <li><strong>Router issues:</strong> Routers sometimes need to be restarted to clear memory and refresh connections</li>
                            <li><strong>Signal interference:</strong> Crowded WiFi channels or physical obstacles</li>
                            <li><strong>ISP problems:</strong> Service outages or maintenance in your area</li>
                            <li><strong>Overheating:</strong> Routers can overheat if placed in enclosed areas with poor ventilation</li>
                        </ul>
                        <p><strong>Troubleshooting tip:</strong> If rebooting solves the problem temporarily but it keeps returning, your router may need to be replaced.</p>
                    </div>
                `;
            }
            
            if (testName.includes('DNS Resolution')) {
                recommendationsHTML += `
                    <li>Try using alternative DNS servers (Google: 8.8.8.8, Cloudflare: 1.1.1.1)</li>
                    <li>Flush your DNS cache</li>
                    <li>Check if your ISP is having DNS issues</li>
                `;
                
                // Add detailed explanation toggle
                recommendationsHTML += `
                    <span class="fix-details-toggle" onclick="toggleFixExplanation('dns-${index}')">Learn more about DNS issues</span>
                    <div id="dns-${index}" class="fix-explanation">
                        <p><strong>What is DNS?</strong> DNS (Domain Name System) works like the internet's address book, translating website names (like google.com) into IP addresses computers use.</p>
                        <p><strong>Why DNS matters:</strong> When DNS isn't working correctly, you may be able to ping IP addresses but not access websites by name.</p>
                        <p><strong>How to change DNS servers:</strong></p>
                        <ol>
                            <li>Go to your network adapter settings</li>
                            <li>Find the TCP/IP settings section</li>
                            <li>Change from automatic to manual DNS</li>
                            <li>Enter 8.8.8.8 (Google) or 1.1.1.1 (Cloudflare)</li>
                        </ol>
                        <p>Changing DNS can sometimes significantly improve browsing speeds and reliability.</p>
                    </div>
                `;
            }
            
            if (testName.includes('Packet Loss')) {
                recommendationsHTML += `
                    <li>Check for interference from other electronic devices</li>
                    <li>Try a different WiFi channel on your router</li>
                    <li>Move closer to your router or use a WiFi extender</li>
                `;
                
                // Add detailed explanation toggle
                recommendationsHTML += `
                    <span class="fix-details-toggle" onclick="toggleFixExplanation('packet-${index}')">Learn more about packet loss</span>
                    <div id="packet-${index}" class="fix-explanation">
                        <p><strong>What is packet loss?</strong> Data travels across networks in small units called packets. Packet loss occurs when these packets fail to reach their destination.</p>
                        <p><strong>Impact of packet loss:</strong></p>
                        <ul>
                            <li>Video calls with freezing or poor quality</li>
                            <li>Online games with lag or disconnections</li>
                            <li>Websites that partially load or time out</li>
                            <li>Downloads that fail or take longer than expected</li>
                        </ul>
                        <p><strong>Advanced solution:</strong> For gamers or remote workers, consider a wired Ethernet connection which typically has much lower packet loss than WiFi.</p>
                    </div>
                `;
            }
            
            recommendationsHTML += '</ul></div>';
        });
        
        // Add note about fix script
        recommendationsHTML += `
            <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid var(--border-color);">
                <strong>Need a quick fix?</strong> You can download and run our network fix script by clicking the blue button above.
            </div>
        `;
        
        recommendationsDiv.innerHTML = recommendationsHTML;
        resultsDiv.appendChild(recommendationsDiv);
    } else {
        // If all tests are green, show a simple success message
        const recommendationsDiv = document.createElement('div');
        recommendationsDiv.className = 'result-item good';
        recommendationsDiv.innerHTML = `
            <strong>Great news!</strong> All tests passed successfully. Your WiFi connection appears to be working well.
            <div style="margin-top: 10px;">
                If you're still experiencing issues, you can try downloading and running our network fix script by clicking the blue button above.
            </div>
        `;
        resultsDiv.appendChild(recommendationsDiv);
    }
}

// Export results as a text file
function exportResults() {
    // Get all the results from the results div
    const resultsDiv = document.getElementById('results');
    const resultItems = resultsDiv.querySelectorAll('.result-item');
    
    // Format the results as text
    let textContent = "WiFi Diagnostics Results\n";
    textContent += "Generated on: " + new Date().toLocaleString() + "\n\n";
    
    resultItems.forEach(item => {
        if (item.querySelector('strong') && !item.querySelector('strong').textContent.includes('Recommended')) {
            // This is a test result item
            const testName = item.querySelector('strong').textContent.replace(':', '');
            const testResult = item.textContent.replace(testName + ':', '').trim();
            const status = item.classList.contains('good') ? 'GOOD' : 
                          item.classList.contains('warning') ? 'WARNING' : 'BAD';
            
            textContent += `${testName}: ${testResult} [${status}]\n`;
        }
    });
    
    // Add recommendations section
    const recommendationsItem = resultsDiv.querySelector('.result-item:last-child');
    if (recommendationsItem) {
        textContent += "\nRECOMMENDATIONS:\n";
        textContent += recommendationsItem.textContent.replace(/\s+/g, ' ').trim() + "\n";
    }
    
    // Create a Blob with the text content
    const blob = new Blob([textContent], { type: 'text/plain' });
    
    // Create a download link
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = `wifi-diagnostics-${new Date().toISOString().slice(0,10)}.txt`;
    
    // Trigger the download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
} 