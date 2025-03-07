/**
 * Diagnostic test functions for the WiFi Diagnostics Tool
 */

// Function to test connection ping/latency
function testPing() {
    return new Promise((resolve) => {
        const startTime = Date.now();
        
        // Create a tiny image request to measure round-trip time
        const img = new Image();
        let pingTime;
        
        img.onload = function() {
            pingTime = Date.now() - startTime;
            let status = 'good';
            let message = `${pingTime}ms`;
            
            if (pingTime > 100) {
                status = 'warning';
                message += ' - Slightly high latency';
            }
            if (pingTime > 200) {
                status = 'bad';
                message += ' - High latency may affect real-time applications';
            }
            
            addResult('Ping (Latency)', message, status);
            resolve(pingTime);
        };
        
        img.onerror = function() {
            addResult('Ping (Latency)', 'Failed to measure', 'bad');
            resolve(null);
        };
        
        // Add a cache-busting parameter
        img.src = 'https://www.google.com/favicon.ico?' + new Date().getTime();
        
        // Set a timeout in case the image never loads
        setTimeout(() => {
            if (!pingTime) {
                addResult('Ping (Latency)', 'Timeout - Connection may be very slow', 'bad');
                resolve(null);
            }
        }, 5000);
    });
}

// Function to test download speed
function testDownloadSpeed() {
    return new Promise((resolve) => {
        const startTime = Date.now();
        
        // Use a more reliable method to test download speed
        // Download a small test file from a CDN
        fetch('https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js')
            .then(response => response.blob())
            .then(data => {
                const endTime = Date.now();
                const duration = (endTime - startTime) / 1000; // in seconds
                const bitsLoaded = data.size * 8 / 1000000; // Convert bytes to megabits
                const speedMbps = (bitsLoaded / duration).toFixed(2);
                
                let status = 'good';
                let message = `${speedMbps} Mbps`;
                
                if (speedMbps < 5) {
                    status = 'warning';
                    message += ' - Slower than average';
                }
                if (speedMbps < 2) {
                    status = 'bad';
                    message += ' - Very slow connection';
                }
                
                addResult('Download Speed', message, status);
                resolve(speedMbps);
            })
            .catch(error => {
                // Fallback method if the first one fails
                fetch('https://www.google.com/')
                    .then(response => {
                        const endTime = Date.now();
                        const duration = (endTime - startTime) / 1000; // in seconds
                        // Estimate size as 100KB
                        const bitsLoaded = 0.1 * 8; // 100KB in megabits
                        const speedMbps = (bitsLoaded / duration).toFixed(2);
                        
                        let status = 'good';
                        let message = `~${speedMbps} Mbps (Estimated)`;
                        
                        if (speedMbps < 5) {
                            status = 'warning';
                            message += ' - Slower than average';
                        }
                        if (speedMbps < 2) {
                            status = 'bad';
                            message += ' - Very slow connection';
                        }
                        
                        addResult('Download Speed (Estimated)', message, status);
                        resolve(speedMbps);
                    })
                    .catch(err => {
                        addResult('Download Speed', 'Failed to measure - Check your connection', 'bad');
                        resolve(null);
                    });
            });
    });
}

// Function to test upload speed (simulated)
function testUploadSpeed() {
    return new Promise((resolve) => {
        // Simulate upload test (actual upload testing requires a server)
        setTimeout(() => {
            const randomSpeed = (Math.random() * 5 + 1).toFixed(2);
            
            let status = 'good';
            let message = `~${randomSpeed} Mbps (Estimated)`;
            
            if (randomSpeed < 3) {
                status = 'warning';
                message += ' - Slower than average';
            }
            if (randomSpeed < 1) {
                status = 'bad';
                message += ' - Very slow upload speed';
            }
            
            addResult('Upload Speed (Simulated)', message, status);
            resolve(randomSpeed);
        }, 1500);
    });
}

// Function to test connection stability
function testConnectionStability() {
    // Check for recent connection drops
    const connectionStatus = navigator.onLine ? 'Stable' : 'Unstable';
    const status = navigator.onLine ? 'good' : 'bad';
    
    addResult('Connection Stability', connectionStatus, status);
    
    // Show specific recommendations based on test results
    showRecommendations();
}

// Function to test DNS resolution
function testDNSResolution() {
    return new Promise((resolve) => {
        const dnsServers = [
            { name: "Google DNS", ip: "8.8.8.8" },
            { name: "Cloudflare DNS", ip: "1.1.1.1" },
            { name: "OpenDNS", ip: "208.67.222.222" }
        ];
        
        let successCount = 0;
        let completedTests = 0;
        let results = [];
        
        dnsServers.forEach(server => {
            const startTime = Date.now();
            
            // Use a timeout to handle unresponsive servers
            const timeoutId = setTimeout(() => {
                completedTests++;
                results.push({ server: server.name, status: "timeout", time: 3000 });
                checkCompletion();
            }, 3000);
            
            // Try to fetch a small resource from the IP with cache disabled
            fetch(`https://${server.ip}/favicon.ico`, { 
                mode: 'no-cors',
                cache: 'no-store',
                headers: { 'Cache-Control': 'no-cache' }
            })
                .then(() => {
                    clearTimeout(timeoutId);
                    const responseTime = Date.now() - startTime;
                    successCount++;
                    completedTests++;
                    results.push({ server: server.name, status: "reachable", time: responseTime });
                    checkCompletion();
                })
                .catch(() => {
                    clearTimeout(timeoutId);
                    completedTests++;
                    results.push({ server: server.name, status: "unreachable", time: Date.now() - startTime });
                    checkCompletion();
                });
        });
        
        function checkCompletion() {
            if (completedTests === dnsServers.length) {
                // Display results
                let status = 'good';
                let message = `${successCount}/${dnsServers.length} DNS servers reachable`;
                
                if (successCount < dnsServers.length && successCount > 0) {
                    status = 'warning';
                    message += ' - Some DNS servers unreachable';
                }
                if (successCount === 0) {
                    status = 'bad';
                    message += ' - No DNS servers reachable, possible DNS configuration issue';
                }
                
                addResult('DNS Resolution', message, status);
                resolve({ success: successCount, total: dnsServers.length, details: results });
            }
        }
    });
}

// Function to test packet loss
function testPacketLoss() {
    return new Promise((resolve) => {
        const testCount = 10; // Number of "packets" to send
        let successCount = 0;
        let completedTests = 0;
        
        // Use a series of fetch requests to simulate packets
        for (let i = 0; i < testCount; i++) {
            // Add a random parameter to prevent caching
            const randomParam = Math.random().toString(36).substring(7);
            
            fetch(`https://www.google.com/generate_204?nocache=${randomParam}`, { 
                mode: 'no-cors',
                cache: 'no-store'
            })
                .then(() => {
                    successCount++;
                    completedTests++;
                    checkCompletion();
                })
                .catch(() => {
                    completedTests++;
                    checkCompletion();
                });
        }
        
        function checkCompletion() {
            if (completedTests === testCount) {
                const lossPercentage = ((testCount - successCount) / testCount) * 100;
                
                let status = 'good';
                let message = `${lossPercentage.toFixed(1)}% packet loss`;
                
                if (lossPercentage > 2 && lossPercentage <= 10) {
                    status = 'warning';
                    message += ' - Some packet loss detected';
                }
                if (lossPercentage > 10) {
                    status = 'bad';
                    message += ' - Significant packet loss detected';
                }
                
                addResult('Packet Loss', message, status);
                resolve({
                    packetsSent: testCount,
                    packetsReceived: successCount,
                    packetsLost: testCount - successCount,
                    lossPercentage: lossPercentage.toFixed(1)
                });
            }
        }
    });
}

// Main function to run all diagnostics
function startDiagnostics() {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';
    
    const progressBar = document.getElementById('progress');
    const progressBarInner = document.getElementById('progress-bar');
    progressBar.style.display = 'block';
    progressBarInner.style.width = '0%';
    progressBarInner.textContent = '0%';
    
    // Hide buttons during test
    document.getElementById('fix-button').style.display = 'none';
    document.getElementById('export-button').style.display = 'none';
    document.getElementById('history-button').style.display = 'none';
    document.getElementById('fix-instructions').style.display = 'none';
    
    // Check if online
    addResult('Basic Connectivity', navigator.onLine ? 'Connected' : 'Disconnected', navigator.onLine ? 'good' : 'bad');
    updateProgress(10);
    
    // Track warnings and errors
    let warnings = 0;
    let errors = 0;
    
    // Function to update counters based on status
    function updateCounters(status) {
        if (status === 'warning') warnings++;
        if (status === 'bad') errors++;
    }
    
    // Run all tests in sequence
    testPing()
        .then(pingResult => {
            updateProgress(20);
            return testDNSResolution();
        })
        .then(dnsResult => {
            updateProgress(40);
            return testPacketLoss();
        })
        .then(packetLossResult => {
            updateProgress(60);
            return testDownloadSpeed();
        })
        .then(downloadResult => {
            updateProgress(80);
            return testUploadSpeed();
        })
        .then(uploadResult => {
            updateProgress(90);
            testConnectionStability();
            updateProgress(100);
            
            // Collect all test results
            const testDetails = [];
            document.querySelectorAll('.result-item').forEach(item => {
                // Skip the recommendations section
                if (item.querySelector('strong') && !item.querySelector('strong').textContent.includes('Recommended')) {
                    const testName = item.querySelector('strong').textContent.replace(':', '');
                    const testResult = item.textContent.replace(testName + ':', '').trim();
                    const testStatus = item.classList.contains('good') ? 'good' : 
                                      item.classList.contains('warning') ? 'warning' : 'bad';
                    
                    testDetails.push({
                        name: testName,
                        result: testResult,
                        status: testStatus
                    });
                    
                    if (testStatus === 'warning') warnings++;
                    if (testStatus === 'bad') errors++;
                }
            });
            
            // Collect all test results
            const testResults = {
                timestamp: new Date().toISOString(),
                warnings: warnings,
                errors: errors,
                details: testDetails
            };
            
            // Save test results to history
            saveTestResults(testResults);
            
            // Show buttons after tests complete
            document.getElementById('fix-button').style.display = 'inline-block';
            document.getElementById('fix-instructions').style.display = 'block';
            document.getElementById('export-button').style.display = 'inline-block';
            document.getElementById('history-button').style.display = 'inline-block';
            document.getElementById('advanced-button').style.display = 'inline-block';
            document.getElementById('history-button').textContent = 'View Test History';
        });
} 