document.addEventListener('DOMContentLoaded', function() {
    const loader = document.querySelector('.galaxy-loader');
    
    // Hide loader after page is loaded
    const hideLoader = () => {
        loader.classList.add('hidden');
        setTimeout(() => {
            loader.style.display = 'none';
        }, 1000);
    };
    
    // Hide after 3 seconds minimum
    const minLoadTime = setTimeout(hideLoader, 3000);
    
    // Also hide when everything is loaded
    window.addEventListener('load', function() {
        clearTimeout(minLoadTime);
        hideLoader();
    });
    
    // In case the load event doesn't fire, ensure it hides after 5 seconds max
    setTimeout(hideLoader, 5000);
    
    // Show loader when clicking on navigation links
    document.querySelectorAll('a').forEach(link => {
        if (link.href && !link.href.startsWith('javascript') && !link.href.startsWith('#')) {
            link.addEventListener('click', function(e) {
                // Don't show loader for external links
                if (this.hostname === window.location.hostname) {
                    loader.style.display = 'flex';
                    loader.classList.remove('hidden');
                }
            });
        }
    });
});

// At the start of galaxy.js
document.body.classList.add('loading');

// Inside hideLoader function
document.body.classList.remove('loading');