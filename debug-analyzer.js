// Financial Dashboard - Code Analysis & Debugging Utility
// This file helps debug and analyze the application

class FinancialDashboardDebugger {
    constructor() {
        this.logLevel = 'INFO';
        this.errors = [];
        this.warnings = [];
        this.info = [];
        this.performanceMetrics = {};
    }

    // Initialize debugging
    init() {
        this.log('INFO', 'Financial Dashboard Debugger initialized');
        this.setupErrorHandling();
        this.analyzeCode();
        this.checkDependencies();
        this.validateData();
        this.performanceMonitoring();
    }

    // Centralized logging
    log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            data
        };

        switch(level) {
            case 'ERROR':
                this.errors.push(logEntry);
                console.error(`🔴 [${timestamp}] ERROR: ${message}`, data);
                break;
            case 'WARN':
                this.warnings.push(logEntry);
                console.warn(`🟡 [${timestamp}] WARN: ${message}`, data);
                break;
            case 'INFO':
                this.info.push(logEntry);
                console.info(`🔵 [${timestamp}] INFO: ${message}`, data);
                break;
        }
    }

    // Setup global error handling
    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            this.log('ERROR', 'JavaScript Error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.log('ERROR', 'Unhandled Promise Rejection', {
                reason: event.reason
            });
        });
    }

    // Analyze code structure and potential issues
    analyzeCode() {
        this.log('INFO', 'Starting code analysis...');

        // Check if required functions exist
        const requiredFunctions = [
            'checkAuthentication',
            'addNewRow',
            'openCustomerSearch',
            'selectCustomer',
            'saveBatch',
            'loadBatchHistory'
        ];

        requiredFunctions.forEach(funcName => {
            if (typeof window[funcName] === 'function') {
                this.log('INFO', `✓ Function '${funcName}' exists`);
            } else {
                this.log('ERROR', `✗ Function '${funcName}' is missing`);
            }
        });

        // Check DOM elements
        const requiredElements = [
            'batchEntryBody',
            'customerSearchModal',
            'batchHistoryBody',
            'totalEntries'
        ];

        requiredElements.forEach(elementId => {
            const element = document.getElementById(elementId);
            if (element) {
                this.log('INFO', `✓ Element '${elementId}' exists`);
            } else {
                this.log('ERROR', `✗ Element '${elementId}' is missing`);
            }
        });
    }

    // Check dependencies
    checkDependencies() {
        this.log('INFO', 'Checking dependencies...');

        // Check localStorage availability
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            this.log('INFO', '✓ localStorage is available');
        } catch (e) {
            this.log('ERROR', '✗ localStorage is not available', e);
        }

        // Check if required CSS classes exist
        const requiredClasses = [
            '.excel-table',
            '.modal',
            '.batch-controls',
            '.excel-input'
        ];

        requiredClasses.forEach(className => {
            const elements = document.querySelectorAll(className);
            if (elements.length > 0) {
                this.log('INFO', `✓ CSS class '${className}' is applied to ${elements.length} element(s)`);
            } else {
                this.log('WARN', `⚠ CSS class '${className}' not found in DOM`);
            }
        });
    }

    // Validate data integrity
    validateData() {
        this.log('INFO', 'Validating data integrity...');

        try {
            // Check customers data
            const customersData = JSON.parse(localStorage.getItem('customersData') || '[]');
            if (customersData.length > 0) {
                this.log('INFO', `✓ Found ${customersData.length} customers in storage`);
                
                // Validate customer structure
                customersData.forEach((customer, index) => {
                    const requiredFields = ['id', 'name', 'accountNumber', 'balance'];
                    requiredFields.forEach(field => {
                        if (!customer.hasOwnProperty(field)) {
                            this.log('WARN', `⚠ Customer ${index} missing field: ${field}`);
                        }
                    });
                });
            } else {
                this.log('WARN', '⚠ No customers data found in storage');
            }

            // Check batch transactions
            const batchTransactions = JSON.parse(localStorage.getItem('batchTransactions') || '[]');
            this.log('INFO', `Found ${batchTransactions.length} batch transactions in storage`);

        } catch (e) {
            this.log('ERROR', 'Data validation failed', e);
        }
    }

    // Performance monitoring
    performanceMonitoring() {
        this.log('INFO', 'Setting up performance monitoring...');

        // Monitor page load time
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            this.performanceMetrics.pageLoadTime = loadTime;
            this.log('INFO', `Page loaded in ${loadTime.toFixed(2)}ms`);
        });

        // Monitor function execution times
        this.wrapFunction('addNewRow', window.addNewRow);
        this.wrapFunction('saveBatch', window.saveBatch);
        this.wrapFunction('searchCustomers', window.searchCustomers);
    }

    // Wrap functions for performance monitoring
    wrapFunction(name, originalFunction) {
        if (typeof originalFunction === 'function') {
            window[name] = (...args) => {
                const startTime = performance.now();
                const result = originalFunction.apply(this, args);
                const endTime = performance.now();
                const executionTime = endTime - startTime;
                
                this.performanceMetrics[name] = executionTime;
                this.log('INFO', `Function '${name}' executed in ${executionTime.toFixed(2)}ms`);
                
                return result;
            };
        }
    }

    // Get debugging report
    getReport() {
        return {
            summary: {
                errors: this.errors.length,
                warnings: this.warnings.length,
                info: this.info.length
            },
            errors: this.errors,
            warnings: this.warnings,
            performanceMetrics: this.performanceMetrics,
            timestamp: new Date().toISOString()
        };
    }

    // Display debugging info on page
    displayDebugInfo() {
        const debugPanel = document.createElement('div');
        debugPanel.id = 'debug-panel';
        debugPanel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 300px;
            max-height: 400px;
            background: #2c3e50;
            color: white;
            padding: 15px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            overflow-y: auto;
            z-index: 10000;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;

        const report = this.getReport();
        debugPanel.innerHTML = `
            <h4 style="margin: 0 0 10px 0; color: #3498db;">🔧 Debug Panel</h4>
            <div style="margin: 5px 0;">
                <span style="color: #e74c3c;">Errors: ${report.summary.errors}</span> |
                <span style="color: #f39c12;">Warnings: ${report.summary.warnings}</span> |
                <span style="color: #27ae60;">Info: ${report.summary.info}</span>
            </div>
            <hr style="border: 1px solid #34495e; margin: 10px 0;">
            <div style="max-height: 200px; overflow-y: auto;">
                ${this.formatLogEntries()}
            </div>
            <button onclick="document.getElementById('debug-panel').remove()" 
                    style="margin-top: 10px; padding: 5px 10px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Close
            </button>
        `;

        document.body.appendChild(debugPanel);
    }

    // Format log entries for display
    formatLogEntries() {
        const allLogs = [...this.errors, ...this.warnings, ...this.info]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 10);

        return allLogs.map(log => {
            const color = log.level === 'ERROR' ? '#e74c3c' : 
                         log.level === 'WARN' ? '#f39c12' : '#27ae60';
            return `<div style="margin: 3px 0; color: ${color};">
                [${log.level}] ${log.message}
            </div>`;
        }).join('');
    }

    // Test specific functionality
    testFunctionality() {
        this.log('INFO', 'Running functionality tests...');

        // Test local storage
        try {
            const testData = { test: 'value' };
            localStorage.setItem('debugTest', JSON.stringify(testData));
            const retrieved = JSON.parse(localStorage.getItem('debugTest'));
            if (retrieved.test === 'value') {
                this.log('INFO', '✓ LocalStorage read/write test passed');
            }
            localStorage.removeItem('debugTest');
        } catch (e) {
            this.log('ERROR', '✗ LocalStorage test failed', e);
        }

        // Test DOM manipulation
        try {
            const testElement = document.createElement('div');
            testElement.id = 'debug-test-element';
            document.body.appendChild(testElement);
            
            if (document.getElementById('debug-test-element')) {
                this.log('INFO', '✓ DOM manipulation test passed');
                document.body.removeChild(testElement);
            }
        } catch (e) {
            this.log('ERROR', '✗ DOM manipulation test failed', e);
        }
    }
}

// Initialize debugger when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.debugger = new FinancialDashboardDebugger();
    window.debugger.init();
    
    // Add debug keyboard shortcut (Ctrl+Shift+D)
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            e.preventDefault();
            window.debugger.displayDebugInfo();
        }
    });
    
    // Add debug button to page
    setTimeout(() => {
        const debugBtn = document.createElement('button');
        debugBtn.innerHTML = '🔧 Debug';
        debugBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 10px 15px;
            background: #e74c3c;
            color: white;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            z-index: 9999;
            font-weight: bold;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        debugBtn.onclick = () => window.debugger.displayDebugInfo();
        document.body.appendChild(debugBtn);
    }, 1000);
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FinancialDashboardDebugger;
}
