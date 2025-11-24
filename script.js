// SSL Watchdog - Main Application Script

/*
 * API Configuration
 * 
 * RapidAPI SSL Certificate Checker API
 * Endpoint: https://check-ssl.p.rapidapi.com/sslcheck
 * Host: check-ssl.p.rapidapi.com
 * 
 * API Key: [PROVIDED IN SUBMISSION COMMENTS - NOT STORED IN CODE]
 * 
 * Note: API key is not stored in source code for security reasons.
 * The API key will be provided in the submission comments section.
 * Users can also provide their own RapidAPI key through the Settings modal.
 * 
 * To use your own API key:
 * 1. Sign up at https://rapidapi.com
 * 2. Subscribe to the SSL Certificate Checker API
 * 3. Get your API key from the RapidAPI dashboard
 * 4. Enter it in the Settings modal
 */

// Configuration
const CONFIG = {
    API_BASE_URL: 'https://check-ssl.p.rapidapi.com/sslcheck',
    DEFAULT_API_KEY: '', // API key provided in submission comments section
    API_HOST: 'check-ssl.p.rapidapi.com',
    STORAGE_KEYS: {
        HISTORY: 'sslWatchdogHistory',
        SETTINGS: 'sslWatchdogSettings',
        THEME: 'sslWatchdogTheme'
    },
    EXPIRING_THRESHOLD_DAYS: 30
};

// State Management
let state = {
    history: [],
    filteredHistory: [],
    currentSort: 'recent',
    currentFilters: {
        search: ''
    },
    apiKey: CONFIG.DEFAULT_API_KEY
};

// DOM Elements - will be initialized after DOM loads
let elements = {};

// Initialize DOM Elements
function initElements() {
    elements = {
        domainInput: document.getElementById('domainInput'),
        searchBtn: document.getElementById('searchBtn'),
        errorContainer: document.getElementById('errorContainer'),
        loadingIndicator: document.getElementById('loadingIndicator'),
        resultsContainer: document.getElementById('resultsContainer'),
        historyList: document.getElementById('historyList'),
        historySearch: document.getElementById('historySearch'),
        historyPanel: document.getElementById('historyPanel'),
        historyPanelOverlay: document.getElementById('historyPanelOverlay'),
        closeHistoryPanel: document.getElementById('closeHistoryPanel'),
        clearHistoryBtn: document.getElementById('clearHistoryBtn'),
        historyBtn: document.getElementById('historyBtn'),
        sortButtons: null, // Will be set after DOM loads
        settingsBtn: document.getElementById('settingsBtn'),
        settingsModal: document.getElementById('settingsModal'),
        closeSettingsBtn: document.getElementById('closeSettingsBtn'),
        apiKeyInput: document.getElementById('apiKeyInput'),
        saveSettingsBtn: document.getElementById('saveSettingsBtn'),
        darkModeToggle: document.getElementById('darkModeToggle'),
        darkModeText: document.getElementById('darkModeText'),
        aboutBtn: document.getElementById('aboutBtn'),
        aboutModal: document.getElementById('aboutModal'),
        closeAboutBtn: document.getElementById('closeAboutBtn')
    };
}

// Initialize Application
function init() {
    initElements();
    
    // Check if all required elements exist
    if (!elements.domainInput || !elements.searchBtn) {
        console.error('Required DOM elements not found');
        return;
    }
    
    loadHistory();
    loadSettings();
    loadTheme();
    setupEventListeners();
    
    // Initialize sort buttons after event listeners are set up
    elements.sortButtons = document.querySelectorAll('.sort-btn');
    setActiveSort(state.currentSort);
    
    applyFilters();
    renderHistory();
}

// Event Listeners Setup
function setupEventListeners() {
    // Search functionality
    elements.searchBtn.addEventListener('click', handleSearch);
    elements.domainInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    // History button in header
    if (elements.historyBtn) {
        elements.historyBtn.addEventListener('click', () => {
            openHistoryPanel();
        });
    }

    // Sort buttons in sidebar - use event delegation
    if (elements.historyPanel) {
        elements.historyPanel.addEventListener('click', (e) => {
            const sortBtn = e.target.closest('.sort-btn');
            if (sortBtn) {
                e.preventDefault();
                e.stopPropagation();
                const sortType = sortBtn.dataset.sort;
                if (sortType) {
                    setActiveSort(sortType);
                    state.currentSort = sortType;
                    applyFilters();
                }
            }
        });
    }

    // Close history panel
    if (elements.closeHistoryPanel) {
        elements.closeHistoryPanel.addEventListener('click', () => {
            closeHistoryPanel();
        });
    }

    if (elements.historyPanelOverlay) {
        elements.historyPanelOverlay.addEventListener('click', () => {
            closeHistoryPanel();
        });
    }

    // History search
    if (elements.historySearch) {
        elements.historySearch.addEventListener('input', (e) => {
            state.currentFilters.search = e.target.value.toLowerCase();
            applyFilters();
        });
    }

    // Clear history
    if (elements.clearHistoryBtn) {
        elements.clearHistoryBtn.addEventListener('click', clearHistory);
    }

    // About modal
    elements.aboutBtn.addEventListener('click', () => {
        elements.aboutModal.classList.remove('hidden');
    });

    elements.closeAboutBtn.addEventListener('click', () => {
        elements.aboutModal.classList.add('hidden');
    });

    elements.aboutModal.addEventListener('click', (e) => {
        if (e.target === elements.aboutModal) {
            elements.aboutModal.classList.add('hidden');
        }
    });

    // Settings modal
    elements.settingsBtn.addEventListener('click', () => {
        elements.settingsModal.classList.remove('hidden');
        elements.apiKeyInput.value = state.apiKey === CONFIG.DEFAULT_API_KEY ? '' : state.apiKey;
        // Update toggle state
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        elements.darkModeToggle.checked = currentTheme === 'dark';
        updateDarkModeText(currentTheme);
    });

    elements.closeSettingsBtn.addEventListener('click', () => {
        elements.settingsModal.classList.add('hidden');
    });

    elements.saveSettingsBtn.addEventListener('click', saveSettings);

    // Close modal on outside click
    elements.settingsModal.addEventListener('click', (e) => {
        if (e.target === elements.settingsModal) {
            elements.settingsModal.classList.add('hidden');
        }
    });

    // Dark mode toggle in settings
    if (elements.darkModeToggle) {
        elements.darkModeToggle.addEventListener('change', (e) => {
            toggleDarkMode();
        });
    }
}

// Domain Validation
function validateDomain(domain) {
    if (!domain || domain.trim() === '') {
        return { valid: false, error: 'Please enter a domain name.' };
    }

    const trimmedDomain = domain.trim().toLowerCase();
    
    // Remove protocol if present
    const cleanDomain = trimmedDomain.replace(/^https?:\/\//, '').replace(/^www\./, '');
    
    // Basic domain validation
    const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
    
    if (!domainRegex.test(cleanDomain)) {
        return { valid: false, error: 'Please enter a valid domain name (e.g., example.com).' };
    }

    return { valid: true, domain: cleanDomain };
}

// API Call
async function fetchSSLCertificate(domain) {
    const url = `${CONFIG.API_BASE_URL}?domain=${encodeURIComponent(domain)}`;
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-rapidapi-host': CONFIG.API_HOST,
                'x-rapidapi-key': state.apiKey
            }
        });

        if (!response.ok) {
            if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please try again later.');
            }
            if (response.status === 401 || response.status === 403) {
                throw new Error('Invalid API key. Please check your settings.');
            }
            if (response.status >= 500) {
                throw new Error('Server error. Please try again later.');
            }
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        // Check if API returned an error in the response
        if (data.error === true || (data.status && data.status !== 'success')) {
            throw new Error(data.message || 'Failed to retrieve SSL certificate data.');
        }

        return data;
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Network error. Please check your internet connection.');
        }
        throw error;
    }
}

// Determine Certificate Status
function determineStatus(validFrom, validTo) {
    if (!validFrom || !validTo) {
        return { status: 'unknown', daysRemaining: null };
    }

    const now = new Date();
    const expiryDate = new Date(validTo);
    const daysRemaining = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) {
        return { status: 'expired', daysRemaining: Math.abs(daysRemaining) };
    } else if (daysRemaining <= CONFIG.EXPIRING_THRESHOLD_DAYS) {
        return { status: 'expiring', daysRemaining };
    } else {
        return { status: 'valid', daysRemaining };
    }
}

// Handle Search
async function handleSearch() {
    const domainInput = elements.domainInput.value;
    const validation = validateDomain(domainInput);

    if (!validation.valid) {
        showError(validation.error);
        return;
    }

    const domain = validation.domain;
    hideError();
    showLoading();

    try {
        const data = await fetchSSLCertificate(domain);
        
        // Process and save result
        const result = processAPIResponse(domain, data);
        addToHistory(result);
        saveHistory();
        
        // Display result
        displayResult(result);
        
        // Update history dropdown
        applyFilters();
        
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

// Process API Response
function processAPIResponse(domain, apiData) {
    // Extract data from the actual API response structure
    const validFrom = apiData.validFromDate || apiData.validFrom || null;
    const validTo = apiData.expiry || apiData.validTo || null;
    const issuer = apiData.issuer || apiData.issuerDetails || 'Unknown';
    const daysLeft = apiData.daysLeft !== undefined ? apiData.daysLeft : null;
    const isExpired = apiData.isExpired || false;
    const isValidCertificate = apiData.isvalidCertificate !== undefined ? apiData.isvalidCertificate : true;
    const isWildCard = apiData.isWildCard || false;
    const canBeSelfSigned = apiData.canBeSelfSigned || false;
    const message = apiData.message || '';
    const lifespanInDays = apiData.lifespanInDays || null;
    const port = apiData.port || '443';
    const originalUrl = apiData.original_url || domain;
    const finalUrl = apiData.final_url || domain;
    
    // Determine status based on API data
    let status = 'valid';
    if (isExpired) {
        status = 'expired';
    } else if (daysLeft !== null && daysLeft <= CONFIG.EXPIRING_THRESHOLD_DAYS) {
        status = 'expiring';
    } else if (!isValidCertificate) {
        status = 'expired';
    }
    
    return {
        domain: finalUrl || domain,
        issuer: issuer,
        validFrom: validFrom,
        validTo: validTo,
        daysRemaining: daysLeft,
        status: status,
        isExpired: isExpired,
        isValidCertificate: isValidCertificate,
        isWildCard: isWildCard,
        canBeSelfSigned: canBeSelfSigned,
        message: message,
        lifespanInDays: lifespanInDays,
        port: port,
        originalUrl: originalUrl,
        finalUrl: finalUrl,
        timestamp: new Date().toISOString(),
        rawData: apiData
    };
}

// Display Result
function displayResult(result) {
    const statusClass = result.status === 'valid' ? 'valid' : 
                       result.status === 'expiring' ? 'expiring' : 'expired';
    
    const statusText = result.status === 'valid' ? 'Valid' : 
                      result.status === 'expiring' ? 'Expiring Soon' : 'Expired';
    
    const statusIcon = result.status === 'valid' ? 'fa-check-circle' : 
                      result.status === 'expiring' ? 'fa-exclamation-triangle' : 'fa-times-circle';
    
    const daysText = result.daysRemaining !== null ? 
        (result.status === 'expired' ? 
            `${result.daysRemaining} days ago` : 
            `${result.daysRemaining} days remaining`) : 
        'N/A';

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            // Handle different date formats
            let date;
            if (dateString.includes(' ')) {
                // Format: "2025-11-06 00:00:00"
                date = new Date(dateString);
            } else if (dateString.includes('-') && dateString.length === 10) {
                // Format: "2026-09-21"
                date = new Date(dateString + 'T00:00:00');
            } else {
                date = new Date(dateString);
            }
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    const resultHTML = `
        <div class="result-card" data-domain="${escapeHtml(result.domain)}">
            <div class="result-card-header">
                <div>
                    <div class="result-card-title">
                        <i class="fas fa-globe"></i>
                        ${escapeHtml(result.domain)}
                    </div>
                    <span class="status-badge ${statusClass}">
                        <i class="fas ${statusIcon}"></i>
                        ${statusText}
                    </span>
                </div>
                <div class="result-card-actions">
                    <button class="btn-icon-small" onclick="copyToClipboard('${escapeHtml(result.domain)}')" title="Copy Domain">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="btn-icon-small" onclick="removeFromHistory('${escapeHtml(result.domain)}')" title="Remove">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="result-details">
                <div class="result-detail-item">
                    <span class="result-detail-label">Status</span>
                    <span class="result-detail-value">${escapeHtml(result.message || statusText)}</span>
                </div>
                <div class="result-detail-item">
                    <span class="result-detail-label">Valid Certificate</span>
                    <span class="result-detail-value ${result.isValidCertificate ? 'highlight' : ''}">
                        ${result.isValidCertificate ? 'Yes' : 'No'}
                    </span>
                </div>
                <div class="result-detail-item">
                    <span class="result-detail-label">Issuer</span>
                    <span class="result-detail-value">${escapeHtml(result.issuer)}</span>
                </div>
                <div class="result-detail-item">
                    <span class="result-detail-label">Valid From</span>
                    <span class="result-detail-value">${formatDate(result.validFrom)}</span>
                </div>
                <div class="result-detail-item">
                    <span class="result-detail-label">Expiry Date</span>
                    <span class="result-detail-value">${formatDate(result.validTo)}</span>
                </div>
                <div class="result-detail-item">
                    <span class="result-detail-label">Days Left</span>
                    <span class="result-detail-value highlight">${result.daysRemaining !== null ? result.daysRemaining : 'N/A'}</span>
                </div>
                <div class="result-detail-item">
                    <span class="result-detail-label">Lifespan (Days)</span>
                    <span class="result-detail-value">${result.lifespanInDays !== null ? result.lifespanInDays : 'N/A'}</span>
                </div>
                <div class="result-detail-item">
                    <span class="result-detail-label">Wildcard</span>
                    <span class="result-detail-value">${result.isWildCard ? 'Yes' : 'No'}</span>
                </div>
                <div class="result-detail-item">
                    <span class="result-detail-label">Can Be Self-Signed</span>
                    <span class="result-detail-value">${result.canBeSelfSigned ? 'Yes' : 'No'}</span>
                </div>
                <div class="result-detail-item">
                    <span class="result-detail-label">Port</span>
                    <span class="result-detail-value">${escapeHtml(result.port)}</span>
                </div>
                <div class="result-detail-item">
                    <span class="result-detail-label">Original URL</span>
                    <span class="result-detail-value">${escapeHtml(result.originalUrl)}</span>
                </div>
                <div class="result-detail-item">
                    <span class="result-detail-label">Final URL</span>
                    <span class="result-detail-value">${escapeHtml(result.finalUrl)}</span>
                </div>
            </div>
        </div>
    `;

    elements.resultsContainer.innerHTML = resultHTML;
}

// History Management
function addToHistory(result) {
    // Remove existing entry for this domain
    state.history = state.history.filter(item => item.domain !== result.domain);
    
    // Add new entry at the beginning
    state.history.unshift(result);
    
    // Limit history to 100 items
    if (state.history.length > 100) {
        state.history = state.history.slice(0, 100);
    }
}

function loadHistory() {
    try {
        const stored = localStorage.getItem(CONFIG.STORAGE_KEYS.HISTORY);
        if (stored) {
            state.history = JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error loading history:', error);
        state.history = [];
    }
}

function saveHistory() {
    try {
        localStorage.setItem(CONFIG.STORAGE_KEYS.HISTORY, JSON.stringify(state.history));
    } catch (error) {
        console.error('Error saving history:', error);
    }
}

function clearHistory() {
    if (confirm('Are you sure you want to clear all search history?')) {
        state.history = [];
        state.filteredHistory = [];
        saveHistory();
        renderHistory();
        elements.historySearch.value = '';
        state.currentFilters.search = '';
        elements.resultsContainer.innerHTML = `
            <div class="welcome-message">
                <i class="fas fa-shield-alt"></i>
                <h2>Welcome to SSL Watchdog</h2>
                <p>Enter a domain name above to check its SSL certificate status.</p>
            </div>
        `;
    }
}

function removeFromHistory(domain) {
    state.history = state.history.filter(item => item.domain !== domain);
    saveHistory();
    applyFilters();
    
    // Clear results if this was the displayed domain
    const currentResult = elements.resultsContainer.querySelector(`[data-domain="${domain}"]`);
    if (currentResult) {
        elements.resultsContainer.innerHTML = `
            <div class="welcome-message">
                <i class="fas fa-shield-alt"></i>
                <h2>Welcome to SSL Watchdog</h2>
                <p>Enter a domain name above to check its SSL certificate status.</p>
            </div>
        `;
    }
}

// Filtering and Sorting
function applyFilters() {
    // Start with all history items
    let filtered = [...state.history];

    // Apply search filter if there's a search term
    if (state.currentFilters.search) {
        filtered = filtered.filter(item => 
            item.domain.toLowerCase().includes(state.currentFilters.search) ||
            (item.issuer && item.issuer.toLowerCase().includes(state.currentFilters.search))
        );
    }

    // Apply sorting to the filtered results
    filtered = sortHistory(filtered, state.currentSort);

    // Update the filtered history
    state.filteredHistory = filtered;
    
    // Render the sorted history
    renderHistory();
}

function sortHistory(history, sortType) {
    const sorted = [...history];

    switch (sortType) {
        case 'alphabetical':
            return sorted.sort((a, b) => a.domain.localeCompare(b.domain));
        
        case 'expiring':
            return sorted.sort((a, b) => {
                const daysA = a.daysRemaining !== null ? a.daysRemaining : Infinity;
                const daysB = b.daysRemaining !== null ? b.daysRemaining : Infinity;
                return daysA - daysB;
            });
        
        case 'longest':
            return sorted.sort((a, b) => {
                const daysA = a.daysRemaining !== null ? a.daysRemaining : -1;
                const daysB = b.daysRemaining !== null ? b.daysRemaining : -1;
                return daysB - daysA;
            });
        
        case 'recent':
        default:
            return sorted.sort((a, b) => 
                new Date(b.timestamp) - new Date(a.timestamp)
            );
    }
}

function setActiveSort(sortType) {
    if (elements.sortButtons && elements.sortButtons.length > 0) {
        elements.sortButtons.forEach(btn => {
            if (btn.dataset.sort === sortType) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
}

// Render History
function renderHistory() {
    const historyList = elements.historyList;
    
    if (state.filteredHistory.length === 0) {
        historyList.innerHTML = '<p class="empty-history">No search history yet.</p>';
        return;
    }

    const historyHTML = state.filteredHistory.slice(0, 20).map(item => {
        const statusClass = item.status === 'valid' ? 'valid' : 
                           item.status === 'expiring' ? 'expiring' : 'expired';
        
        const statusIcon = item.status === 'valid' ? 'fa-check-circle' : 
                          item.status === 'expiring' ? 'fa-exclamation-triangle' : 'fa-times-circle';
        
        const timeAgo = getTimeAgo(new Date(item.timestamp));
        
        return `
            <div class="history-item" onclick="loadHistoryItem('${escapeHtml(item.domain)}')">
                <div>
                    <div class="history-item-domain">${escapeHtml(item.domain)}</div>
                    <div class="history-item-time">${timeAgo}</div>
                </div>
                <div class="history-item-status">
                    <i class="fas ${statusIcon}" style="color: var(--${statusClass === 'valid' ? 'success' : statusClass === 'expiring' ? 'warning' : 'danger'}-color);"></i>
                </div>
            </div>
        `;
    }).join('');

    historyList.innerHTML = historyHTML;
}

function openHistoryPanel() {
    if (elements.historyPanel && elements.historyPanelOverlay) {
        elements.historyPanel.classList.remove('hidden');
        elements.historyPanelOverlay.classList.remove('hidden');
        // Prevent body scroll when panel is open
        document.body.style.overflow = 'hidden';
    }
}

function closeHistoryPanel() {
    if (elements.historyPanel && elements.historyPanelOverlay) {
        elements.historyPanel.classList.add('hidden');
        elements.historyPanelOverlay.classList.add('hidden');
        // Restore body scroll
        document.body.style.overflow = '';
    }
}

function loadHistoryItem(domain) {
    const item = state.history.find(h => h.domain === domain);
    if (item) {
        displayResult(item);
        elements.domainInput.value = domain;
        
        // Close history panel
        closeHistoryPanel();
        
        // Highlight active item
        document.querySelectorAll('.history-item').forEach(el => {
            el.classList.remove('active');
            if (el.textContent.includes(domain)) {
                el.classList.add('active');
            }
        });
    }
}

// Utility Functions
function showError(message) {
    elements.errorContainer.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${escapeHtml(message)}</span>
    `;
    elements.errorContainer.classList.remove('hidden');
}

function hideError() {
    elements.errorContainer.classList.add('hidden');
}

function showLoading() {
    elements.loadingIndicator.classList.remove('hidden');
    elements.resultsContainer.innerHTML = '';
}

function hideLoading() {
    elements.loadingIndicator.classList.add('hidden');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Show brief feedback
        const btn = event.target.closest('button');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i>';
        btn.style.color = 'var(--success-color)';
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.color = '';
        }, 1000);
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// Settings Management
function loadSettings() {
    try {
        const stored = localStorage.getItem(CONFIG.STORAGE_KEYS.SETTINGS);
        if (stored) {
            const settings = JSON.parse(stored);
            if (settings.apiKey && settings.apiKey.trim() !== '') {
                state.apiKey = settings.apiKey;
            }
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

function saveSettings() {
    const apiKey = elements.apiKeyInput.value.trim();
    
    if (apiKey === '') {
        // Use default API key if provided, otherwise use empty string
        // Users must provide their own API key through Settings if default is not set
        state.apiKey = CONFIG.DEFAULT_API_KEY || '';
    } else {
        state.apiKey = apiKey;
    }

    try {
        localStorage.setItem(CONFIG.STORAGE_KEYS.SETTINGS, JSON.stringify({
            apiKey: state.apiKey
        }));
        
        elements.settingsModal.classList.add('hidden');
        
        // Show success message
        showError('Settings saved successfully!');
        setTimeout(hideError, 2000);
    } catch (error) {
        showError('Failed to save settings.');
    }
}

// Theme Management
function loadTheme() {
    try {
        const theme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME) || 'light';
        document.documentElement.setAttribute('data-theme', theme);
        updateDarkModeText(theme);
        // Update toggle if it exists
        if (elements.darkModeToggle) {
            elements.darkModeToggle.checked = theme === 'dark';
        }
    } catch (error) {
        console.error('Error loading theme:', error);
    }
}

function toggleDarkMode() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    updateDarkModeText(newTheme);
    
    // Update toggle checkbox
    if (elements.darkModeToggle) {
        elements.darkModeToggle.checked = newTheme === 'dark';
    }
    
    try {
        localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, newTheme);
    } catch (error) {
        console.error('Error saving theme:', error);
    }
}

function updateDarkModeText(theme) {
    if (elements.darkModeText) {
        elements.darkModeText.textContent = theme === 'dark' ? 'On' : 'Off';
    }
}

// Make functions available globally for onclick handlers
window.loadHistoryItem = loadHistoryItem;
window.removeFromHistory = removeFromHistory;
window.copyToClipboard = copyToClipboard;

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);

