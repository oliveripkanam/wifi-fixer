/**
 * Advanced diagnostic functions for the WiFi Diagnostics Tool
 * Phase 3 features implementation
 */

// Global variable to track monitoring status
let isMonitoring = false;
let monitoringInterval = null;
const monitoringHistory = [];

/**
 * Router Information Detection
 * Gets as much network information as possible from the browser
 */
function detectRouterInfo() {
    return new Promise((resolve) => {
        const routerInfo = {
            localIP: 'Unknown',
            publicIP: 'Unknown',
            hostname: window.location.hostname,
            connectionType: 'Unknown',
            effectiveType: 'Unknown',
            isp: 'Unknown',
            gateway: 'Unknown'
        };
        
        // Try to get connection type information if available
        if (navigator.connection) {
            routerInfo.connectionType = navigator.connection.type || 'Unknown';
            routerInfo.effectiveType = navigator.connection.effectiveType || 'Unknown';
        }
        
        // Get public IP using a free API
        fetch('https://api.ipify.org?format=json')
            .then(response => response.json())
            .then(data => {
                routerInfo.publicIP = data.ip;
                
                // Try to get ISP information
                return fetch(`https://ipapi.co/${data.ip}/json/`);
            })
            .then(response => response.json())
            .then(data => {
                if (data.org) routerInfo.isp = data.org;
                
                // Use WebRTC to try to get local IP
                getLocalIP().then(ip => {
                    if (ip) routerInfo.localIP = ip;
                    resolve(routerInfo);
                });
            })
            .catch(error => {
                console.error("Error fetching network information:", error);
                resolve(routerInfo);
            });
    });
}

/**
 * Use WebRTC to try to get local IP address
 * Note: This is a best-effort approach and may not work in all browsers
 */
function getLocalIP() {
    return new Promise((resolve) => {
        try {
            // Using WebRTC to get local IP
            const RTCPeerConnection = window.RTCPeerConnection || 
                                      window.webkitRTCPeerConnection || 
                                      window.mozRTCPeerConnection;
                                      
            if (!RTCPeerConnection) {
                resolve(null);
                return;
            }
            
            const pc = new RTCPeerConnection({
                iceServers: []
            });
            
            pc.createDataChannel("");
            pc.createOffer()
                .then(pc.setLocalDescription.bind(pc))
                .catch(err => {
                    console.error(err);
                    resolve(null);
                });
                
            pc.onicecandidate = (ice) => {
                if (!ice || !ice.candidate || !ice.candidate.candidate) {
                    pc.close();
                    resolve(null);
                    return;
                }
                
                const localIP = /([0-9]{1,3}(\.[0-9]{1,3}){3})/.exec(ice.candidate.candidate);
                if (localIP && localIP.length > 1) {
                    pc.close();
                    resolve(localIP[1]);
                } else {
                    resolve(null);
                }
            };
            
            // Resolve with null after timeout
            setTimeout(() => {
                resolve(null);
            }, 3000);
        } catch (e) {
            console.error("Error getting local IP:", e);
            resolve(null);
        }
    });
}

/**
 * WiFi Channel Analysis
 * This is a limited implementation as browsers have restricted access to WiFi hardware
 */
function analyzeWiFiChannel() {
    return new Promise((resolve) => {
        const channelInfo = {
            bandwidthInfo: 'Unknown',
            signalStrength: 'Unknown',
            channelCongestion: 'Unknown',
            recommendedAction: 'Unable to determine with browser-based tools'
        };
        
        // Check if NetworkInformation API is available
        if (navigator.connection) {
            // Get connection type and effective speed
            channelInfo.bandwidthInfo = navigator.connection.effectiveType || 'Unknown';
            
            // Make an educated guess about signal strength based on bandwidth
            switch (navigator.connection.effectiveType) {
                case 'slow-2g':
                case '2g':
                    channelInfo.signalStrength = 'Poor';
                    channelInfo.channelCongestion = 'Likely high';
                    channelInfo.recommendedAction = 'Move closer to router or use a WiFi extender';
                    break;
                case '3g':
                    channelInfo.signalStrength = 'Moderate';
                    channelInfo.channelCongestion = 'Moderate';
                    channelInfo.recommendedAction = 'Consider changing WiFi channel on your router';
                    break;
                case '4g':
                    channelInfo.signalStrength = 'Good';
                    channelInfo.channelCongestion = 'Likely low';
                    channelInfo.recommendedAction = 'Current setup appears optimal';
                    break;
                default:
                    // Unable to determine
                    break;
            }
        }
        
        // Perform a latency test to estimate connection quality
        const pingPromises = [];
        for (let i = 0; i < 5; i++) {
            pingPromises.push(performPingTest());
        }
        
        Promise.all(pingPromises).then(pings => {
            // Filter out nulls
            const validPings = pings.filter(p => p !== null);
            
            if (validPings.length > 0) {
                // Calculate average ping
                const avgPing = validPings.reduce((sum, ping) => sum + ping, 0) / validPings.length;
                
                // Calculate jitter (variation in ping)
                const jitter = calculateJitter(validPings);
                
                // Update channel information based on ping and jitter
                channelInfo.pingAverage = avgPing.toFixed(2) + 'ms';
                channelInfo.jitter = jitter.toFixed(2) + 'ms';
                
                // Use jitter to estimate channel congestion
                if (jitter > 30) {
                    channelInfo.channelCongestion = 'High';
                    channelInfo.recommendedAction = 'Change WiFi channel on your router - significant interference detected';
                } else if (jitter > 15) {
                    channelInfo.channelCongestion = 'Moderate';
                    channelInfo.recommendedAction = 'Consider changing WiFi channel if experiencing issues';
                } else {
                    channelInfo.channelCongestion = 'Low';
                    channelInfo.recommendedAction = 'Current channel appears optimal';
                }
            }
            
            resolve(channelInfo);
        });
    });
}

/**
 * Calculate jitter from an array of ping times
 */
function calculateJitter(pings) {
    if (pings.length <= 1) return 0;
    
    let jitterSum = 0;
    for (let i = 1; i < pings.length; i++) {
        jitterSum += Math.abs(pings[i] - pings[i-1]);
    }
    
    return jitterSum / (pings.length - 1);
}

/**
 * Perform a single ping test
 */
function performPingTest() {
    return new Promise((resolve) => {
        const startTime = Date.now();
        const img = new Image();
        
        img.onload = function() {
            const pingTime = Date.now() - startTime;
            resolve(pingTime);
        };
        
        img.onerror = function() {
            resolve(null);
        };
        
        // Add random parameter to prevent caching
        const random = Math.floor(Math.random() * 10000000);
        img.src = `https://www.google.com/favicon.ico?r=${random}`;
        
        // Set timeout
        setTimeout(() => {
            resolve(null);
        }, 3000);
    });
}

/**
 * Enhanced Upload Speed Test
 * This is a simulation as a real upload test requires a server component
 */
function enhancedUploadTest() {
    return new Promise((resolve) => {
        // Simulate upload test with variable behavior based on connection quality
        const startTime = Date.now();
        const testDataSizeMB = 2; // 2MB test size
        let uploadedBytes = 0;
        const updateInterval = 100; // Update progress every 100ms
        
        // Estimate connection quality
        const connectionQuality = getEstimatedConnectionQuality();
        
        // Setup progress updates
        const totalBytes = testDataSizeMB * 1024 * 1024;
        let bytesPerInterval;
        
        // Adjust upload speed based on connection quality
        switch(connectionQuality) {
            case 'poor':
                bytesPerInterval = 50000 + (Math.random() * 20000); // ~0.5-0.7 Mbps
                break;
            case 'moderate':
                bytesPerInterval = 200000 + (Math.random() * 100000); // ~2-3 Mbps
                break;
            case 'good':
                bytesPerInterval = 500000 + (Math.random() * 250000); // ~5-7.5 Mbps
                break;
            default:
                bytesPerInterval = 200000 + (Math.random() * 100000); // Default moderate
        }
        
        // Add some variability to simulate real-world conditions
        const variabilityFactor = 0.85 + (Math.random() * 0.3); // 0.85-1.15
        bytesPerInterval *= variabilityFactor;
        
        // Create a progress indicator element
        const progressDiv = document.createElement('div');
        progressDiv.className = 'upload-progress';
        progressDiv.style.width = '100%';
        progressDiv.style.height = '5px';
        progressDiv.style.backgroundColor = '#eee';
        progressDiv.style.marginBottom = '10px';
        progressDiv.style.borderRadius = '2px';
        
        const progressBar = document.createElement('div');
        progressBar.style.width = '0%';
        progressBar.style.height = '100%';
        progressBar.style.backgroundColor = '#4CAF50';
        progressBar.style.borderRadius = '2px';
        progressBar.style.transition = 'width 0.1s';
        
        progressDiv.appendChild(progressBar);
        document.getElementById('upload-results').appendChild(progressDiv);
        
        // Run the simulated upload
        const uploadSimulation = setInterval(() => {
            uploadedBytes += bytesPerInterval;
            const percentComplete = Math.min(100, (uploadedBytes / totalBytes) * 100);
            
            // Update progress bar
            progressBar.style.width = percentComplete + '%';
            
            // Check if upload is complete
            if (uploadedBytes >= totalBytes) {
                clearInterval(uploadSimulation);
                
                // Calculate speed
                const duration = (Date.now() - startTime) / 1000; // in seconds
                const uploadedMB = uploadedBytes / (1024 * 1024);
                const speedMbps = ((uploadedMB * 8) / duration).toFixed(2);
                
                // Remove progress indicator after a delay
                setTimeout(() => {
                    try {
                        progressDiv.remove();
                    } catch (e) {
                        console.log("Progress div already removed");
                    }
                }, 500);
                
                resolve(speedMbps);
            }
        }, updateInterval);
    });
}

/**
 * Estimate connection quality based on available network info
 */
function getEstimatedConnectionQuality() {
    if (navigator.connection) {
        switch(navigator.connection.effectiveType) {
            case 'slow-2g':
            case '2g':
                return 'poor';
            case '3g':
                return 'moderate';
            case '4g':
                return 'good';
            default:
                // Fallback to ping-based estimation if effectiveType is unknown
                break;
        }
    }
    
    // If we can't determine from connection info, make a random distribution
    // weighted towards moderate connections
    const rand = Math.random();
    if (rand < 0.2) return 'poor';
    if (rand < 0.8) return 'moderate';
    return 'good';
}

/**
 * Run a simplified diagnostic test for monitoring
 */
function runMonitoringTest() {
    // Run a quick ping test
    performPingTest().then(pingTime => {
        const timestamp = new Date().toLocaleTimeString();
        
        // Add data point
        monitoringHistory.push({
            timestamp: timestamp,
            ping: pingTime || 999, // 999 indicates failed ping
            online: navigator.onLine
        });
        
        // Keep only the last 20 readings
        if (monitoringHistory.length > 20) {
            monitoringHistory.shift();
        }
        
        // Update chart and stats
        updateMonitoringChart();
        updateNetworkStatus();
    });
}

/**
 * Update the monitoring chart
 */
function updateMonitoringChart() {
    // Simple text-based chart for now
    const chartDiv = document.getElementById('monitoring-chart');
    if (!chartDiv || monitoringHistory.length === 0) return;
    
    // Create a simple ping time chart
    let chartHTML = '<div class="chart-wrapper"><h4>Ping History (ms)</h4>';
    
    // Add a simple bar chart
    chartHTML += '<div class="chart-bars">';
    
    monitoringHistory.forEach(data => {
        let barHeight = 0;
        let barClass = 'ping-bar';
        
        if (data.ping === 999) {
            // Failed ping
            barHeight = 100;
            barClass += ' ping-failed';
        } else if (data.ping > 200) {
            barHeight = 80;
            barClass += ' ping-high';
        } else if (data.ping > 100) {
            barHeight = 50;
            barClass += ' ping-medium';
        } else {
            barHeight = Math.max(10, data.ping / 2);
            barClass += ' ping-good';
        }
        
        chartHTML += `<div class="${barClass}" style="height: ${barHeight}px;" title="${data.timestamp}: ${data.ping === 999 ? 'Failed' : data.ping + 'ms'}"></div>`;
    });
    
    chartHTML += '</div>'; // End chart-bars
    
    // Add time labels
    chartHTML += '<div class="chart-labels">';
    
    // Only show a few labels to avoid crowding
    const labelIndices = [0, Math.floor(monitoringHistory.length / 2), monitoringHistory.length - 1];
    for (let i = 0; i < monitoringHistory.length; i++) {
        if (labelIndices.includes(i)) {
            chartHTML += `<div class="chart-label">${monitoringHistory[i].timestamp}</div>`;
        } else {
            chartHTML += '<div class="chart-label"></div>';
        }
    }
    
    chartHTML += '</div>'; // End chart-labels
    chartHTML += '</div>'; // End chart-wrapper
    
    chartDiv.innerHTML = chartHTML;
}

/**
 * Update the network status display
 */
function updateNetworkStatus() {
    const statsDiv = document.getElementById('monitoring-stats');
    if (!statsDiv || monitoringHistory.length === 0) return;
    
    // Calculate stats
    const lastEntry = monitoringHistory[monitoringHistory.length - 1];
    const validPings = monitoringHistory.filter(d => d.ping !== 999).map(d => d.ping);
    
    const avgPing = validPings.length > 0 
        ? validPings.reduce((sum, ping) => sum + ping, 0) / validPings.length 
        : 'N/A';
        
    const failedPings = monitoringHistory.filter(d => d.ping === 999).length;
    const failureRate = (failedPings / monitoringHistory.length * 100).toFixed(1);
    
    // Generate stats HTML
    let statsHTML = `
        <div class="monitor-stats">
            <div class="stat-item">
                <div class="stat-label">Current Status:</div>
                <div class="stat-value ${navigator.onLine ? 'good-text' : 'bad-text'}">${navigator.onLine ? 'Online' : 'Offline'}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Last Ping:</div>
                <div class="stat-value">${lastEntry.ping === 999 ? 'Failed' : lastEntry.ping + 'ms'}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Average Ping:</div>
                <div class="stat-value">${typeof avgPing === 'number' ? avgPing.toFixed(1) + 'ms' : avgPing}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Failure Rate:</div>
                <div class="stat-value ${failureRate > 10 ? 'bad-text' : 'good-text'}">${failureRate}%</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Data Points:</div>
                <div class="stat-value">${monitoringHistory.length}</div>
            </div>
        </div>
    `;
    
    statsDiv.innerHTML = statsHTML;
}

/**
 * Toggle continuous monitoring
 */
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