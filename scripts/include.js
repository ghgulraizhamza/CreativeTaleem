// Enhanced Main JavaScript for Professional Blog
document.addEventListener('DOMContentLoaded', function() {
  
  // Performance tracking
  const startTime = performance.now();
  
  // Initialize all components
  initializeHeaderScrollEffect();
  initializeLazyLoading();
  initializeSearchFunctionality();
  initializeNewsletterForm();
  initializeLoadMorePosts();
  initializeScrollAnimations();
  initializeAnalytics();
  initializeAccessibility();
  initializePWAFeatures();
  
  // Log performance
  window.addEventListener('load', function() {
    const loadTime = performance.now() - startTime;
    console.log(`Page loaded in ${loadTime.toFixed(2)}ms`);
    
    // Send performance data to analytics (if available)
    if (typeof gtag !== 'undefined') {
      gtag('event', 'timing_complete', {
        name: 'page_load',
        value: Math.round(loadTime)
      });
    }
  });
  
  // Header scroll effect with performance optimization
  function initializeHeaderScrollEffect() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    
    let lastScrollTop = 0;
    let ticking = false;
    
    function updateHeader() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      if (scrollTop > 100) {
        header.classList.add('scrolled');
        header.style.transform = 'translateY(0)';
      } else {
        header.classList.remove('scrolled');
      }
      
      // Hide/show header on scroll direction
      if (scrollTop > lastScrollTop && scrollTop > 200) {
        header.style.transform = 'translateY(-100%)';
      } else {
        header.style.transform = 'translateY(0)';
      }
      
      lastScrollTop = scrollTop;
      ticking = false;
    }
    
    function requestTick() {
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    }
    
    window.addEventListener('scroll', requestTick, { passive: true });
  }
  
  // Advanced lazy loading with intersection observer
  function initializeLazyLoading() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            
            // Create a new image to preload
            const newImg = new Image();
            newImg.onload = function() {
              img.src = img.dataset.src || img.src;
              img.classList.add('loaded');
              img.style.opacity = '1';
            };
            
            newImg.onerror = function() {
              img.src = '/images/placeholder.webp'; // Fallback image
              img.classList.add('error');
            };
            
            newImg.src = img.dataset.src || img.src;
            observer.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.1
      });

      // Observe all images
      document.querySelectorAll('img[data-src], img[loading="lazy"]').forEach(img => {
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
        imageObserver.observe(img);
      });
    }
  }
  
  // Enhanced search functionality
  function initializeSearchFunctionality() {
    const searchForms = document.querySelectorAll('.search-form');
    const searchInputs = document.querySelectorAll('.search-input');
    
    searchForms.forEach(form => {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        const input = this.querySelector('.search-input, .newsletter-input');
        const query = input.value.trim();
        
        if (query.length >= 2) {
          performSearch(query);
        } else {
          showSearchError('Please enter at least 2 characters');
        }
      });
    });
    
    // Real-time search suggestions
    searchInputs.forEach(input => {
      let debounceTimer;
      
      input.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          const query = this.value.trim();
          if (query.length >= 2) {
            showSearchSuggestions(query);
          } else {
            hideSearchSuggestions();
          }
        }, 300);
      });
      
      // Hide suggestions when clicking outside
      document.addEventListener('click', function(e) {
        if (!input.contains(e.target)) {
          hideSearchSuggestions();
        }
      });
    });
  }
  
  function performSearch(query) {
    // Track search event
    if (typeof gtag !== 'undefined') {
      gtag('event', 'search', {
        search_term: query
      });
    }
    
    // Redirect to search results page
    window.location.href = `/search/?q=${encodeURIComponent(query)}`;
  }
  
    function showSearchSuggestions(query) {
    // This would typically fetch from an API
    const suggestions = [
      'JavaScript Tutorial',
      'React Best Practices',
      'CSS Grid Layout',
      'Node.js Guide',
      'Python Basics'
    ].filter(item => 
      item.toLowerCase().includes(query.toLowerCase())
    );
    
    // Create suggestions dropdown if it doesn't exist
    let suggestionsContainer = document.querySelector('.search-suggestions');
    if (!suggestionsContainer) {
      suggestionsContainer = document.createElement('div');
      suggestionsContainer.className = 'search-suggestions';
      suggestionsContainer.style.cssText = `
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        z-index: 1000;
        max-height: 200px;
        overflow-y: auto;
        display: none;
      `;
      
      const searchContainer = document.querySelector('.search-form');
      if (searchContainer) {
        searchContainer.style.position = 'relative';
        searchContainer.appendChild(suggestionsContainer);
      }
    }
    
    if (suggestions.length > 0) {
      suggestionsContainer.innerHTML = suggestions.map(suggestion => 
        `<div class="suggestion-item" style="padding: 0.75rem 1rem; cursor: pointer; border-bottom: 1px solid #f1f5f9; transition: background 0.2s ease;">${suggestion}</div>`
      ).join('');
      
      suggestionsContainer.style.display = 'block';
      
      // Add click handlers for suggestions
      suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('mouseenter', function() {
          this.style.background = '#f8fafc';
        });
        
        item.addEventListener('mouseleave', function() {
          this.style.background = 'white';
        });
        
        item.addEventListener('click', function() {
          performSearch(this.textContent);
        });
      });
    } else {
      hideSearchSuggestions();
    }
  }
  
  function hideSearchSuggestions() {
    const suggestionsContainer = document.querySelector('.search-suggestions');
    if (suggestionsContainer) {
      suggestionsContainer.style.display = 'none';
    }
  }
  
  function showSearchError(message) {
    // Create and show error message
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #fee;
      color: #c53030;
      padding: 1rem;
      border-radius: 8px;
      border: 1px solid #fed7d7;
      z-index: 10000;
      animation: slideInRight 0.3s ease;
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      errorDiv.remove();
    }, 3000);
  }
  
  // Enhanced newsletter form with validation
  function initializeNewsletterForm() {
    const newsletterForms = document.querySelectorAll('.newsletter-form, .sidebar-newsletter-form');
    
    newsletterForms.forEach(form => {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const emailInput = this.querySelector('.newsletter-input, .newsletter-email-input');
        const submitBtn = this.querySelector('.newsletter-btn, .newsletter-submit-btn');
        const email = emailInput.value.trim();
        
        // Validate email
        if (!isValidEmail(email)) {
          showNotification('Please enter a valid email address', 'error');
          emailInput.focus();
          return;
        }
        
        // Show loading state
        const originalBtnContent = submitBtn.innerHTML;
        submitBtn.innerHTML = `
          <span style="display: flex; align-items: center; gap: 0.5rem;">
            <div style="width: 16px; height: 16px; border: 2px solid currentColor; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            Subscribing...
          </span>
        `;
        submitBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
          // Track newsletter subscription
          if (typeof gtag !== 'undefined') {
            gtag('event', 'newsletter_signup', {
              email_domain: email.split('@')[1]
            });
          }
          
          submitBtn.innerHTML = `
            <span style="display: flex; align-items: center; gap: 0.5rem;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width: 16px; height: 16px; stroke-width: 2;">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
              Subscribed!
            </span>
          `;
          
          showNotification('Successfully subscribed to our newsletter!', 'success');
          
          // Reset after 3 seconds
          setTimeout(() => {
            submitBtn.innerHTML = originalBtnContent;
            submitBtn.disabled = false;
            emailInput.value = '';
          }, 3000);
          
        }, 2000);
      });
    });
  }
  
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${bgColor};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
      z-index: 10000;
      animation: slideInRight 0.3s ease;
      max-width: 300px;
      font-size: 0.9rem;
      font-weight: 500;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  }
  
  // Load more posts functionality
  function initializeLoadMorePosts() {
    const loadMoreBtn = document.querySelector('.load-more-btn');
    if (!loadMoreBtn) return;
    
    let currentPage = 1;
    let isLoading = false;
    
    loadMoreBtn.addEventListener('click', function() {
      if (isLoading) return;
      
      isLoading = true;
      currentPage++;
      
      const originalContent = this.innerHTML;
      this.innerHTML = `
        <span style="display: flex; align-items: center; gap: 0.5rem;">
          <div style="width: 16px; height: 16px; border: 2px solid currentColor; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
          Loading more posts...
        </span>
      `;
      this.disabled = true;
      
      // Simulate API call to load more posts
      setTimeout(() => {
        loadMorePosts(currentPage).then(posts => {
          if (posts && posts.length > 0) {
            appendPostsToGrid(posts);
            this.innerHTML = originalContent;
            this.disabled = false;
            
            // Track load more event
            if (typeof gtag !== 'undefined') {
              gtag('event', 'load_more_posts', {
                page: currentPage
              });
            }
          } else {
            this.innerHTML = 'No more posts to load';
            this.disabled = true;
          }
          
          isLoading = false;
        });
      }, 1500);
    });
  }
  
  async function loadMorePosts(page) {
    // This would typically fetch from an API
    // For demo purposes, return mock data
    if (page > 3) return []; // Simulate no more posts after page 3
    
    return [
      {
        title: `Amazing Tutorial ${page}-1`,
        excerpt: 'Learn something new with this comprehensive guide that covers all the essential concepts.',
        image: '/images/post-placeholder.webp',
        category: 'Tutorial',
        date: '2025-07-20',
        author: 'Creative Team',
        readTime: '8 min read',
        tags: ['Tutorial', 'Guide']
      },
      {
        title: `Advanced Tips ${page}-2`,
        excerpt: 'Discover advanced techniques that will help you become more efficient and productive.',
        image: '/images/post-placeholder.webp',
        category: 'Tips',
        date: '2025-07-19',
        author: 'Expert Author',
        readTime: '6 min read',
        tags: ['Tips', 'Advanced']
      }
    ];
  }
  
  function appendPostsToGrid(posts) {
    const postsGrid = document.querySelector('.posts-grid');
    if (!postsGrid) return;
    
    posts.forEach(post => {
      const postElement = createPostElement(post);
      postElement.style.opacity = '0';
      postElement.style.transform = 'translateY(30px)';
      postsGrid.appendChild(postElement);
      
      // Animate in
      setTimeout(() => {
        postElement.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        postElement.style.opacity = '1';
        postElement.style.transform = 'translateY(0)';
      }, 100);
    });
  }
  
  function createPostElement(post) {
    const article = document.createElement('article');
    article.className = 'post-card';
    
    article.innerHTML = `
      <div class="post-image">
        <img src="${post.image}" alt="${post.title}" loading="lazy">
        <div class="post-category">${post.category}</div>
        <div class="post-reading-time">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
          ${post.readTime}
        </div>
      </div>
      <div class="post-content">
        <div class="post-meta">
          <time datetime="${post.date}">${formatDate(post.date)}</time>
          <span class="post-author">By ${post.author}</span>
        </div>
        <h3 class="post-title">
          <a href="/blog/${slugify(post.title)}/">${post.title}</a>
        </h3>
        <p class="post-excerpt">${post.excerpt}</p>
        <div class="post-tags">
          ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
        <a href="/blog/${slugify(post.title)}/" class="read-more-btn">
          Read Full Article
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
      </div>
    `;
    
    return article;
  }
  
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  function slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }
  
  // Scroll animations with performance optimization
  function initializeScrollAnimations() {
    if ('IntersectionObserver' in window) {
      const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            
            // Stagger animation for child elements
            const children = entry.target.querySelectorAll('.post-card, .category-card, .feature-card');
            children.forEach((child, index) => {
              setTimeout(() => {
                child.style.opacity = '1';
                child.style.transform = 'translateY(0)';
              }, index * 100);
            });
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });

      // Observe elements for animation
      document.querySelectorAll('.posts-section, .categories-section, .newsletter-section').forEach(section => {
        animationObserver.observe(section);
      });
    }
  }
  
  // Analytics and tracking
  function initializeAnalytics() {
    // Track page view
    if (typeof gtag !== 'undefined') {
      gtag('config', 'GA_MEASUREMENT_ID', {
        page_title: document.title,
        page_location: window.location.href
      });
    }
    
    // Track outbound links
    document.querySelectorAll('a[href^="http"]:not([href*="' + window.location.hostname + '"])').forEach(link => {
      link.addEventListener('click', function() {
        if (typeof gtag !== 'undefined') {
          gtag('event', 'click', {
            event_category: 'outbound',
            event_label: this.href
          });
        }
      });
    });
    
    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', throttle(function() {
      const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      
      if (scrollPercent > maxScroll && scrollPercent % 25 === 0) {
        maxScroll = scrollPercent;
        if (typeof gtag !== 'undefined') {
          gtag('event', 'scroll', {
            event_category: 'engagement',
            event_label: `${scrollPercent}%`,
            value: scrollPercent
          });
        }
      }
    }, 1000), { passive: true });
    
    // Track time on page
    let startTime = Date.now();
    window.addEventListener('beforeunload', function() {
      const timeOnPage = Math.round((Date.now() - startTime) / 1000);
      if (typeof gtag !== 'undefined' && timeOnPage > 10) {
        gtag('event', 'timing_complete', {
          name: 'time_on_page',
          value: timeOnPage
        });
      }
    });
  }
  
  // Accessibility enhancements
  function initializeAccessibility() {
    // Skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: #1a237e;
      color: white;
      padding: 8px;
      border-radius: 4px;
      text-decoration: none;
      font-weight: 600;
      z-index: 10000;
      transition: top 0.3s ease;
    `;
    
    skipLink.addEventListener('focus', function() {
      this.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', function() {
      this.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add main content ID if not exists
    const mainContent = document.querySelector('.main-content');
    if (mainContent && !mainContent.id) {
      mainContent.id = 'main-content';
    }
    
    // Enhance keyboard navigation
    document.addEventListener('keydown', function(e) {
      // Escape key to close modals/menus
      if (e.key === 'Escape') {
        // Close mobile menu
        const mobileMenu = document.querySelector('.main-navigation.active');
        if (mobileMenu) {
          mobileMenu.classList.remove('active');
          const menuToggle = document.querySelector('.mobile-menu-toggle.active');
          if (menuToggle) {
            menuToggle.classList.remove('active');
            menuToggle.focus();
          }
        }
        
        // Close search suggestions
        hideSearchSuggestions();
      }
    });
    
    // Announce dynamic content changes to screen readers
    function announceToScreenReader(message) {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      `;
      announcement.textContent = message;
      
      document.body.appendChild(announcement);
      setTimeout(() => announcement.remove(), 1000);
    }
    
    // Make announcement when new posts are loaded
    const originalAppendPosts = appendPostsToGrid;
    appendPostsToGrid = function(posts) {
      originalAppendPosts(posts);
      announceToScreenReader(`${posts.length} new posts loaded`);
    };
  }
  
  // PWA features
  function initializePWAFeatures() {
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
          .then(function(registration) {
            console.log('ServiceWorker registration successful');
            
            // Check for updates
            registration.addEventListener('updatefound', function() {
              const newWorker = registration.installing;
              newWorker.addEventListener('statechange', function() {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  showUpdateNotification();
                }
              });
            });
          })
          .catch(function(err) {
            console.log('ServiceWorker registration failed');
          });
      });
    }
    
    // Install prompt
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', function(e) {
      e.preventDefault();
      deferredPrompt = e;
      showInstallPrompt();
    });
    
    function showInstallPrompt() {
      const installBanner = document.createElement('div');
      installBanner.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        right: 20px;
        background: #1a237e;
        color: white;
        padding: 1rem;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        z-index: 10000;
        animation: slideUp 0.3s ease;
        max-width: 400px;
        margin: 0 auto;
      `;
      
      installBanner.innerHTML = `
        <div>
          <strong>Install Creative Taleem</strong>
          <p style="margin: 0; font-size: 0.9rem; opacity: 0.9;">Get quick access to our tutorials and stay updated!</p>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button id="install-btn" style="background: white; color: #1a237e; border: none; padding: 0.5rem 1rem; border-radius: 6px; font-weight: 600; cursor: pointer;">Install</button>
          <button id="dismiss-install" style="background: transparent; color: white; border: 1px solid rgba(255,255,255,0.3); padding: 0.5rem; border-radius: 6px; cursor: pointer;">×</button>
        </div>
      `;
      
      document.body.appendChild(installBanner);
      
      installBanner.querySelector('#install-btn').addEventListener('click', function() {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then(function(choiceResult) {
            if (choiceResult.outcome === 'accepted') {
              console.log('User accepted the install prompt');
            }
            deferredPrompt = null;
            installBanner.remove();
          });
        }
      });
      
      installBanner.querySelector('#dismiss-install').addEventListener('click', function() {
        installBanner.remove();
        localStorage.setItem('installPromptDismissed', Date.now());
      });
      
      // Auto-hide after 10 seconds
      setTimeout(() => {
        if (installBanner.parentNode) {
          installBanner.remove();
        }
      }, 10000);
    }
    
    function showUpdateNotification() {
      const updateBanner = document.createElement('div');
      updateBanner.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1rem;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        z-index: 10000;
        animation: slideDown 0.3s ease;
        max-width: 400px;
        margin: 0 auto;
      `;
      
      updateBanner.innerHTML = `
        <div>
          <strong>Update Available</strong>
          <p style="margin: 0; font-size: 0.9rem; opacity: 0.9;">A new version is ready to install.</p>
        </div>
        <button id="update-btn" style="background: white; color: #10b981; border: none; padding: 0.5rem 1rem; border-radius: 6px; font-weight: 600; cursor: pointer;">Update</button>
      `;
      
      document.body.appendChild(updateBanner);
      
      updateBanner.querySelector('#update-btn').addEventListener('click', function() {
        window.location.reload();
      });
      
      setTimeout(() => {
        if (updateBanner.parentNode) {
          updateBanner.remove();
        }
      }, 8000);
    }
  }
  
  // Utility functions
  function throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
  
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  // Error handling
  window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    
    // Report to analytics if available
    if (typeof gtag !== 'undefined') {
      gtag('event', 'exception', {
        description: e.error.message,
        fatal: false
      });
    }
  });
  
  // Add CSS animations
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes slideInRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes slideUp {
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes slideDown {
      from { transform: translateY(-100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .animate-in {
      animation: fadeInUp 0.6s ease forwards;
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .site-header.scrolled {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
    }
    
    /* Loading states */
    .loading {
      opacity: 0.7;
      pointer-events: none;
    }
    
    /* High contrast mode support */
    @media (prefers-contrast: high) {
      .btn {
        border: 2px solid currentColor;
      }
    }
    
    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  `;
  
  document.head.appendChild(styleSheet);
});

// Export functions for global use
window.CreativeTaleem = {
  showNotification: function(message, type) {
    // Function will be available after DOM loaded
    setTimeout(() => {
      if (typeof showNotification !== 'undefined') {
        showNotification(message, type);
      }
    }, 100);
  },
  
  trackEvent: function(action, data) {
    if (typeof gtag !== 'undefined') {
      gtag('event', action, data);
    }
  }
};
