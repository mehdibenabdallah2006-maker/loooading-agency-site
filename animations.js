/**
 * Loooading Agency - Animations & Interactions
 * Custom Cursor, Navbar Scroll, Smooth Scroll, Reveal animations
 */
document.addEventListener('DOMContentLoaded', () => {

    /* --- 1. Custom Cursor --- */
    const cursorDot = document.getElementById('cursorDot');
    const cursorOutline = document.getElementById('cursorOutline');
    let mouseX = 0, mouseY = 0;
    let outlineX = 0, outlineY = 0;

    // Only run custom cursor on non-touch devices
    if (window.matchMedia("(pointer: fine)").matches && cursorDot && cursorOutline) {
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            // Dot follows exactly
            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;
        });

        const animateOutline = () => {
            // Outline follows with easing
            let distX = mouseX - outlineX;
            let distY = mouseY - outlineY;

            outlineX += distX * 0.15;
            outlineY += distY * 0.15;

            cursorOutline.style.left = `${outlineX}px`;
            cursorOutline.style.top = `${outlineY}px`;

            requestAnimationFrame(animateOutline);
        };

        animateOutline();

        // Hover states for links and interactive elements
        const iterables = document.querySelectorAll('a, button, input, textarea, .portfolio-card');

        iterables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorDot.classList.add('hovering');
                cursorOutline.classList.add('hovering');
            });
            el.addEventListener('mouseleave', () => {
                cursorDot.classList.remove('hovering');
                cursorOutline.classList.remove('hovering');
            });
        });
    }

    /* --- 2. Navbar Scroll Behavior --- */
    const navbar = document.getElementById('navbar');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        if (!navbar) return;

        const currentScroll = window.scrollY;

        // Add blurred background when scrolling down
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
            navbar.classList.remove('hidden');
        }

        // Hide on scroll down, show on scroll up (after 500px)
        if (currentScroll > 500 && currentScroll > lastScrollY) {
            navbar.classList.add('hidden');
        } else if (currentScroll < lastScrollY) {
            navbar.classList.remove('hidden');
        }

        lastScrollY = currentScroll;
    });

    /* --- 3. Mobile Navigation Toggle --- */
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('active');

            // Prevent body scroll when menu is open
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu when clicking a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    /* --- 4. Smooth Scrolling --- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    /* --- 5. Scroll Reveal with Intersection Observer --- */
    const revealElements = document.querySelectorAll('.reveal');

    // Add staggered delays for specific grids
    const staggerContainers = ['.focus-grid', '.portfolio-masonry'];
    staggerContainers.forEach(containerSelector => {
        const container = document.querySelector(containerSelector);
        if (container) {
            const children = container.querySelectorAll('.reveal');
            children.forEach((child, index) => {
                // Add 100ms delay for each sequential item
                child.style.transitionDelay = `${index * 100}ms`;
            });
        }
    });

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                // Unobserve after revealing to animate only once
                observer.unobserve(entry.target);

                // Remove transition delay after animation completes
                setTimeout(() => {
                    entry.target.style.transitionDelay = '0ms';
                }, 1000);
            }
        });
    }, {
        root: null,
        rootMargin: '0px 0px -100px 0px', // Trigger slightly before the element enters the viewport
        threshold: 0.1
    });

    revealElements.forEach(element => {
        revealObserver.observe(element);
    });

    /* --- 6. Magnetic Buttons --- */
    const magneticElements = document.querySelectorAll('.magnetic');

    if (window.matchMedia("(pointer: fine)").matches) {
        magneticElements.forEach(element => {
            element.addEventListener('mousemove', (e) => {
                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                // Move button slightly towards cursor
                element.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
            });

            element.addEventListener('mouseleave', () => {
                // Reset position smoothly
                element.style.transform = 'translate(0px, 0px)';
                element.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';

                setTimeout(() => {
                    element.style.transition = ''; // Remove transition so mousemove is snappy
                }, 500);
            });
        });
    }

    /* --- 7. Form Submission Interaction --- */
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const originalText = btn.innerHTML;

            btn.innerHTML = `<span>Sent!</span><span class="animated-dots-small"><span class="dot">.</span><span class="dot">.</span><span class="dot">.</span></span>`;

            setTimeout(() => {
                btn.innerHTML = originalText;
                form.reset();
            }, 3000);
        });
    }

    /* --- 8. Intro Video Logic --- */
    const introOverlay = document.getElementById('introOverlay');
    const introVideo = document.getElementById('introVideo');

    if (introOverlay && introVideo) {
        // Quand la vidéo se termine, on révèle le site
        introVideo.addEventListener('ended', () => {
            introOverlay.classList.add('hidden');
        });

        // Sécurité : si la vidéo ne peut pas autoplay (mobile), on la masque après un délai
        setTimeout(() => {
            if (!introVideo.currentTime || introVideo.currentTime < 0.1) {
                introOverlay.classList.add('hidden');
            }
        }, 12000); // 12 secondes max avant de forcer l'affichage du site
    }
});
