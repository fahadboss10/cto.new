/* ========================================
   Testpoints & Pinouts Directory - Main Application
   ======================================== */

// ========================================
// State Management
// ========================================

const AppState = {
    brands: ['Samsung', 'Apple', 'Huawei', 'Xiaomi', 'OnePlus', 'Google'],
    activeBrands: new Set(),
    searchQuery: '',
    allPinouts: [],
    filteredPinouts: [],
    loadingBrands: new Set(),
    failedBrands: new Set(),
    theme: localStorage.getItem('theme') || 'light',
    lightboxZoom: 1,
    lightboxPanX: 0,
    lightboxPanY: 0
};

// ========================================
// Mock Data Generation
// ========================================

/**
 * Generates mock pinout data for demonstration
 * In production, this would fetch from an API
 */
function generateMockPinouts(brand) {
    const devices = {
        Samsung: ['Galaxy S23', 'Galaxy S22', 'Galaxy A54', 'Galaxy Z Fold 5', 'Galaxy Tab S9'],
        Apple: ['iPhone 15 Pro', 'iPhone 14', 'iPhone 13', 'iPad Pro M2', 'MacBook Air M2'],
        Huawei: ['P60 Pro', 'Mate 50', 'Nova 11', 'MateBook X Pro', 'MatePad Pro'],
        Xiaomi: ['Mi 13 Pro', 'Redmi Note 12', 'Poco F5', 'Mi Pad 6', 'Mi Band 8'],
        OnePlus: ['OnePlus 11', 'OnePlus Nord 3', 'OnePlus Pad', 'OnePlus 10T', 'OnePlus Buds Pro 2'],
        Google: ['Pixel 8 Pro', 'Pixel 7a', 'Pixel Fold', 'Pixel Watch 2', 'Pixelbook Go']
    };

    const testpoints = ['VBAT', 'VDD_MAIN', 'PP_CPU', 'USB_DP', 'USB_DN', 'GND', 'BOOT_MODE', 'I2C_SDA', 'I2C_SCL'];
    
    return devices[brand].map((device, index) => ({
        id: `${brand.toLowerCase()}-${index}`,
        brand,
        device,
        model: `${brand.substring(0, 3).toUpperCase()}-${1000 + index}`,
        testpoint: testpoints[index % testpoints.length],
        description: `${testpoints[index % testpoints.length]} testpoint for ${device} mainboard diagnostics and repair`,
        imageUrl: `https://via.placeholder.com/400x300/6366f1/ffffff?text=${encodeURIComponent(device)}`
    }));
}

// ========================================
// API Simulation (Mock Async Loading)
// ========================================

/**
 * Simulates API call to fetch pinouts for a specific brand
 * Includes random delay and error simulation
 */
async function fetchBrandPinouts(brand) {
    return new Promise((resolve, reject) => {
        const delay = Math.random() * 1500 + 500; // 500-2000ms delay
        const shouldFail = Math.random() < 0.1; // 10% chance of failure
        
        setTimeout(() => {
            if (shouldFail) {
                reject(new Error(`Failed to load ${brand} data`));
            } else {
                resolve(generateMockPinouts(brand));
            }
        }, delay);
    });
}

// ========================================
// UI Rendering Functions
// ========================================

/**
 * Renders brand filter cards with loading and error states
 */
function renderBrandFilters() {
    const filtersContainer = document.getElementById('brandFilters');
    
    const html = AppState.brands.map(brand => {
        const isActive = AppState.activeBrands.has(brand);
        const isLoading = AppState.loadingBrands.has(brand);
        const hasFailed = AppState.failedBrands.has(brand);
        const count = AppState.allPinouts.filter(p => p.brand === brand).length;
        
        let statusContent = '';
        if (isLoading) {
            statusContent = '<span class="brand-loading" aria-label="Loading"></span>';
        } else if (hasFailed) {
            statusContent = '<span class="brand-error" role="alert">Failed</span>';
        } else {
            statusContent = `<span class="brand-count">${count} devices</span>`;
        }
        
        return `
            <button 
                class="brand-filter-card ${isActive ? 'active' : ''} ${isLoading ? 'loading' : ''}"
                data-brand="${brand}"
                aria-pressed="${isActive}"
                aria-label="Filter by ${brand}, ${count} devices"
            >
                <span class="brand-name">${brand}</span>
                ${statusContent}
            </button>
        `;
    }).join('');
    
    filtersContainer.innerHTML = html;
    
    // Attach event listeners
    filtersContainer.querySelectorAll('.brand-filter-card').forEach(card => {
        card.addEventListener('click', handleBrandFilterClick);
    });
}

/**
 * Handles brand filter card click
 */
async function handleBrandFilterClick(event) {
    const button = event.currentTarget;
    const brand = button.dataset.brand;
    
    if (AppState.activeBrands.has(brand)) {
        // Deactivate brand
        AppState.activeBrands.delete(brand);
        button.classList.remove('active');
        button.setAttribute('aria-pressed', 'false');
    } else {
        // Activate brand
        AppState.activeBrands.add(brand);
        button.classList.add('active');
        button.setAttribute('aria-pressed', 'true');
        
        // Load data if not already loaded
        const brandHasData = AppState.allPinouts.some(p => p.brand === brand);
        if (!brandHasData && !AppState.loadingBrands.has(brand)) {
            await loadBrandData(brand);
        }
    }
    
    filterAndRenderResults();
}

/**
 * Loads data for a specific brand with progress tracking
 */
async function loadBrandData(brand) {
    AppState.loadingBrands.add(brand);
    AppState.failedBrands.delete(brand);
    renderBrandFilters();
    updateProgressIndicator();
    
    try {
        const pinouts = await fetchBrandPinouts(brand);
        AppState.allPinouts.push(...pinouts);
        AppState.loadingBrands.delete(brand);
        renderBrandFilters();
        updateProgressIndicator();
        filterAndRenderResults();
    } catch (error) {
        console.error(`Error loading ${brand}:`, error);
        AppState.loadingBrands.delete(brand);
        AppState.failedBrands.add(brand);
        renderBrandFilters();
        updateProgressIndicator();
        showBrandError(brand);
    }
}

/**
 * Displays error state for a failed brand load
 */
function showBrandError(brand) {
    const resultsSection = document.getElementById('resultsSection');
    const existingError = document.querySelector(`[data-error-brand="${brand}"]`);
    
    if (existingError) {
        existingError.remove();
    }
    
    const errorHtml = `
        <div class="error-state" data-error-brand="${brand}" role="alert">
            <svg class="error-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <h3 class="error-title">Failed to load ${brand} data</h3>
            <p class="error-message">There was a problem loading the pinouts for ${brand}. Please check your connection and try again.</p>
            <button class="btn btn-error" onclick="retryBrandLoad('${brand}')" aria-label="Retry loading ${brand} data">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                </svg>
                Retry
            </button>
        </div>
    `;
    
    resultsSection.insertAdjacentHTML('beforeend', errorHtml);
}

/**
 * Retries loading data for a failed brand
 */
window.retryBrandLoad = function(brand) {
    const errorElement = document.querySelector(`[data-error-brand="${brand}"]`);
    if (errorElement) {
        errorElement.remove();
    }
    loadBrandData(brand);
};

/**
 * Updates the multi-brand loading progress indicator
 */
function updateProgressIndicator() {
    const progressContainer = document.getElementById('loadingProgress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (AppState.loadingBrands.size === 0) {
        progressContainer.style.display = 'none';
        return;
    }
    
    const totalActive = AppState.activeBrands.size;
    const loading = AppState.loadingBrands.size;
    const loaded = totalActive - loading;
    const percentage = totalActive > 0 ? (loaded / totalActive) * 100 : 0;
    
    progressContainer.style.display = 'block';
    progressFill.style.width = `${percentage}%`;
    progressText.textContent = `Loading ${loading} of ${totalActive} brands...`;
}

/**
 * Renders skeleton loading state for a brand section
 */
function renderSkeletonLoader(brand) {
    return `
        <div class="brand-section" data-brand="${brand}">
            <div class="brand-section-header">
                <h2 class="brand-section-title">${brand}</h2>
            </div>
            <div class="skeleton-table" role="status" aria-label="Loading ${brand} data">
                ${[1, 2, 3, 4].map(() => `
                    <div class="skeleton-row">
                        <div class="skeleton-cell"></div>
                        <div class="skeleton-cell"></div>
                        <div class="skeleton-cell"></div>
                        <div class="skeleton-cell"></div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

/**
 * Filters pinouts based on active brands and search query
 */
function filterAndRenderResults() {
    // Filter by active brands
    let filtered = AppState.allPinouts.filter(p => AppState.activeBrands.has(p.brand));
    
    // Filter by search query
    if (AppState.searchQuery) {
        const query = AppState.searchQuery.toLowerCase();
        filtered = filtered.filter(p => 
            p.device.toLowerCase().includes(query) ||
            p.model.toLowerCase().includes(query) ||
            p.testpoint.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query)
        );
    }
    
    AppState.filteredPinouts = filtered;
    renderResults();
    updateResultCount();
}

/**
 * Highlights search terms in text
 */
function highlightSearchTerms(text) {
    if (!AppState.searchQuery) return text;
    
    const query = AppState.searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape regex
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="highlight">$1</mark>');
}

/**
 * Renders the main results section with all active brand data
 */
function renderResults() {
    const resultsSection = document.getElementById('resultsSection');
    const noResults = document.getElementById('noResults');
    
    // Clear existing error states
    document.querySelectorAll('.error-state').forEach(el => el.remove());
    
    if (AppState.activeBrands.size === 0) {
        resultsSection.innerHTML = '';
        noResults.style.display = 'none';
        return;
    }
    
    if (AppState.filteredPinouts.length === 0 && AppState.loadingBrands.size === 0) {
        resultsSection.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }
    
    noResults.style.display = 'none';
    
    // Group pinouts by brand
    const byBrand = {};
    AppState.filteredPinouts.forEach(pinout => {
        if (!byBrand[pinout.brand]) {
            byBrand[pinout.brand] = [];
        }
        byBrand[pinout.brand].push(pinout);
    });
    
    // Render each brand section
    const html = Array.from(AppState.activeBrands).map(brand => {
        if (AppState.loadingBrands.has(brand)) {
            return renderSkeletonLoader(brand);
        }
        
        const pinouts = byBrand[brand] || [];
        
        if (pinouts.length === 0) {
            return '';
        }
        
        return renderBrandSection(brand, pinouts);
    }).filter(Boolean).join('');
    
    resultsSection.innerHTML = html;
    
    // Attach event listeners for thumbnails and buttons
    attachResultEventListeners();
}

/**
 * Renders a single brand section with table and card views
 */
function renderBrandSection(brand, pinouts) {
    return `
        <div class="brand-section" data-brand="${brand}">
            <div class="brand-section-header">
                <h2 class="brand-section-title">
                    ${brand}
                    <span class="brand-section-badge">${pinouts.length}</span>
                </h2>
            </div>
            
            <!-- Desktop Table View -->
            <div class="pinouts-table-container">
                <table class="pinouts-table">
                    <thead>
                        <tr>
                            <th scope="col">Device</th>
                            <th scope="col">Model</th>
                            <th scope="col">Testpoint</th>
                            <th scope="col">Diagram</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pinouts.map(pinout => `
                            <tr>
                                <td>${highlightSearchTerms(pinout.device)}</td>
                                <td>${highlightSearchTerms(pinout.model)}</td>
                                <td><code>${highlightSearchTerms(pinout.testpoint)}</code></td>
                                <td>
                                    <a href="#" class="pinout-thumbnail-link" data-pinout-id="${pinout.id}" aria-label="View diagram for ${pinout.device}">
                                        <img 
                                            src="${pinout.imageUrl}" 
                                            alt="Pinout diagram for ${pinout.device}" 
                                            class="pinout-thumbnail"
                                            loading="lazy"
                                            onerror="this.src='https://via.placeholder.com/80x80/6366f1/ffffff?text=No+Image'"
                                        >
                                    </a>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <!-- Mobile Card View -->
            <div class="pinouts-cards">
                ${pinouts.map(pinout => `
                    <article class="pinout-card">
                        <div class="card-header">
                            <h3 class="card-title">${highlightSearchTerms(pinout.device)}</h3>
                            <a href="#" class="pinout-thumbnail-link" data-pinout-id="${pinout.id}" aria-label="View diagram for ${pinout.device}">
                                <img 
                                    src="${pinout.imageUrl}" 
                                    alt="Pinout diagram for ${pinout.device}" 
                                    class="pinout-thumbnail"
                                    loading="lazy"
                                    onerror="this.src='https://via.placeholder.com/80x80/6366f1/ffffff?text=No+Image'"
                                >
                            </a>
                        </div>
                        <div class="card-row">
                            <span class="card-label">Model:</span>
                            <span class="card-value">${highlightSearchTerms(pinout.model)}</span>
                        </div>
                        <div class="card-row">
                            <span class="card-label">Testpoint:</span>
                            <span class="card-value"><code>${highlightSearchTerms(pinout.testpoint)}</code></span>
                        </div>
                        <div class="card-row">
                            <span class="card-label">Description:</span>
                            <span class="card-value">${highlightSearchTerms(pinout.description)}</span>
                        </div>
                    </article>
                `).join('')}
            </div>
        </div>
    `;
}

/**
 * Attaches event listeners to result items
 */
function attachResultEventListeners() {
    document.querySelectorAll('.pinout-thumbnail-link').forEach(link => {
        link.addEventListener('click', handleThumbnailClick);
    });
}

/**
 * Updates the result count display
 */
function updateResultCount() {
    const resultCount = document.getElementById('resultCount');
    const count = AppState.filteredPinouts.length;
    const total = AppState.allPinouts.filter(p => AppState.activeBrands.has(p.brand)).length;
    
    if (AppState.activeBrands.size === 0) {
        resultCount.textContent = '';
        return;
    }
    
    if (AppState.searchQuery) {
        resultCount.textContent = `Found ${count} of ${total} results`;
    } else {
        resultCount.textContent = `Showing ${count} results`;
    }
}

// ========================================
// Search Functionality
// ========================================

/**
 * Handles search input with debouncing
 */
let searchDebounceTimer;
function handleSearchInput(event) {
    const query = event.target.value.trim();
    const clearButton = document.getElementById('clearSearch');
    
    // Show/hide clear button
    clearButton.style.display = query ? 'flex' : 'none';
    
    // Debounce search
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
        AppState.searchQuery = query;
        filterAndRenderResults();
    }, 300);
}

/**
 * Clears the search input and filters
 */
function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    const clearButton = document.getElementById('clearSearch');
    
    searchInput.value = '';
    clearButton.style.display = 'none';
    AppState.searchQuery = '';
    filterAndRenderResults();
    searchInput.focus();
}

/**
 * Clears all filters and search
 */
function clearAllFilters() {
    // Clear search
    const searchInput = document.getElementById('searchInput');
    searchInput.value = '';
    document.getElementById('clearSearch').style.display = 'none';
    AppState.searchQuery = '';
    
    // Clear brand filters
    AppState.activeBrands.clear();
    renderBrandFilters();
    filterAndRenderResults();
}

// ========================================
// Lightbox Functionality
// ========================================

/**
 * Opens the lightbox with the selected image
 */
function handleThumbnailClick(event) {
    event.preventDefault();
    const pinoutId = event.currentTarget.dataset.pinoutId;
    const pinout = AppState.allPinouts.find(p => p.id === pinoutId);
    
    if (!pinout) return;
    
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxCaption = document.getElementById('lightboxCaption');
    
    lightboxImage.src = pinout.imageUrl;
    lightboxImage.alt = `Pinout diagram for ${pinout.device}`;
    lightboxCaption.textContent = `${pinout.brand} ${pinout.device} - ${pinout.testpoint}`;
    
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Reset zoom
    AppState.lightboxZoom = 1;
    AppState.lightboxPanX = 0;
    AppState.lightboxPanY = 0;
    applyLightboxTransform();
    
    // Focus the close button for accessibility
    setTimeout(() => {
        document.querySelector('.lightbox-close').focus();
    }, 100);
}

/**
 * Closes the lightbox
 */
function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.style.display = 'none';
    document.body.style.overflow = '';
}

/**
 * Applies zoom and pan transformations to lightbox image
 */
function applyLightboxTransform() {
    const image = document.getElementById('lightboxImage');
    image.style.transform = `scale(${AppState.lightboxZoom}) translate(${AppState.lightboxPanX}px, ${AppState.lightboxPanY}px)`;
}

/**
 * Handles lightbox zoom controls
 */
function handleZoom(direction) {
    if (direction === 'in') {
        AppState.lightboxZoom = Math.min(AppState.lightboxZoom + 0.25, 3);
    } else if (direction === 'out') {
        AppState.lightboxZoom = Math.max(AppState.lightboxZoom - 0.25, 0.5);
    } else if (direction === 'reset') {
        AppState.lightboxZoom = 1;
        AppState.lightboxPanX = 0;
        AppState.lightboxPanY = 0;
    }
    applyLightboxTransform();
}

/**
 * Handles image panning with touch/mouse
 */
let isPanning = false;
let startX, startY;

function initializeLightboxPan() {
    const image = document.getElementById('lightboxImage');
    
    // Mouse events
    image.addEventListener('mousedown', (e) => {
        if (AppState.lightboxZoom > 1) {
            isPanning = true;
            startX = e.clientX - AppState.lightboxPanX;
            startY = e.clientY - AppState.lightboxPanY;
            image.style.cursor = 'grabbing';
        }
    });
    
    document.addEventListener('mousemove', (e) => {
        if (isPanning) {
            AppState.lightboxPanX = e.clientX - startX;
            AppState.lightboxPanY = e.clientY - startY;
            applyLightboxTransform();
        }
    });
    
    document.addEventListener('mouseup', () => {
        if (isPanning) {
            isPanning = false;
            document.getElementById('lightboxImage').style.cursor = 'move';
        }
    });
    
    // Touch events
    image.addEventListener('touchstart', (e) => {
        if (AppState.lightboxZoom > 1 && e.touches.length === 1) {
            isPanning = true;
            startX = e.touches[0].clientX - AppState.lightboxPanX;
            startY = e.touches[0].clientY - AppState.lightboxPanY;
        }
    });
    
    image.addEventListener('touchmove', (e) => {
        if (isPanning && e.touches.length === 1) {
            e.preventDefault();
            AppState.lightboxPanX = e.touches[0].clientX - startX;
            AppState.lightboxPanY = e.touches[0].clientY - startY;
            applyLightboxTransform();
        }
    });
    
    image.addEventListener('touchend', () => {
        isPanning = false;
    });
}

// ========================================
// Theme Management
// ========================================

/**
 * Toggles between light and dark mode
 */
function toggleTheme() {
    AppState.theme = AppState.theme === 'light' ? 'dark' : 'light';
    document.body.classList.toggle('dark-mode', AppState.theme === 'dark');
    localStorage.setItem('theme', AppState.theme);
}

/**
 * Initializes theme from saved preference
 */
function initializeTheme() {
    if (AppState.theme === 'dark') {
        document.body.classList.add('dark-mode');
    }
}

// ========================================
// Keyboard Navigation
// ========================================

/**
 * Handles keyboard shortcuts for better accessibility
 */
function initializeKeyboardNavigation() {
    document.addEventListener('keydown', (event) => {
        // Escape key - close lightbox
        if (event.key === 'Escape') {
            const lightbox = document.getElementById('lightbox');
            if (lightbox.style.display === 'flex') {
                closeLightbox();
            }
        }
        
        // Ctrl/Cmd + K - focus search
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
            event.preventDefault();
            document.getElementById('searchInput').focus();
        }
        
        // Lightbox zoom controls with +/- keys
        const lightbox = document.getElementById('lightbox');
        if (lightbox.style.display === 'flex') {
            if (event.key === '+' || event.key === '=') {
                event.preventDefault();
                handleZoom('in');
            } else if (event.key === '-' || event.key === '_') {
                event.preventDefault();
                handleZoom('out');
            } else if (event.key === '0') {
                event.preventDefault();
                handleZoom('reset');
            }
        }
    });
}

// ========================================
// Event Listeners Setup
// ========================================

/**
 * Initializes all event listeners
 */
function initializeEventListeners() {
    // Search
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', handleSearchInput);
    
    const clearSearchBtn = document.getElementById('clearSearch');
    clearSearchBtn.addEventListener('click', clearSearch);
    
    // Clear all filters
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    clearFiltersBtn.addEventListener('click', clearAllFilters);
    
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', toggleTheme);
    
    // Lightbox controls
    const lightboxClose = document.querySelector('.lightbox-close');
    lightboxClose.addEventListener('click', closeLightbox);
    
    const lightboxOverlay = document.querySelector('.lightbox-overlay');
    lightboxOverlay.addEventListener('click', closeLightbox);
    
    // Lightbox overlay keyboard support
    lightboxOverlay.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            closeLightbox();
        }
    });
    
    // Zoom controls
    document.getElementById('zoomIn').addEventListener('click', () => handleZoom('in'));
    document.getElementById('zoomOut').addEventListener('click', () => handleZoom('out'));
    document.getElementById('zoomReset').addEventListener('click', () => handleZoom('reset'));
    
    // Initialize lightbox pan
    initializeLightboxPan();
    
    // Keyboard navigation
    initializeKeyboardNavigation();
}

// ========================================
// Initialization
// ========================================

/**
 * Initializes the application on page load
 */
function initializeApp() {
    console.log('Initializing Testpoints & Pinouts Directory...');
    
    // Initialize theme
    initializeTheme();
    
    // Render initial brand filters
    renderBrandFilters();
    
    // Set up event listeners
    initializeEventListeners();
    
    // Initial render
    filterAndRenderResults();
    
    console.log('Application initialized successfully');
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// ========================================
// Service Worker Registration (Optional)
// ========================================

/**
 * Registers service worker for offline support (if available)
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment to enable service worker
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('ServiceWorker registered:', registration))
        //     .catch(error => console.log('ServiceWorker registration failed:', error));
    });
}
