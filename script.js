// Silver Age Literary Journal JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Smooth page initialization
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.8s ease-in-out';
        document.body.style.opacity = '1';
    }, 100);
    
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    
    // Elegant navigation transitions
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Fade out current section
            const currentSection = document.querySelector('.section:not(.hidden)');
            if (currentSection) {
                currentSection.style.opacity = '0';
                currentSection.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    currentSection.classList.add('hidden');
                    showTargetSection(this.getAttribute('href').substring(1));
                }, 300);
            } else {
                showTargetSection(this.getAttribute('href').substring(1));
            }
        });
    });
    
    function showTargetSection(targetId) {
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.classList.remove('hidden');
            targetSection.style.opacity = '0';
            targetSection.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                targetSection.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                targetSection.style.opacity = '1';
                targetSection.style.transform = 'translateY(0)';
            }, 50);
        }
    }
    
    // Enhanced read more functionality
    const readMoreLinks = document.querySelectorAll('.read-more');
    readMoreLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get the post card and title
            const postCard = this.closest('.post-card');
            const postTitle = postCard.querySelector('.post-title').textContent;
            
            // Create a poetic notification
            showNotification(`"${postTitle}" will open in the full journal version...`);
        });
        
        // Add hover effect for read more links
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(3px)';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
        });
    });
    
    // Gallery slot interactions
    const gallerySlots = document.querySelectorAll('.gallery-slot');
    gallerySlots.forEach((slot, index) => {
        slot.addEventListener('click', function() {
            const slotNumber = index + 1;
            showNotification(`Slot ${slotNumber}: Digital artwork will be placed here...`);
        });
        
        // Add elegant hover animations
        slot.addEventListener('mouseenter', function() {
            const frame = this.querySelector('.slot-frame');
            frame.style.transform = 'scale(1.05) rotate(0.5deg)';
            frame.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.2)';
        });
        
        slot.addEventListener('mouseleave', function() {
            const frame = this.querySelector('.slot-frame');
            frame.style.transform = 'scale(1) rotate(0deg)';
            frame.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
        });
    });
    
    // Post card hover effects
    const postCards = document.querySelectorAll('.post-card');
    postCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
            this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.12)';
        });
    });
    
    // Notification system
    function showNotification(message) {
        // Remove existing notification if any
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-ornament">❦</div>
                <p>${message}</p>
                <div class="notification-ornament">❦</div>
            </div>
        `;
        
        // Add notification styles
        const style = document.createElement('style');
        style.textContent = `
            .notification {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(248, 246, 240, 0.98);
                border: 2px solid var(--gold);
                padding: 2rem 3rem;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
                z-index: 1000;
                opacity: 0;
                transition: opacity 0.3s ease;
                max-width: 500px;
                text-align: center;
                backdrop-filter: blur(10px);
            }
            
            .notification-content {
                font-family: 'Crimson Text', serif;
                color: var(--charcoal);
            }
            
            .notification-content p {
                font-size: 1.1rem;
                line-height: 1.6;
                font-style: italic;
                margin: 1rem 0;
            }
            
            .notification-ornament {
                color: var(--gold);
                font-size: 1.2rem;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.remove();
                style.remove();
            }, 300);
        }, 3000);
    }
    
    // Utility functions for future NFT integration
    const journalUtils = {
        // Add new blog post
        addPost: function(title, date, category, excerpt, isVerse = false) {
            const postsGrid = document.querySelector('.posts-grid');
            const newPost = document.createElement('article');
            newPost.className = 'post-card';
            
            const ornaments = ['❦', '⚜'];
            const randomOrnament = ornaments[Math.floor(Math.random() * ornaments.length)];
            
            newPost.innerHTML = `
                <div class="post-header">
                    <div class="post-date">${date}</div>
                    <div class="post-category ${category.toLowerCase()}">${category}</div>
                </div>
                <div class="post-content">
                    <h2 class="post-title">${title}</h2>
                    <div class="post-excerpt">
                        <p class="${isVerse ? 'verse' : ''}">${excerpt}</p>
                    </div>
                    <a href="#" class="read-more">Read more</a>
                </div>
                <div class="post-ornament">${randomOrnament}</div>
            `;
            
            // Add event listeners to new post
            const readMore = newPost.querySelector('.read-more');
            readMore.addEventListener('click', function(e) {
                e.preventDefault();
                showNotification(`"${title}" will open in the full journal version...`);
            });
            
            postsGrid.insertBefore(newPost, postsGrid.firstChild);
            
            // Animate in
            newPost.style.opacity = '0';
            newPost.style.transform = 'translateY(30px)';
            setTimeout(() => {
                newPost.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                newPost.style.opacity = '1';
                newPost.style.transform = 'translateY(0)';
            }, 100);
        },
        
        // Prepare gallery for NFT integration
        prepareNFTGallery: function(nftCount = 6) {
            const galleryGrid = document.querySelector('.gallery-grid');
            if (!galleryGrid) return;
            
            galleryGrid.innerHTML = '';
            
            const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
            
            for (let i = 0; i < nftCount; i++) {
                const slot = document.createElement('div');
                slot.className = 'gallery-slot';
                slot.innerHTML = `
                    <div class="slot-frame">
                        <div class="slot-content">
                            <span class="slot-roman">${romanNumerals[i]}</span>
                            <span class="slot-label">Ready for placement</span>
                        </div>
                    </div>
                `;
                
                // Add click handler for thirdweb integration
                slot.addEventListener('click', function() {
                    showNotification(`Slot ${romanNumerals[i]}: Ready for thirdweb integration...`);
                });
                
                galleryGrid.appendChild(slot);
            }
        }
    };
    
    // Add subtle parallax effect to ornaments
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.post-ornament, .header-ornament, .footer-ornament');
        
        parallaxElements.forEach((element, index) => {
            const speed = 0.1 + (index * 0.05);
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
    
    // Add typing effect for quotes
    function typeWriter(element, text, speed = 50) {
        let i = 0;
        element.innerHTML = '';
        
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        type();
    }
    
    // Initialize any special effects
    const introQuote = document.querySelector('.intro-quote blockquote');
    if (introQuote) {
        const originalText = introQuote.textContent;
        setTimeout(() => {
            typeWriter(introQuote, originalText, 80);
        }, 1000);
    }
    
    // Export utilities for potential module use
    if (typeof window !== 'undefined') {
        window.journalUtils = journalUtils;
    }
});

// Add CSS custom properties update based on scroll
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const scrollProgress = scrolled / maxScroll;
    
    document.documentElement.style.setProperty('--scroll-progress', scrollProgress);
});
