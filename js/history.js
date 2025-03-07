/**
 * History-related functions for the WiFi Diagnostics Tool
 */

// Function to show the history page
function showHistory() {
    // Load and display the history data
    updateHistoryPage();
    
    // Show the history page
    document.getElementById('main-page').style.display = 'none';
    document.getElementById('roadmap-page').style.display = 'none';
    document.getElementById('history-page').style.display = 'block';
}

// Function to update the history page with stored test results
function updateHistoryPage() {
    const historyContent = document.getElementById('history-content');
    const history = getTestHistory();
    
    if (history.length === 0) {
        historyContent.innerHTML = '<p>No previous test results found.</p>';
        return;
    }
    
    let historyHTML = '<div class="history-list">';
    
    history.forEach((entry, index) => {
        const date = new Date(entry.timestamp);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        
        // Extract overall status
        let statusClass = 'good';
        if (entry.results.warnings > 0) statusClass = 'warning';
        if (entry.results.errors > 0) statusClass = 'bad';
        
        historyHTML += `
        <div class="history-item ${statusClass}" data-index="${index}">
            <strong>${formattedDate}</strong>: 
            ${entry.results.errors > 0 ? 'Issues detected' : 'No issues detected'}
            <div class="history-details">
                <p>Warnings: ${entry.results.warnings}</p>
                <p>Errors: ${entry.results.errors}</p>
            </div>
            <div class="history-test-details" id="test-details-${index}"></div>
        </div>`;
    });
    
    historyHTML += '</div>';
    
    // Add a clear history button
    historyHTML += `
    <div style="margin-top: 20px;">
        <button id="clear-history-button" class="back-button">Clear History</button>
    </div>`;
    
    historyContent.innerHTML = historyHTML;
    
    // Add event listener to the clear history button
    document.getElementById('clear-history-button').addEventListener('click', clearHistory);
    
    // Add click event listeners to history items
    document.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            showTestDetails(index);
        });
    });
}

// Function to show detailed test results for a history item
function showTestDetails(index) {
    const history = getTestHistory();
    const entry = history[index];
    const detailsContainer = document.getElementById(`test-details-${index}`);
    
    // Toggle visibility
    if (detailsContainer.style.display === 'block') {
        detailsContainer.style.display = 'none';
        return;
    }
    
    // Hide all other test details
    document.querySelectorAll('.history-test-details').forEach(container => {
        container.style.display = 'none';
    });
    
    // If no detailed test information is available
    if (!entry.results.details || entry.results.details.length === 0) {
        detailsContainer.innerHTML = '<p>Detailed test information is not available for this entry.</p>';
        detailsContainer.style.display = 'block';
        return;
    }
    
    // Build HTML for test details
    let detailsHTML = '<h3>Test Details</h3>';
    
    entry.results.details.forEach(test => {
        detailsHTML += `
        <div class="test-detail-item ${test.status}">
            <strong>${test.name}</strong>: ${test.result}
        </div>`;
    });
    
    detailsContainer.innerHTML = detailsHTML;
    detailsContainer.style.display = 'block';
}

// Function to clear all test history
function clearHistory() {
    if (confirm('Are you sure you want to clear your test history?')) {
        localStorage.removeItem('wifiDiagnosticsHistory');
        updateHistoryPage();
    }
}

// Function to save test results to localStorage
function saveTestResults(results) {
    // Get existing history or initialize empty array
    let testHistory = JSON.parse(localStorage.getItem('wifiDiagnosticsHistory') || '[]');
    
    // Add new test results with timestamp
    const newEntry = {
        timestamp: new Date().toISOString(),
        results: results
    };
    
    // Add to beginning of array (most recent first)
    testHistory.unshift(newEntry);
    
    // Limit history to last 10 tests
    if (testHistory.length > 10) {
        testHistory = testHistory.slice(0, 10);
    }
    
    // Save back to localStorage
    localStorage.setItem('wifiDiagnosticsHistory', JSON.stringify(testHistory));
}

// Function to get test history from localStorage
function getTestHistory() {
    return JSON.parse(localStorage.getItem('wifiDiagnosticsHistory') || '[]');
} 