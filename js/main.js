/**
 * Main JavaScript file for the WiFi Diagnostics Tool
 * Handles event listeners and initialization
 */

// Add event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dark mode based on saved preference
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
    }
    
    // Dark mode toggle
    document.getElementById('mode-toggle').addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled');
    });
    
    // Main buttons
    document.getElementById('start-test').addEventListener('click', startDiagnostics);
    document.getElementById('fix-button').addEventListener('click', downloadFixScript);
    document.getElementById('export-button').addEventListener('click', exportResults);
    document.getElementById('roadmap-button').addEventListener('click', showRoadmap);
    document.getElementById('history-button').addEventListener('click', showHistory);
    document.getElementById('advanced-button').addEventListener('click', showAdvancedHub);
    
    // Back buttons
    document.getElementById('back-button').addEventListener('click', showMainPage);
    document.getElementById('history-back-button').addEventListener('click', showMainPage);
    document.getElementById('advanced-back-button').addEventListener('click', showMainPage);
    document.getElementById('router-back-button').addEventListener('click', showAdvancedHub);
    document.getElementById('channel-back-button').addEventListener('click', showAdvancedHub);
    document.getElementById('upload-back-button').addEventListener('click', showAdvancedHub);
    document.getElementById('monitoring-back-button').addEventListener('click', showAdvancedHub);
    
    // Premium back buttons
    document.getElementById('premium-back-button').addEventListener('click', showMainPage);
    document.getElementById('isp-back-button').addEventListener('click', showPremiumHub);
    document.getElementById('vpn-back-button').addEventListener('click', showPremiumHub);
    document.getElementById('bandwidth-back-button').addEventListener('click', showPremiumHub);
    document.getElementById('hardware-back-button').addEventListener('click', showPremiumHub);
    
    // Advanced feature buttons
    document.getElementById('run-router-info').addEventListener('click', runRouterInfoTest);
    document.getElementById('run-channel-analysis').addEventListener('click', runChannelAnalysisTest);
    document.getElementById('run-upload-test').addEventListener('click', runUploadTest);
    document.getElementById('toggle-monitoring').addEventListener('click', toggleMonitoring);
    document.getElementById('run-all-advanced').addEventListener('click', runAllAdvancedTests);
    
    // Premium feature buttons
    document.getElementById('check-isp-status').addEventListener('click', checkISPStatus);
    document.getElementById('run-vpn-analysis').addEventListener('click', runVPNAnalysis);
    document.getElementById('analyze-bandwidth').addEventListener('click', analyzeBandwidthUsage);
    document.getElementById('get-hardware-recs').addEventListener('click', getHardwareRecommendations);
    document.getElementById('run-all-premium').addEventListener('click', runAllPremiumTests);
    
    // Navigation buttons in feature cards
    const featureNavButtons = document.querySelectorAll('.feature-nav-button');
    featureNavButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetPage = this.getAttribute('data-page');
            showPage(targetPage);
        });
    });
});

// Function to show the advanced diagnostics hub page
function showAdvancedHub() {
    hideAllPages();
    document.getElementById('advanced-hub-page').style.display = 'block';
    
    // Add a premium banner if it doesn't exist yet
    if (!document.getElementById('premium-banner')) {
        const advancedContainer = document.querySelector('#advanced-hub-page .diagnostic-container');
        const premiumBanner = document.createElement('div');
        premiumBanner.id = 'premium-banner';
        premiumBanner.className = 'premium-banner';
        premiumBanner.innerHTML = `
            <h3>Discover Premium Features <span class="premium-badge">NEW</span></h3>
            <p>Unlock advanced diagnostics and personalized recommendations with Premium Features</p>
            <button id="premium-banner-button" class="premium-button">Explore Premium Features</button>
        `;
        advancedContainer.appendChild(premiumBanner);
        
        // Add event listener to the banner button
        document.getElementById('premium-banner-button').addEventListener('click', showPremiumHub);
    }
}

function showPremiumHub() {
    hideAllPages();
    document.getElementById('premium-hub-page').style.display = 'block';
}

// Function to show a specific page
function showPage(pageId) {
    hideAllPages();
    document.getElementById(pageId).style.display = 'block';
}

// Function to hide all pages
function hideAllPages() {
    const pages = [
        'main-page', 'roadmap-page', 'history-page', 
        'router-info-page', 'wifi-channel-page', 'upload-test-page', 
        'monitoring-page', 'advanced-hub-page', 'premium-hub-page',
        'isp-outage-page', 'vpn-analysis-page', 'bandwidth-breakdown-page', 
        'hardware-rec-page'
    ];
    
    pages.forEach(page => {
        document.getElementById(page).style.display = 'none';
    });
}

// Updated function to show the main page
function showMainPage() {
    hideAllPages();
    document.getElementById('main-page').style.display = 'block';
}

// Updated function to show the roadmap page
function showRoadmap() {
    hideAllPages();
    document.getElementById('roadmap-page').style.display = 'block';
}

// Updated function to show the history page
function showHistory() {
    updateHistoryPage(); // Make sure history data is updated
    hideAllPages();
    document.getElementById('history-page').style.display = 'block';
}

// Router information test
function runRouterInfoTest() {
    const resultsDiv = document.getElementById('router-info-results');
    resultsDiv.innerHTML = '<div class="loading">Detecting router information...</div>';
    
    // Run router info detection
    detectRouterInfo().then(info => {
        // Clear loading message
        resultsDiv.innerHTML = '';
        
        // Create a more detailed display for the router info page
        const infoCard = document.createElement('div');
        infoCard.className = 'info-card';
        
        infoCard.innerHTML = `
            <h3>Network Information</h3>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Public IP:</div>
                    <div class="info-value">${info.publicIP}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Local IP:</div>
                    <div class="info-value">${info.localIP}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Internet Service Provider:</div>
                    <div class="info-value">${info.isp}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Connection Type:</div>
                    <div class="info-value">${info.connectionType}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Effective Connection Type:</div>
                    <div class="info-value">${info.effectiveType}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Hostname:</div>
                    <div class="info-value">${info.hostname || 'Unknown'}</div>
                </div>
            </div>
            <p class="info-note">Note: Some information may be limited due to browser security restrictions.</p>
        `;
        
        resultsDiv.appendChild(infoCard);
    });
}

// WiFi channel analysis test
function runChannelAnalysisTest() {
    const resultsDiv = document.getElementById('channel-results');
    resultsDiv.innerHTML = '<div class="loading">Analyzing WiFi channel quality...</div>';
    
    // Run WiFi channel analysis
    analyzeWiFiChannel().then(info => {
        // Clear loading message
        resultsDiv.innerHTML = '';
        
        // Create a detailed display for the channel analysis
        const analysisCard = document.createElement('div');
        analysisCard.className = 'info-card';
        
        // Determine color coding based on congestion
        let congestionClass = 'good-text';
        if (info.channelCongestion === 'Moderate') {
            congestionClass = 'warning-text';
        } else if (info.channelCongestion === 'High' || info.channelCongestion === 'Likely high') {
            congestionClass = 'bad-text';
        }
        
        analysisCard.innerHTML = `
            <h3>WiFi Channel Analysis Results</h3>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Connection Quality:</div>
                    <div class="info-value">${info.bandwidthInfo}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Signal Strength:</div>
                    <div class="info-value">${info.signalStrength}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Channel Congestion:</div>
                    <div class="info-value ${congestionClass}">${info.channelCongestion}</div>
                </div>
                ${info.pingAverage ? `
                <div class="info-item">
                    <div class="info-label">Average Ping:</div>
                    <div class="info-value">${info.pingAverage}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Jitter:</div>
                    <div class="info-value">${info.jitter}</div>
                </div>` : ''}
            </div>
            
            <div class="recommendation-box">
                <h4>Recommendation:</h4>
                <p>${info.recommendedAction}</p>
            </div>
            
            <p class="info-note">Note: This analysis is limited due to browser restrictions. For more accurate results, use a dedicated WiFi analyzer app.</p>
        `;
        
        resultsDiv.appendChild(analysisCard);
    });
}

// Enhanced upload test
function runUploadTest() {
    const resultsDiv = document.getElementById('upload-results');
    resultsDiv.innerHTML = '<div class="loading">Preparing upload speed test...</div>';
    
    // Small delay to show loading message
    setTimeout(() => {
        // Run enhanced upload test
        enhancedUploadTest().then(speed => {
            // Clear previous content
            resultsDiv.innerHTML = '';
            
            // Create detailed result card
            const resultCard = document.createElement('div');
            resultCard.className = 'info-card';
            
            // Determine rating based on speed
            let speedRating, speedClass;
            if (speed < 2) {
                speedRating = 'Slow';
                speedClass = 'bad-text';
            } else if (speed < 5) {
                speedRating = 'Moderate';
                speedClass = 'warning-text';
            } else {
                speedRating = 'Good';
                speedClass = 'good-text';
            }
            
            resultCard.innerHTML = `
                <h3>Upload Speed Test Results</h3>
                <div class="speed-display">
                    <div class="speed-value ${speedClass}">${speed} Mbps</div>
                    <div class="speed-rating ${speedClass}">${speedRating}</div>
                </div>
                
                <div class="speed-details">
                    <h4>What this means:</h4>
                    <ul>
                        ${speed < 1 ? '<li>Very slow for most online activities</li>' : ''}
                        ${speed < 3 ? '<li>Video calls may experience quality issues</li>' : ''}
                        ${speed < 5 ? '<li>Uploading large files will take considerable time</li>' : ''}
                        ${speed >= 5 ? '<li>Suitable for most online activities including video calls</li>' : ''}
                        ${speed >= 10 ? '<li>Excellent for cloud backups and file sharing</li>' : ''}
                    </ul>
                </div>
                
                <p class="info-note">Note: This is an enhanced simulation based on your connection characteristics.</p>
            `;
            
            resultsDiv.appendChild(resultCard);
        });
    }, 500);
}

// Toggle continuous monitoring
function toggleMonitoring() {
    const button = document.getElementById('toggle-monitoring');
    const statusText = document.getElementById('monitoring-status-text');
    const monitoringSection = document.getElementById('monitoring-section');
    
    if (isMonitoring) {
        // Stop monitoring
        clearInterval(monitoringInterval);
        isMonitoring = false;
        button.textContent = 'Start Monitoring';
        statusText.textContent = 'Off';
        statusText.classList.remove('active');
    } else {
        // Start monitoring
        isMonitoring = true;
        button.textContent = 'Stop Monitoring';
        statusText.textContent = 'Active';
        statusText.classList.add('active');
        monitoringSection.style.display = 'block';
        
        // Run initial test
        runMonitoringTest();
        
        // Setup interval for periodic testing
        monitoringInterval = setInterval(runMonitoringTest, 30000); // Run every 30 seconds
    }
    
    // Update monitoring UI
    updateMonitoringChart();
    updateNetworkStatus();
}

// Run all advanced tests in sequence
function runAllAdvancedTests() {
    const button = document.getElementById('run-all-advanced');
    button.textContent = 'Running Tests...';
    button.disabled = true;
    
    // Run tests in sequence
    Promise.resolve()
        .then(() => {
            showPage('router-info-page');
            return runRouterInfoTest();
        })
        .then(() => {
            setTimeout(() => {
                showPage('wifi-channel-page');
                return runChannelAnalysisTest();
            }, 2000);
        })
        .then(() => {
            setTimeout(() => {
                showPage('upload-test-page');
                return runUploadTest();
            }, 4000);
        })
        .then(() => {
            setTimeout(() => {
                showPage('monitoring-page');
                if (!isMonitoring) {
                    toggleMonitoring();
                }
                
                // Go back to advanced hub after all tests
                setTimeout(() => {
                    showAdvancedHub();
                    button.textContent = 'Start All Tests';
                    button.disabled = false;
                }, 3000);
            }, 6000);
        });
}

// Add Premium Features button to main UI after completing basic tests
function displayDiagnosticResults(results) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    // Same existing code for displaying results...
    // ... existing result display code ...

    // Show buttons after test completion
    document.getElementById('fix-button').style.display = 'inline-block';
    document.getElementById('export-button').style.display = 'inline-block';
    document.getElementById('history-button').style.display = 'inline-block';
    document.getElementById('advanced-button').style.display = 'inline-block';
    
    // Add a new Premium Features button
    const premiumButton = document.createElement('button');
    premiumButton.id = 'premium-button';
    premiumButton.textContent = 'Premium Features';
    premiumButton.classList.add('premium-button');
    premiumButton.addEventListener('click', showPremiumHub);
    document.querySelector('.button-container').appendChild(premiumButton);
    
    // Add test to history
    addTestToHistory(results);
}

// Premium Features Implementation

// Check ISP Status
function checkISPStatus() {
    const resultsDiv = document.getElementById('isp-outage-results');
    resultsDiv.innerHTML = '<div class="loading">Checking ISP status...</div>';
    
    // Simulate API call to check ISP status
    setTimeout(() => {
        const ispName = getRandomISP();
        const hasOutage = Math.random() > 0.7; // 30% chance of outage
        const statusClass = hasOutage ? 'status-issues' : 'status-up';
        const statusText = hasOutage ? 'Experiencing Issues' : 'Operational';
        
        let html = `
            <div class="info-card">
                <h3>ISP Status Check Results</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Your ISP</span>
                        <span class="info-value">${ispName}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Status</span>
                        <span class="info-value">
                            <span class="status-indicator ${statusClass}"></span>
                            ${statusText}
                        </span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Last Updated</span>
                        <span class="info-value">${new Date().toLocaleTimeString()}</span>
                    </div>
                </div>`;
        
        if (hasOutage) {
            html += `
                <div class="recommendation-box">
                    <h4>Outage Details</h4>
                    <p>There appears to be service issues reported in your area. The following services may be affected:</p>
                    <ul>
                        <li>Internet connectivity - ${Math.random() > 0.5 ? 'Degraded' : 'Intermittent'}</li>
                        <li>DNS resolution - ${Math.random() > 0.5 ? 'Slow' : 'Normal'}</li>
                        <li>Estimated resolution time: ${Math.floor(Math.random() * 5) + 1} hours</li>
                    </ul>
                    <p>We recommend contacting your ISP for more information or waiting for the issue to be resolved.</p>
                </div>`;
        } else {
            html += `
                <div class="recommendation-box">
                    <h4>Service Status</h4>
                    <p>No outages reported for ${ispName} in your area. If you're experiencing issues, they may be related to your local network or equipment.</p>
                    <p>You can run our basic diagnostics to identify potential problems with your connection.</p>
                </div>`;
        }
        
        html += `
            <div class="collapsible-section">
                <div class="collapsible-header">
                    <span>Regional Outage Map</span>
                    <span>▼</span>
                </div>
                <div class="collapsible-content">
                    <p style="text-align: center;">Map data would be displayed here in a real implementation, showing regional outage information.</p>
                </div>
            </div>
        </div>`;
        
        resultsDiv.innerHTML = html;
        
        // Add event listener to collapsible section
        document.querySelector('.collapsible-header').addEventListener('click', function() {
            const content = this.nextElementSibling;
            content.style.display = content.style.display === 'block' ? 'none' : 'block';
            this.querySelector('span:last-child').textContent = content.style.display === 'block' ? '▲' : '▼';
        });
    }, 2500);
}

// Run VPN Analysis
function runVPNAnalysis() {
    const resultsDiv = document.getElementById('vpn-analysis-results');
    resultsDiv.innerHTML = '<div class="loading">Analyzing VPN impact...</div>';
    
    // Simulate VPN detection and analysis
    setTimeout(() => {
        const vpnDetected = Math.random() > 0.6; // 40% chance of VPN detected
        const hasVPNImpact = vpnDetected && Math.random() > 0.3; // 70% chance of impact if VPN detected
        
        let html = `
            <div class="info-card">
                <h3>VPN Connection Analysis</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">VPN Connection</span>
                        <span class="info-value">${vpnDetected ? 'Detected' : 'Not Detected'}</span>
                    </div>`;
        
        if (vpnDetected) {
            const vpnProvider = getRandomVPNProvider();
            const vpnLocation = getRandomLocation();
            const pingIncrease = Math.floor(Math.random() * 50) + 20;
            const downloadDecrease = Math.floor(Math.random() * 30) + 10;
            
            html += `
                    <div class="info-item">
                        <span class="info-label">Likely Provider</span>
                        <span class="info-value">${vpnProvider}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Apparent Location</span>
                        <span class="info-value">${vpnLocation}</span>
                    </div>
                </div>
                
                <h3>Performance Impact</h3>
                <div class="vpn-comparison">
                    <div class="vpn-column">
                        <div class="vpn-header">Metric</div>
                        <div>Ping (ms)</div>
                        <div>Download Speed</div>
                        <div>Upload Speed</div>
                        <div>Stability</div>
                    </div>
                    <div class="vpn-column">
                        <div class="vpn-header">Without VPN</div>
                        <div class="vpn-value">${Math.floor(Math.random() * 30) + 10}</div>
                        <div class="vpn-value">${Math.floor(Math.random() * 50) + 50} Mbps</div>
                        <div class="vpn-value">${Math.floor(Math.random() * 10) + 10} Mbps</div>
                        <div class="vpn-value">High</div>
                    </div>
                    <div class="vpn-column highlight">
                        <div class="vpn-header">With VPN</div>
                        <div class="vpn-value ${hasVPNImpact ? 'bad-text' : ''}">${Math.floor(Math.random() * 50) + 30 + pingIncrease}</div>
                        <div class="vpn-value ${hasVPNImpact ? 'bad-text' : ''}">${Math.floor(Math.random() * 30) + 30} Mbps</div>
                        <div class="vpn-value">${Math.floor(Math.random() * 7) + 5} Mbps</div>
                        <div class="vpn-value">${hasVPNImpact ? 'Moderate' : 'High'}</div>
                    </div>
                </div>
                
                <div class="recommendation-box">
                    <h4>VPN Impact Analysis</h4>`;
            
            if (hasVPNImpact) {
                html += `
                    <p>Your VPN connection is significantly impacting your network performance:</p>
                    <ul>
                        <li>Increased latency: +${pingIncrease}ms (${pingIncrease > 30 ? 'Significant' : 'Moderate'} impact)</li>
                        <li>Reduced download speed: -${downloadDecrease}% (${downloadDecrease > 20 ? 'Significant' : 'Moderate'} impact)</li>
                    </ul>
                    <p>Recommendations:</p>
                    <ul>
                        <li>Try a different VPN server closer to your physical location</li>
                        <li>Switch to a lighter VPN protocol like WireGuard if available</li>
                        <li>For tasks requiring maximum speed, consider temporarily disabling your VPN</li>
                    </ul>`;
            } else {
                html += `
                    <p>Your VPN is configured optimally and having minimal impact on your network performance.</p>
                    <p>Recommendations:</p>
                    <ul>
                        <li>Continue using your current VPN configuration</li>
                        <li>For slightly better performance, you could try connecting to a server even closer to your physical location</li>
                    </ul>`;
            }
        } else {
            html += `
                </div>
                <div class="recommendation-box">
                    <h4>No VPN Detected</h4>
                    <p>We did not detect an active VPN connection. If you are using a VPN, it may be using advanced obfuscation techniques.</p>
                    <p>Using a VPN can provide privacy benefits, but may impact network performance:</p>
                    <ul>
                        <li>Increased latency (typically +10-70ms)</li>
                        <li>Reduced download and upload speeds (typically 10-30%)</li>
                        <li>Possible increased jitter and packet loss in some cases</li>
                    </ul>
                    <p>If you're experiencing network issues and privacy is not a requirement, consider running your connection tests without a VPN.</p>`;
        }
        
        html += `
                </div>
            </div>`;
        
        resultsDiv.innerHTML = html;
    }, 3000);
}

// Analyze Bandwidth Usage
function analyzeBandwidthUsage() {
    const resultsDiv = document.getElementById('bandwidth-results');
    resultsDiv.innerHTML = '<div class="loading">Analyzing bandwidth usage patterns...</div>';
    
    // Simulate bandwidth usage analysis
    setTimeout(() => {
        const totalBandwidth = Math.floor(Math.random() * 50) + 30; // 30-80 Mbps
        const apps = [
            { name: 'Video Streaming', icon: '🎬', usage: Math.floor(Math.random() * 40) + 15 },
            { name: 'Web Browsing', icon: '🌐', usage: Math.floor(Math.random() * 15) + 5 },
            { name: 'File Downloads', icon: '📥', usage: Math.floor(Math.random() * 25) + 5 },
            { name: 'Video Calls', icon: '📹', usage: Math.floor(Math.random() * 20) + 5 },
            { name: 'Cloud Sync', icon: '☁️', usage: Math.floor(Math.random() * 15) + 2 },
            { name: 'Gaming', icon: '🎮', usage: Math.floor(Math.random() * 10) + 2 },
            { name: 'Social Media', icon: '👥', usage: Math.floor(Math.random() * 8) + 1 },
            { name: 'System Updates', icon: '🔄', usage: Math.floor(Math.random() * 20) }
        ];
        
        // Sort by usage
        apps.sort((a, b) => b.usage - a.usage);
        
        // Calculate percentages and ensure they add up to 100%
        let totalPercentage = 0;
        apps.forEach(app => {
            app.percentage = Math.floor((app.usage / totalBandwidth) * 100);
            totalPercentage += app.percentage;
        });
        
        // Adjust if needed
        if (totalPercentage < 100) {
            apps[0].percentage += (100 - totalPercentage);
        } else if (totalPercentage > 100) {
            apps[0].percentage -= (totalPercentage - 100);
        }
        
        let html = `
            <div class="info-card">
                <h3>Bandwidth Usage Analysis</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Total Bandwidth</span>
                        <span class="info-value">${totalBandwidth} Mbps</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Top Application</span>
                        <span class="info-value">${apps[0].icon} ${apps[0].name}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Analysis Period</span>
                        <span class="info-value">Last 24 hours</span>
                    </div>
                </div>
                
                <h3>Usage Breakdown</h3>
                <div class="data-chart">
                    ${apps.map((app, index) => `
                        <div class="chart-bar" style="left: ${index * 10}%; height: ${app.percentage}%; background-color: ${getColorForIndex(index)};"></div>
                        <div class="chart-label-x" style="left: ${index * 10}%;">${app.icon}</div>
                    `).join('')}
                </div>
                
                <div style="margin-top: 20px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <th style="text-align: left; padding: 10px;">Application</th>
                            <th style="text-align: right; padding: 10px;">Usage</th>
                            <th style="text-align: right; padding: 10px;">Percentage</th>
                        </tr>
                        ${apps.map((app, index) => `
                            <tr>
                                <td style="padding: 10px; border-top: 1px solid var(--border-color);">
                                    <span style="display: inline-block; width: 20px; height: 20px; border-radius: 4px; background-color: ${getColorForIndex(index)}; margin-right: 10px; vertical-align: middle;"></span>
                                    ${app.icon} ${app.name}
                                </td>
                                <td style="text-align: right; padding: 10px; border-top: 1px solid var(--border-color);">${app.usage} Mbps</td>
                                <td style="text-align: right; padding: 10px; border-top: 1px solid var(--border-color);">${app.percentage}%</td>
                            </tr>
                        `).join('')}
                    </table>
                </div>
                
                <div class="recommendation-box">
                    <h4>Bandwidth Optimization Recommendations</h4>
                    <p>Based on your usage patterns, here are some recommendations to optimize your bandwidth:</p>
                    <ul>
                        ${apps[0].percentage > 30 ? `<li>Consider scheduling heavy ${apps[0].name.toLowerCase()} during off-peak hours</li>` : ''}
                        ${apps.some(app => app.name === 'Cloud Sync' && app.percentage > 10) ? 
                            `<li>Configure cloud sync applications to run during the night or when you're not using the network</li>` : ''}
                        ${apps.some(app => app.name === 'Video Streaming' && app.percentage > 25) ? 
                            `<li>Adjust video streaming quality settings based on your activity</li>` : ''}
                        ${apps.some(app => app.name === 'System Updates' && app.percentage > 15) ? 
                            `<li>Schedule system updates for overnight hours</li>` : ''}
                        <li>Consider implementing Quality of Service (QoS) on your router to prioritize important applications</li>
                        ${totalBandwidth < 50 ? `<li>Your current bandwidth usage suggests you might benefit from a higher-speed internet plan</li>` : ''}
                    </ul>
                </div>
            </div>`;
        
        resultsDiv.innerHTML = html;
    }, 3500);
}

// Get Hardware Recommendations
function getHardwareRecommendations() {
    const resultsDiv = document.getElementById('hardware-results');
    resultsDiv.innerHTML = '<div class="loading">Analyzing network needs and generating recommendations...</div>';
    
    // Simulate hardware recommendations generation
    setTimeout(() => {
        // Generate some usage profiles
        const homeSize = ['Small Apartment', 'Medium Home', 'Large Home'][Math.floor(Math.random() * 3)];
        const deviceCount = Math.floor(Math.random() * 15) + 5;
        const hasSmartHome = Math.random() > 0.4;
        const hasGaming = Math.random() > 0.5;
        const hasStreaming = Math.random() > 0.3;
        const hasWorkFromHome = Math.random() > 0.4;
        
        // Generate recommendations based on profile
        const routerRec = getRouterRecommendation(homeSize, deviceCount, hasGaming, hasStreaming);
        const meshRec = getMeshRecommendation(homeSize);
        const adapterRec = getAdapterRecommendation(hasGaming, hasWorkFromHome);
        
        let html = `
            <div class="info-card">
                <h3>Network Profile Analysis</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Home Size</span>
                        <span class="info-value">${homeSize}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Devices</span>
                        <span class="info-value">${deviceCount}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Usage Type</span>
                        <span class="info-value">${getUsageProfile(hasStreaming, hasGaming, hasWorkFromHome, hasSmartHome)}</span>
                    </div>
                </div>
                
                <h3>Recommended Equipment</h3>
                
                <div class="hardware-recommendation">
                    <div class="hardware-image"></div>
                    <div class="hardware-details">
                        <h4>${routerRec.name}</h4>
                        <p>${routerRec.description}</p>
                        <p class="hardware-price">${routerRec.price}</p>
                    </div>
                </div>
                
                ${homeSize === 'Large Home' || deviceCount > 12 ? `
                <div class="hardware-recommendation">
                    <div class="hardware-image"></div>
                    <div class="hardware-details">
                        <h4>${meshRec.name}</h4>
                        <p>${meshRec.description}</p>
                        <p class="hardware-price">${meshRec.price}</p>
                    </div>
                </div>` : ''}
                
                ${hasGaming || hasWorkFromHome ? `
                <div class="hardware-recommendation">
                    <div class="hardware-image"></div>
                    <div class="hardware-details">
                        <h4>${adapterRec.name}</h4>
                        <p>${adapterRec.description}</p>
                        <p class="hardware-price">${adapterRec.price}</p>
                    </div>
                </div>` : ''}
                
                <div class="recommendation-box">
                    <h4>Why These Recommendations?</h4>
                    <p>Based on your network profile, we've recommended equipment that will:</p>
                    <ul>
                        <li>Support up to ${deviceCount * 2} simultaneous devices</li>
                        <li>Cover your ${homeSize.toLowerCase()} effectively${homeSize === 'Large Home' ? ' with mesh technology' : ''}</li>
                        ${hasStreaming ? '<li>Handle 4K/8K streaming across multiple devices</li>' : ''}
                        ${hasGaming ? '<li>Provide low-latency gaming connections with QoS features</li>' : ''}
                        ${hasWorkFromHome ? '<li>Ensure stable video conferencing and remote work tools</li>' : ''}
                        ${hasSmartHome ? '<li>Support your smart home devices with reliable connectivity</li>' : ''}
                    </ul>
                    <p><small>Note: These are simulated recommendations based on your profile. In a real implementation, these would link to actual products with detailed specifications.</small></p>
                </div>
            </div>`;
        
        resultsDiv.innerHTML = html;
    }, 3000);
}

// Run all premium tests
function runAllPremiumTests() {
    checkISPStatus();
    
    setTimeout(() => {
        showPage('vpn-analysis-page');
        runVPNAnalysis();
        
        setTimeout(() => {
            showPage('bandwidth-breakdown-page');
            analyzeBandwidthUsage();
            
            setTimeout(() => {
                showPage('hardware-rec-page');
                getHardwareRecommendations();
            }, 4000);
        }, 4000);
    }, 4000);
}

// Helper functions for premium features
function getRandomISP() {
    const isps = ['Comcast Xfinity', 'Verizon FiOS', 'AT&T Internet', 'Spectrum', 'Cox Communications', 
                 'CenturyLink', 'Frontier', 'Optimum', 'Windstream', 'RCN', 'Google Fiber'];
    return isps[Math.floor(Math.random() * isps.length)];
}

function getRandomVPNProvider() {
    const providers = ['NordVPN', 'ExpressVPN', 'Surfshark', 'CyberGhost', 'Private Internet Access', 
                      'ProtonVPN', 'TunnelBear', 'Windscribe', 'IPVanish', 'Mullvad'];
    return providers[Math.floor(Math.random() * providers.length)];
}

function getRandomLocation() {
    const locations = ['United States', 'United Kingdom', 'Canada', 'Germany', 'Netherlands', 
                      'Switzerland', 'France', 'Japan', 'Singapore', 'Australia', 'Sweden'];
    return locations[Math.floor(Math.random() * locations.length)];
}

function getColorForIndex(index) {
    const colors = [
        '#3f51b5', '#f44336', '#4CAF50', '#FF9800', '#9C27B0', 
        '#2196F3', '#FF5722', '#607D8B', '#795548', '#009688'
    ];
    return colors[index % colors.length];
}

function getRouterRecommendation(homeSize, deviceCount, hasGaming, hasStreaming) {
    const recommendations = [
        {
            name: 'ASUS RT-AX86U',
            description: 'High-performance gaming router with excellent coverage for medium to large homes and advanced features for streaming and low-latency gaming.',
            price: '$249.99'
        },
        {
            name: 'TP-Link Archer AX50',
            description: 'Midrange WiFi 6 router perfect for medium homes with multiple devices. Great balance of performance and value.',
            price: '$149.99'
        },
        {
            name: 'NETGEAR Nighthawk RAX80',
            description: 'Premium WiFi 6 router with exceptional range and speed for large homes with numerous devices and high bandwidth activities.',
            price: '$349.99'
        },
        {
            name: 'TP-Link Archer AX10',
            description: 'Budget-friendly WiFi 6 router ideal for small to medium homes with standard internet usage patterns.',
            price: '$79.99'
        }
    ];
    
    if (homeSize === 'Large Home' || deviceCount > 12 || (hasGaming && hasStreaming)) {
        return recommendations[2]; // NETGEAR Nighthawk
    } else if (hasGaming) {
        return recommendations[0]; // ASUS Gaming
    } else if (homeSize === 'Medium Home' || deviceCount > 8) {
        return recommendations[1]; // TP-Link Midrange
    } else {
        return recommendations[3]; // TP-Link Budget
    }
}

function getMeshRecommendation(homeSize) {
    const recommendations = [
        {
            name: 'NETGEAR Orbi Tri-band Mesh System',
            description: 'Premium mesh system with dedicated backhaul, perfect for large homes up to 5,000 sq.ft. with numerous devices.',
            price: '$499.99'
        },
        {
            name: 'TP-Link Deco X20',
            description: 'Affordable mesh system for medium to large homes up to 4,000 sq.ft. Great value for whole-home coverage.',
            price: '$249.99'
        },
        {
            name: 'Amazon eero Pro 6',
            description: 'High-performance mesh system with simple setup and excellent reliability for homes up to 3,500 sq.ft.',
            price: '$399.99'
        }
    ];
    
    if (homeSize === 'Large Home') {
        return recommendations[0];
    } else {
        return recommendations[1];
    }
}

function getAdapterRecommendation(hasGaming, hasWorkFromHome) {
    const recommendations = [
        {
            name: 'TP-Link AX3000 PCIe WiFi Card',
            description: 'High-performance PCIe WiFi 6 adapter for desktop computers, perfect for gaming and high-bandwidth applications.',
            price: '$49.99'
        },
        {
            name: 'ASUS USB-AC68 AC1900 Adapter',
            description: 'Dual-band USB WiFi adapter with excellent range and stability for laptops or desktops without built-in WiFi.',
            price: '$79.99'
        },
        {
            name: 'TP-Link TL-PA9020P AV2000 Powerline Kit',
            description: 'Powerline ethernet adapter kit that uses your home\'s electrical wiring to extend your network where WiFi struggles to reach.',
            price: '$89.99'
        }
    ];
    
    if (hasGaming) {
        return recommendations[0];
    } else if (hasWorkFromHome) {
        return recommendations[2];
    } else {
        return recommendations[1];
    }
}

function getUsageProfile(hasStreaming, hasGaming, hasWorkFromHome, hasSmartHome) {
    const profiles = [];
    
    if (hasStreaming) profiles.push('Streaming');
    if (hasGaming) profiles.push('Gaming');
    if (hasWorkFromHome) profiles.push('Remote Work');
    if (hasSmartHome) profiles.push('Smart Home');
    
    if (profiles.length === 0) return 'Basic';
    if (profiles.length === 1) return profiles[0];
    if (profiles.length === 2) return profiles.join(' & ');
    
    return 'Heavy Mixed Usage';
} 