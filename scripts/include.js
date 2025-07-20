// scripts/include.js - Enhanced with error handling and loading states

class HTMLIncluder {
  constructor() {
    this.loadingClass = 'include-loading';
    this.errorClass = 'include-error';
    this.loadedClass = 'include-loaded';
    this.cache = new Map();
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second
  }

  // Add loading state styles
  addStyles() {
    if (document.querySelector('#include-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'include-styles';
    style.textContent = `
      .include-loading {
        position: relative;
        min-height: 50px;
        background: #f8f9fa;
        border-radius: 8px;
      }
      
      .include-loading::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 20px;
        height: 20px;
        border: 2px solid #1a237e;
        border-top: 2px solid transparent;
        border-radius: 50%;
        animation: includeSpinner 1s linear infinite;
      }
      
      .include-loading::after {
        content: 'Loading...';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        margin-top: 20px;
        font-size: 0.9rem;
        color: #666;
      }
      
      .include-error {
        padding: 1rem;
        background: #fee;
        border: 1px solid #fcc;
        border-radius: 8px;
        color: #c33;
        font-size: 0.9rem;
      }
      
      .include-loaded {
        animation: includeSlideIn 0.3s ease-out;
      }
      
      @keyframes includeSpinner {
        to { transform: translate(-50%, -50%) rotate(360deg); }
      }
      
      @keyframes includeSlideIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Sleep function for retry delays
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Fetch with retry logic
  async fetchWithRetry(url, attempts = this.retryAttempts) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    } catch (error) {
      if (attempts > 1) {
        console.warn(`Failed to fetch ${url}, retrying... (${attempts - 1} attempts left)`);
        await this.sleep(this.retryDelay);
        return this.fetchWithRetry(url, attempts - 1);
      }
      throw error;
    }
  }

  // Load and cache HTML content
  async loadHTML(file) {
    // Check cache first
    if (this.cache.has(file)) {
      return this.cache.get(file);
    }

    try {
      const response = await this.fetchWithRetry(file);
      const html = await response.text();
      
      // Cache the result
      this.cache.set(file, html);
      return html;
    } catch (error) {
      console.error(`Failed to load ${file}:`, error);
      throw error;
    }
  }

  // Process individual include element
  async processInclude(element) {
    const file = element.getAttribute("data-include");
    if (!file) {
      console.warn('Include element missing data-include attribute:', element);
      return;
    }

    // Add loading state
    element.classList.add(this.loadingClass);
    
    try {
      const html = await this.loadHTML(file);
      
      // Remove loading state and add content
      element.classList.remove(this.loadingClass);
      element.innerHTML = html;
      element.classList.add(this.loadedClass);
      
      // Trigger custom event for successful load
      element.dispatchEvent(new CustomEvent('include:loaded', {
        bubbles: true,
        detail: { file, element }
      }));
      
      // Process any nested includes
      await this.processNestedIncludes(element);
      
    } catch (error) {
      // Remove loading state and show error
      element.classList.remove(this.loadingClass);
      element.classList.add(this.errorClass);
      element.innerHTML = `
        <div class="include-error">
          <strong>Failed to load content</strong><br>
          <small>Could not load: ${file}</small><br>
          <button onclick="location.reload()" style="margin-top: 0.5rem; padding: 0.25rem 0.5rem; border: 1px solid #c33; background: white; color: #c33; border-radius: 4px; cursor: pointer;">
            Retry
          </button>
        </div>
      `;
      
      // Trigger custom event for failed load
      element.dispatchEvent(new CustomEvent('include:error', {
        bubbles: true,
        detail: { file, element, error }
      }));
    }
  }

  // Process nested includes (includes within includes)
  async processNestedIncludes(parentElement) {
    const nestedIncludes = parentElement.querySelectorAll('[data-include]');
    if (nestedIncludes.length > 0) {
      await this.includeHTML(nestedIncludes);
    }
  }

  // Main include function
  async includeHTML(elements = null) {
    // Get elements to process
    const includeElements = elements || document.querySelectorAll('[data-include]');
    
    if (includeElements.length === 0) {
      return;
    }

    // Process all includes in parallel for better performance
    const promises = Array.from(includeElements).map(element => 
      this.processInclude(element)
    );

    try {
      await Promise.all(promises);
      
      // Trigger global event when all includes are processed
      document.dispatchEvent(new CustomEvent('includes:complete', {
        bubbles: true,
        detail: { count: includeElements.length }
      }));
      
    } catch (error) {
      console.error('Error processing includes:', error);
    }
  }

  // Initialize the includer
  init() {
    // Add necessary styles
    this.addStyles();
    
    // Process includes when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.includeHTML());
    } else {
      this.includeHTML();
    }

    // Watch for dynamically added includes
    if ('MutationObserver' in window) {
      const observer = new MutationObserver((mutations) => {
        let hasNewIncludes = false;
        
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.hasAttribute('data-include') || 
                  node.querySelector('[data-include]')) {
                hasNewIncludes = true;
              }
            }
          });
        });
        
        if (hasNewIncludes) {
          this.includeHTML();
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }

  // Clear cache (useful for development)
  clearCache() {
    this.cache.clear();
    console.log('Include cache cleared');
  }

  // Get cache status
  getCacheStatus() {
    return {
      size: this.cache.size,
      files: Array.from(this.cache.keys())
    };
  }
}

// Create global instance
const htmlIncluder = new HTMLIncluder();

// Initialize when script loads
htmlIncluder.init();

// Expose global functions for backward compatibility
window.includeHTML = () => htmlIncluder.includeHTML();
window.clearIncludeCache = () => htmlIncluder.clearCache();
window.getIncludeCacheStatus = () => htmlIncluder.getCacheStatus();

// Enhanced mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', function() {
      navLinks.classList.toggle('active');
      this.classList.toggle('active');
      
      // Update aria attributes for accessibility
      const isOpen = navLinks.classList.contains('active');
      this.setAttribute('aria-expanded', isOpen);
      navLinks.setAttribute('aria-hidden', !isOpen);
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
      if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('active');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        navLinks.setAttribute('aria-hidden', 'true');
      }
    });

    // Close menu when pressing Escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        navLinks.setAttribute('aria-hidden', 'true');
        menuToggle.focus();
      }
    });
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const headerHeight = document.querySelector('.site-header')?.offsetHeight || 0;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // Header scroll effect
  const header = document.querySelector('.site-header');
  if (header) {
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      if (scrollTop > lastScrollTop && scrollTop > 100) {
              // Scrolling down
      header.style.transform = 'translateY(-100%)';
    } else {
      // Scrolling up
      header.style.transform = 'translateY(0)';
    }
    
    lastScrollTop = scrollTop;
  }, { passive: true });
  }

  // Lazy loading for images
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  // Animate elements on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
      }
    });
  }, observerOptions);

  // Observe elements that should animate on scroll
  document.querySelectorAll('.feature-card, .post-card, .footer-column, .footer-brand').forEach(el => {
    scrollObserver.observe(el);
  });

  // Performance monitoring
  if ('performance' in window && 'mark' in performance) {
    performance.mark('include-script-loaded');
  }
});

// Service Worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js')
      .then(function(registration) {
        console.log('ServiceWorker registration successful');
      })
      .catch(function(err) {
        console.log('ServiceWorker registration failed');
      });
  });
}

// Export for ES6 modules if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = htmlIncluder;
}
