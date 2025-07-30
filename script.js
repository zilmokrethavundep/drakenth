// script.js

// Global DOM Elements (accessible to both main portfolio and project pages)
const themeToggle = document.querySelector('.theme-toggle');
const moonIcon = document.querySelector('.fa-moon');
const sunIcon = document.querySelector('.fa-sun');
const body = document.body;

// Universal Theme Toggle Functionality (applies to all pages where theme-toggle exists)
if (themeToggle && moonIcon && sunIcon) {
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        moonIcon.classList.toggle('active');
        sunIcon.classList.toggle('active');

        // Save theme preference
        const isDarkMode = body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
    });
}

// Function to initialize the EV Image Slider (can be used on both main and project pages if needed)
function initializeEVSlider() {
    const container = document.querySelector('.embedded-slider');
    if (!container) return; // Exit if no slider container is found

    let currentSlide = 0;
    const slides = container.querySelectorAll('.slide');
    const indicators = container.querySelectorAll('.indicator');
    const prevBtn = container.querySelector('#prevBtn');
    const nextBtn = container.querySelector('#nextBtn');
    const totalSlides = slides.length;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(dot => dot.classList.remove('active'));
        slides[index].classList.add('active');
        indicators[index].classList.add('active');
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        showSlide(currentSlide);
    }

    if (prevBtn && nextBtn && slides.length > 0) { // Ensure slides exist
        nextBtn.addEventListener('click', nextSlide);
        prevBtn.addEventListener('click', prevSlide);

        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                currentSlide = index;
                showSlide(currentSlide);
            });
        });

        showSlide(currentSlide); // Show the initial slide
    }
}

// Universal Image Modal (for enlarging images on both main and project pages)
document.addEventListener('click', function(e) {
    // Check if clicked element is an image in achievements or certifications sections
    if (e.target.tagName === 'IMG' && 
        (e.target.closest('#achievements') || e.target.closest('#certifications'))) {
        e.preventDefault();
        e.stopPropagation();
        
        const imageUrl = e.target.src;
        const imageAlt = e.target.alt || 'Enlarged Image';
        
        const modal = document.createElement('div');
        modal.classList.add('image-modal');
        modal.innerHTML = `
            <span class="close-modal">&times;</span>
            <img src="${imageUrl}" alt="${imageAlt}">
        `;
        
        document.body.appendChild(modal);
        
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
        
        // Add active class after brief delay for transition
        setTimeout(() => modal.classList.add('active'), 10);

        modal.addEventListener('click', function(event) {
            if (event.target === modal || event.target.classList.contains('close-modal')) {
                event.preventDefault();
                event.stopPropagation();
                modal.classList.remove('active');
                
                // Restore body scroll
                document.body.style.overflow = '';
                
                // Remove modal after transition
                setTimeout(() => {
                    if (modal.parentNode) {
                        modal.remove();
                    }
                }, 300);
            }
        });
        
        // Close modal on Escape key
        const handleEscape = function(event) {
            if (event.key === 'Escape') {
                modal.click();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }
});

// Intersection Observer for revealing elements on scroll (applies to both main and project pages)
const revealElements = document.querySelectorAll('.glass-card, .section-heading, .skill-bar, .project-card, .timeline-item, .contact-info-item, .social-links a, .project-section, .project-header, .project-footer');

const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // Stop observing once revealed
        }
    });
}, {
    threshold: 0.1 // Adjust as needed
});

revealElements.forEach(element => {
    revealObserver.observe(element);
});


// ----------------------------------------------------
// Conditional Logic based on Page Type
// ----------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // Apply saved theme preference on page load for all pages
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        body.classList.add('dark-mode');
        if (moonIcon && sunIcon) {
            moonIcon.classList.add('active');
            sunIcon.classList.remove('active');
        }
    }

    if (body.classList.contains('project-page')) {
        // ----------------------------------------------------
        // Code specific to projects.html
        // ----------------------------------------------------

        // Project Details Elements
        const projectDetails = document.getElementById('project-details');
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('id');

        // Function to load project details based on ID
        function loadProjectDetails(id) {
            if (!projectDetails) return; // Ensure projectDetails element exists

            // Show loader while content is loading
            projectDetails.innerHTML = `
                <div class="loader">
                    <div class="spinner"></div>
                </div>
            `;

            // Simulate loading time (optional, can be removed)
            setTimeout(() => {
                const template = document.getElementById(`project-template-${id}`);

                if (template) {
                    projectDetails.innerHTML = template.innerHTML;
                    initializeEVSlider(); // Initialize slider after content is loaded
                } else {
                    // Display message if project not found
                    projectDetails.innerHTML = `
                        <div class="project-header">
                            <h1>Project Not Found</h1>
                            <p>The project you are looking for does not exist or the ID is incorrect.</p>
                        </div>
                        <a href="index.html" class="btn primary">Back to Portfolio</a>
                    `;
                }
            }, 500); // Adjust loading time as needed
        }

        // Load project details if projectId and projectDetails element exist
        if (projectId && projectDetails) {
            loadProjectDetails(projectId);
        }

    } else {
        // ----------------------------------------------------
        // Code specific to index.html (main portfolio page)
        // ----------------------------------------------------

        // DOM Elements
        const sections = document.querySelectorAll('.section');
        const navLinks = document.querySelectorAll('.nav-link');
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        const sidebar = document.querySelector('.sidebar');
        const mobileOverlay = document.querySelector('.mobile-overlay');

        // Intersection Observer for scroll spy
        let currentSection = 'about';
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -70% 0px',
            threshold: 0
        };

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    updateActiveNavigation(sectionId);
                    updatePageTitle(sectionId);
                    updateURL(sectionId);

                    // Initialize skills animation if skills section is active
                    if (sectionId === 'skills') {
                        // Delay to ensure section is fully visible
                        setTimeout(() => {
                            initSkillsAnimation();
                        }, 100);
                    }
                }
            });
        }, observerOptions);

        // Initialize observers
        function initializeObservers() {
            sections.forEach(section => {
                sectionObserver.observe(section);
            });
        }

        // Update active navigation link based on section in view
        function updateActiveNavigation(sectionId) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.dataset.section === sectionId) {
                    link.classList.add('active');
                }
            });
        }

        // Update page title
        function updatePageTitle(sectionId) {
            const sectionName = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
            document.title = `Chakradhar's Portfolio - ${sectionName}`;
        }

        // Update URL without reloading
        function updateURL(sectionId) {
            history.replaceState(null, '', `#${sectionId}`);
        }

        // Smooth scroll to section
        function scrollToSection(sectionId) {
            const section = document.getElementById(sectionId);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        }

        // Mobile menu functionality - UPDATED LOGIC HERE
        function toggleMobileMenu() {
            const isOpen = sidebar.classList.contains('mobile-open'); 
            if (isOpen) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
            // Removed individual class toggles as openMobileMenu/closeMobileMenu handle them
        }

        function openMobileMenu() {
            sidebar.classList.add('mobile-open');
            mobileOverlay.classList.add('visible');
            mobileMenuToggle.classList.add('active');
            document.body.classList.add('no-scroll');
        }

        function closeMobileMenu() {
            sidebar.classList.remove('mobile-open');
            mobileOverlay.classList.remove('visible');
            mobileMenuToggle.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }

        // Skills animation
        function initSkillsAnimation() {
            const skillItems = document.querySelectorAll('.skill-item');
            const skillBars = document.querySelectorAll('.skill-progress');
            
            // Set up skill progress bars with data attributes
            skillBars.forEach((bar, index) => {
                const skillInfo = bar.closest('.skill-item').querySelector('.skill-info p:last-child');
                if (skillInfo) {
                    const percent = skillInfo.textContent.trim();
                    bar.style.setProperty('--target-width', percent);
                }
            });
            
            // Create intersection observer for skill items
            const skillObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const skillItem = entry.target;
                        const skillBar = skillItem.querySelector('.skill-progress');
                        
                        // Add visible class to skill item
                        skillItem.classList.add('visible');
                        
                        // Animate skill bar after a short delay
                        setTimeout(() => {
                            if (skillBar) {
                                skillBar.classList.add('animate');
                            }
                        }, 200);
                        
                        // Stop observing this item
                        skillObserver.unobserve(skillItem);
                    }
                });
            }, {
                threshold: 0.3,
                rootMargin: '0px 0px -50px 0px'
            });
            
            // Observe all skill items
            skillItems.forEach(item => {
                skillObserver.observe(item);
            });
        }

        // Mobile menu event listeners
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation(); // Keeping this as per your working code
                toggleMobileMenu();
            });
        }
        if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileMenu);

        // Navigation click handlers - APPLIED FIXES HERE
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault(); // Prevent default anchor behavior
                // e.stopPropagation(); // Removed as per previous suggestion and working code pattern

                const targetSection = this.dataset.section;
                // console.log('Navigation clicked:', targetSection); // Debug log, can be uncommented if needed

                // Close mobile menu if open
                if (window.innerWidth <= 768 && sidebar.classList.contains('mobile-open')) {
                    closeMobileMenu();
                }
                
                // Update active navigation
                updateActiveNavigation(targetSection);

                // Scroll to section with a small delay to ensure menu closes first (Crucial Fix)
                setTimeout(() => {
                    scrollToSection(targetSection);
                }, window.innerWidth <= 768 ? 300 : 0);
            });
        });

        // Handle initial hash in URL or default to 'about'
        const hash = window.location.hash.substring(1);
        if (hash && document.getElementById(hash)) {
            setTimeout(() => {
                scrollToSection(hash);
            }, 100); // Small delay to ensure rendering before scroll
        } else {
            updateActiveNavigation('about');
            updatePageTitle('about');
        }

        initializeObservers();

        // Popstate event for back/forward navigation
        window.addEventListener('popstate', () => {
            const hash = window.location.hash.substring(1);
            if (hash) {
                updateActiveNavigation(hash);
                updatePageTitle(hash);
                scrollToSection(hash);
            } else {
                updateActiveNavigation('about');
                updatePageTitle('about');
                scrollToSection('about');
            }
        });

        // Adjust sidebar on window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && sidebar.classList.contains('mobile-open')) {
                closeMobileMenu();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sidebar.classList.contains('mobile-open')) {
                closeMobileMenu();
            }
        });

        // Touch gestures for mobile
        let touchStartX = 0;
        let touchEndX = 0;
        let touchStartY = 0;
        let touchEndY = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        });

        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            handleSwipe();
        });

        function handleSwipe() {
            const swipeThreshold = 100;
            const swipeDistance = touchEndX - touchStartX;
            const verticalSwipeDistance = Math.abs(touchEndY - touchStartY);

            // Only handle horizontal swipes (ignore vertical scrolling)
            if (Math.abs(swipeDistance) > swipeThreshold && verticalSwipeDistance < swipeThreshold) {
                if (swipeDistance > 0 && !sidebar.classList.contains('mobile-open')) {
                    // Swipe right - open menu
                    openMobileMenu();
                } else if (swipeDistance < 0 && sidebar.classList.contains('mobile-open')) {
                    // Swipe left - close menu
                    closeMobileMenu();
                }
            }
        }

    }
});