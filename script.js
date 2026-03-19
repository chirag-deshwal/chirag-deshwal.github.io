document.addEventListener('DOMContentLoaded', () => {

    /* --- Boot Sequence --- */
    const bootSequence = document.getElementById('boot-sequence');
    const bootTexts = document.querySelectorAll('.boot-text span');

    let delay = 0;
    bootTexts.forEach((text, index) => {
        text.style.opacity = '0';
        setTimeout(() => {
            text.style.opacity = '1';
            // Typewriter effect per line could be added here
        }, delay);
        delay += 800; // 800ms per line
    });

    setTimeout(() => {
        bootSequence.style.opacity = '0';
        setTimeout(() => {
            bootSequence.style.display = 'none';
        }, 500);
    }, delay + 1000); // Wait a bit after last line


    /* --- Custom Cursor --- */
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');

    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;

        cursorOutline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 500, fill: "forwards" });
    });


    /* --- Tab Navigation --- */
    const navItems = document.querySelectorAll('.nav-item');
    const viewSections = document.querySelectorAll('.view-section');

    function switchToTab(targetId) {
        // Update active nav
        navItems.forEach(nav => nav.classList.remove('active'));
        const targetNav = document.querySelector(`[data-tab="${targetId}"]`);
        if (targetNav) targetNav.classList.add('active');

        // Show section
        viewSections.forEach(section => {
            if (section.id === `${targetId}-view` || (targetId === 'hub' && section.id === 'hub-view')) {
                // Use grid for hub-view, block for others
                if (section.id === 'hub-view') {
                    section.style.display = 'grid';
                } else {
                    section.style.display = 'block';
                }
                
                // Initialize constellation for skills tab
                if (targetId === 'skills' && !constellationCanvas) {
                    setTimeout(() => {
                        try {
                            const canvas = document.getElementById('skills-canvas');
                            if (canvas) {
                                // Ensure canvas is visible and has proper dimensions
                                const container = canvas.parentElement;
                                if (container && container.offsetWidth > 0) {
                                    initializeSkillsConstellation();
                                } else {
                                    // Wait a bit more for the layout to settle
                                    setTimeout(() => {
                                        initializeSkillsConstellation();
                                    }, 100);
                                }
                            } else {
                                console.warn('Skills canvas not found');
                            }
                        } catch (error) {
                            console.error('Error initializing constellation:', error);
                        }
                    }, 300);
                }
            } else {
                section.style.display = 'none';
            }
        });

        // Update URL hash
        window.location.hash = targetId === 'hub' ? '' : `#${targetId}`;
    }

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-tab');
            switchToTab(targetId);
        });
    });

    // Handle initial hash on page load
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash && ['achievements', 'deployments', 'skills', 'comms'].includes(initialHash)) {
        switchToTab(initialHash);
    }

    // Global function for buttons
    window.navigateToTab = function(targetId) {
        switchToTab(targetId);
    };

    window.showDownloadMessage = function() {
        alert('Downloading Resume...');
    };


    /* --- Progress Bar Animation --- */
    // Only animate when visible in viewport
    const progressBars = document.querySelectorAll('.progress-bar-fill');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const width = entry.target.style.width;
                entry.target.style.width = '0%';
                setTimeout(() => {
                    entry.target.style.transition = 'width 1.5s ease-out';
                    entry.target.style.width = width;
                }, 100);
                observer.unobserve(entry.target);
            }
        });
    });

    progressBars.forEach(bar => observer.observe(bar));

    /* --- Typing Effect for Role --- */
    const roles = ["Android Developer", "Flutter Expert", "AI Enthusiast", "Team Lead"];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const roleElement = document.querySelector('.role-title');

    // Simple blinking cursor is already in CSS
    // Function to rotate roles could be added for "more interactive" feel

    /* --- Interactive Skills Constellation --- */
    let constellationCanvas = null;
    let constellationCtx = null;
    let animationId = null;
    let isAnimating = true;
    let mouseX = 0;
    let mouseY = 0;
    let hoveredStar = null;

    // Constellation data - positions will be scaled to canvas size
    const constellations = {
        mobile: {
            name: 'Android Developer Journey',
            description: 'Core Android ecosystem with modern frameworks and cross-platform capabilities',
            color: '#00D4FF',
            stars: [
                { name: 'Android SDK', x: 0.25, y: 0.3, size: 8, connections: ['Kotlin', 'Java', 'Jetpack Compose', 'MVVM'] },
                { name: 'Kotlin', x: 0.15, y: 0.4, size: 6, connections: ['Android SDK', 'Flutter'] },
                { name: 'Java', x: 0.35, y: 0.4, size: 6, connections: ['Android SDK', 'API Integration'] },
                { name: 'Jetpack Compose', x: 0.2, y: 0.2, size: 5, connections: ['Android SDK', 'MVVM'] },
                { name: 'MVVM', x: 0.3, y: 0.15, size: 4, connections: ['Android SDK', 'Jetpack Compose'] }
            ]
        },
        crossPlatform: {
            name: 'Cross-Platform Nebula',
            description: 'Flutter and Dart ecosystem for universal app development',
            color: '#02569B',
            stars: [
                { name: 'Flutter', x: 0.6, y: 0.3, size: 7, connections: ['Dart', 'Firebase', 'SQLite'] },
                { name: 'Dart', x: 0.5, y: 0.4, size: 6, connections: ['Flutter'] }
            ]
        },
        data: {
            name: 'Data Nebula',
            description: 'Database technologies and data persistence solutions',
            color: '#FF6B6B',
            stars: [
                { name: 'SQLite', x: 0.55, y: 0.25, size: 6, connections: ['Room DB', 'Flutter'] },
                { name: 'Firebase', x: 0.65, y: 0.35, size: 6, connections: ['Flutter', 'Android SDK'] },
                { name: 'Room DB', x: 0.5, y: 0.3, size: 5, connections: ['SQLite', 'Android SDK'] }
            ]
        },
        backend: {
            name: 'Backend Cluster',
            description: 'Server-side technologies and API integrations',
            color: '#FFA500',
            stars: [
                { name: 'REST API', x: 0.45, y: 0.7, size: 5, connections: ['Java', 'AI Integration'] },
                { name: 'AI Integration', x: 0.55, y: 0.65, size: 4, connections: ['REST API', 'Android SDK'] }
            ]
        },
        tools: {
            name: 'Dev Tools Constellation',
            description: 'Essential development tools and version control',
            color: '#7F52FF',
            stars: [
                { name: 'Git', x: 0.4, y: 0.8, size: 5, connections: ['Android SDK', 'Flutter'] }
            ]
        }
    };

    // Flatten stars for easier access - positions will be calculated when canvas is ready
    let allStars = [];

    function initializeConstellationData() {
        allStars = [];
        Object.values(constellations).forEach(constellation => {
            constellation.stars.forEach(star => {
                // Convert relative positions to absolute pixel coordinates
                const absoluteStar = {
                    ...star,
                    x: star.x * constellationCanvas.width,
                    y: star.y * constellationCanvas.height,
                    constellation: constellation,
                    originalX: star.x * constellationCanvas.width,
                    originalY: star.y * constellationCanvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    twinkle: Math.random() * Math.PI * 2,
                    twinkleSpeed: 0.02 + Math.random() * 0.03
                };
                allStars.push(absoluteStar);
            });
        });
    }

    // Shooting stars
    let shootingStars = [];

    function createShootingStar() {
        if (!constellationCanvas) return;
        if (Math.random() < 0.02) { // 2% chance per frame
            shootingStars.push({
                x: Math.random() * constellationCanvas.width,
                y: 0,
                vx: (Math.random() - 0.5) * 2,
                vy: Math.random() * 3 + 1,
                life: 100,
                maxLife: 100
            });
        }
    }

    function updateShootingStars() {
        if (!constellationCanvas) return;
        shootingStars = shootingStars.filter(star => {
            star.x += star.vx;
            star.y += star.vy;
            star.life--;
            return star.life > 0 && star.y < constellationCanvas.height;
        });
    }

    function drawShootingStars() {
        shootingStars.forEach(star => {
            const alpha = star.life / star.maxLife;
            constellationCtx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            constellationCtx.lineWidth = 2;
            constellationCtx.beginPath();
            constellationCtx.moveTo(star.x, star.y);
            constellationCtx.lineTo(star.x - star.vx * 5, star.y - star.vy * 5);
            constellationCtx.stroke();
        });
    }

    function initializeSkillsConstellation() {
        constellationCanvas = document.getElementById('skills-canvas');
        constellationCtx = constellationCanvas.getContext('2d');

        // Set canvas size
        resizeCanvas();

        // Initialize constellation data with proper coordinates
        initializeConstellationData();

        // Mouse tracking
        constellationCanvas.addEventListener('mousemove', (e) => {
            const rect = constellationCanvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;

            // Check for hovered star
            hoveredStar = null;
            allStars.forEach(star => {
                const dx = mouseX - star.x;
                const dy = mouseY - star.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < star.size + 10) {
                    hoveredStar = star;
                }
            });

            // Update skill details
            updateSkillDetails();
        });

        constellationCanvas.addEventListener('mouseleave', () => {
            hoveredStar = null;
            updateSkillDetails();
        });

        constellationCanvas.addEventListener('click', () => {
            if (hoveredStar) {
                focusOnConstellation(hoveredStar.constellation);
            }
        });

        // Window resize handler
        window.addEventListener('resize', resizeCanvas);

        // Start animation
        animate();
    }

    function resizeCanvas() {
        const container = document.querySelector('.constellation-container');
        constellationCanvas.width = container.clientWidth;
        constellationCanvas.height = container.clientHeight;

        // Reinitialize constellation data with new canvas size
        if (constellationCanvas.width > 0 && constellationCanvas.height > 0) {
            initializeConstellationData();
        }
    }

    function animate() {
        if (!isAnimating || !constellationCanvas || !constellationCtx) return;

        constellationCtx.clearRect(0, 0, constellationCanvas.width, constellationCanvas.height);

        // Draw background stars
        drawBackgroundStars();

        // Create and update shooting stars
        createShootingStar();
        updateShootingStars();
        drawShootingStars();

        // Update and draw constellation stars
        allStars.forEach(star => {
            updateStar(star);
            drawStar(star);
        });

        // Draw connections
        drawConnections();

        // Draw constellation boundaries
        drawConstellationBoundaries();

        animationId = requestAnimationFrame(animate);
    }

    function drawBackgroundStars() {
        // Nebula effect
        const time = Date.now() * 0.001;
        const gradient = constellationCtx.createRadialGradient(
            constellationCanvas.width / 2, constellationCanvas.height / 2, 0,
            constellationCanvas.width / 2, constellationCanvas.height / 2, 300
        );
        gradient.addColorStop(0, `rgba(0, 212, 255, ${0.05 + Math.sin(time) * 0.02})`);
        gradient.addColorStop(0.5, `rgba(127, 82, 255, ${0.03 + Math.cos(time * 0.7) * 0.01})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        constellationCtx.fillStyle = gradient;
        constellationCtx.fillRect(0, 0, constellationCanvas.width, constellationCanvas.height);

        // Background stars
        for (let i = 0; i < 100; i++) {
            const x = (i * 37) % constellationCanvas.width;
            const y = (i * 23) % constellationCanvas.height;
            const brightness = 0.3 + Math.sin(Date.now() * 0.001 + i) * 0.2;

            constellationCtx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
            constellationCtx.beginPath();
            constellationCtx.arc(x, y, 1, 0, Math.PI * 2);
            constellationCtx.fill();
        }
    }

    function updateStar(star) {
        // Gentle floating motion
        star.x += star.vx;
        star.y += star.vy;

        // Boundary checks - keep them close to their original positions so they don't wander heavily
        const maxDrift = 40;
        if (star.x < star.originalX - maxDrift || star.x > star.originalX + maxDrift) {
            star.vx *= -1;
            star.x = Math.max(star.originalX - maxDrift, Math.min(star.originalX + maxDrift, star.x));
        }
        if (star.y < star.originalY - maxDrift || star.y > star.originalY + maxDrift) {
            star.vy *= -1;
            star.y = Math.max(star.originalY - maxDrift, Math.min(star.originalY + maxDrift, star.y));
        }

        // Avoid hiding behind the UI panel on the right (approx 320px wide)
        const maxRight = Math.max(10, constellationCanvas.width - 320);
        if (star.x > maxRight) {
            star.x -= 2;
            if (star.vx > 0) star.vx *= -1;
        }

        // Twinkle effect
        star.twinkle += star.twinkleSpeed;

        // Mouse interaction
        if (hoveredStar === star) {
            const dx = mouseX - star.x;
            const dy = mouseY - star.y;
            star.x += dx * 0.02;
            star.y += dy * 0.02;
        }
    }

    function drawStar(star) {
        const twinkleOpacity = 0.7 + Math.sin(star.twinkle) * 0.3;
        const isHovered = hoveredStar === star;
        const displaySize = isHovered ? star.size * 1.5 : star.size; // Grow slightly on hover

        // Outer glow
        if (isHovered) {
            // Animated, pulsating larger glow
            const glowSize = displaySize * (3 + Math.sin(Date.now() / 150) * 0.5);
            const gradient = constellationCtx.createRadialGradient(star.x, star.y, 0, star.x, star.y, glowSize);
            gradient.addColorStop(0, star.constellation.color + '60');
            gradient.addColorStop(1, star.constellation.color + '00');
            constellationCtx.fillStyle = gradient;
            constellationCtx.beginPath();
            constellationCtx.arc(star.x, star.y, glowSize, 0, Math.PI * 2);
            constellationCtx.fill();
        }

        // Main star
        constellationCtx.fillStyle = star.constellation.color;
        constellationCtx.globalAlpha = twinkleOpacity;
        constellationCtx.beginPath();
        constellationCtx.arc(star.x, star.y, displaySize, 0, Math.PI * 2);
        constellationCtx.fill();

        // Inner bright core
        constellationCtx.fillStyle = '#FFFFFF';
        constellationCtx.globalAlpha = twinkleOpacity * 0.8;
        constellationCtx.beginPath();
        constellationCtx.arc(star.x, star.y, displaySize * 0.4, 0, Math.PI * 2);
        constellationCtx.fill();

        constellationCtx.globalAlpha = 1;

        // Star name and connections (when hovered)
        if (isHovered) {
            constellationCtx.fillStyle = '#FFFFFF';
            constellationCtx.font = 'bold 14px Outfit';
            constellationCtx.textAlign = 'center';
            constellationCtx.fillText(star.name, star.x, star.y - star.size - 25);
            
            if (star.connections && star.connections.length > 0) {
                constellationCtx.fillStyle = '#AAAAAA';
                constellationCtx.font = '11px Outfit';
                constellationCtx.fillText('Connected to: ' + star.connections.join(', '), star.x, star.y - star.size - 10);
            }
        }
    }

    function drawConnections() {
        allStars.forEach(star => {
            star.connections.forEach(connectionName => {
                const connectedStar = allStars.find(s => s.name === connectionName);
                if (connectedStar) {
                    const dx = connectedStar.x - star.x;
                    const dy = connectedStar.y - star.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    // Always draw specified connections, remove max distance limit
                    const isHighlighted = (hoveredStar === star || hoveredStar === connectedStar);

                    constellationCtx.strokeStyle = star.constellation.color;
                    constellationCtx.globalAlpha = isHighlighted ? 0.9 : 0.3;
                    constellationCtx.lineWidth = isHighlighted ? 3 : 1; // Thicker lines for hovered

                    if (isHighlighted) {
                        // Animated dashed lines for connections
                        constellationCtx.setLineDash([8, 6]);
                        constellationCtx.lineDashOffset = -Date.now() / 40;
                    } else {
                        constellationCtx.setLineDash([]);
                    }

                    constellationCtx.beginPath();
                    constellationCtx.moveTo(star.x, star.y);
                    constellationCtx.lineTo(connectedStar.x, connectedStar.y);
                    constellationCtx.stroke();

                    constellationCtx.setLineDash([]); // Reset immediately after stroke

                    // Animated energy particles along connection
                    if (isHighlighted && Math.random() < 0.2) { // Increased particle spawn rate
                        const particleX = star.x + dx * Math.random();
                        const particleY = star.y + dy * Math.random();

                        constellationCtx.fillStyle = '#FFFFFF'; // Bright white particles
                        constellationCtx.globalAlpha = 1.0;
                        constellationCtx.beginPath();
                        constellationCtx.arc(particleX, particleY, 2.5, 0, Math.PI * 2);
                        constellationCtx.fill();
                    }
                }
            });
        });
        constellationCtx.globalAlpha = 1;
    }

    function drawConstellationBoundaries() {
        Object.values(constellations).forEach(constellation => {
            const stars = constellation.stars;
            if (stars.length < 3) return;

            // Calculate bounding box
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            stars.forEach(star => {
                minX = Math.min(minX, star.x);
                minY = Math.min(minY, star.y);
                maxX = Math.max(maxX, star.x);
                maxY = Math.max(maxY, star.y);
            });

            // Draw constellation outline
            constellationCtx.strokeStyle = constellation.color;
            constellationCtx.globalAlpha = 0.2;
            constellationCtx.lineWidth = 1;
            constellationCtx.setLineDash([5, 5]);
            constellationCtx.strokeRect(minX - 20, minY - 20, maxX - minX + 40, maxY - minY + 40);
            constellationCtx.setLineDash([]);

            constellationCtx.globalAlpha = 1;
        });
    }

    function focusOnConstellation(constellation) {
        const centerX = constellationCanvas.width / 2;
        const centerY = constellationCanvas.height / 2;

        // Calculate constellation center
        let totalX = 0, totalY = 0;
        constellation.stars.forEach(star => {
            totalX += star.x;
            totalY += star.y;
        });
        const constCenterX = totalX / constellation.stars.length;
        const constCenterY = totalY / constellation.stars.length;

        // Smooth transition to constellation
        const offsetX = centerX - constCenterX;
        const offsetY = centerY - constCenterY;

        allStars.forEach(star => {
            star.x += offsetX * 0.5;
            star.y += offsetY * 0.5;
        });

        // Update info panel
        document.getElementById('constellation-title').textContent = constellation.name;
        document.getElementById('constellation-desc').textContent = constellation.description;
    }

    function resetView() {
        allStars.forEach(star => {
            star.x = star.originalX;
            star.y = star.originalY;
        });
    }

    function toggleAnimation() {
        isAnimating = !isAnimating;
        const btn = document.getElementById('toggleAnimation');
        const icon = btn.querySelector('i');

        if (isAnimating) {
            icon.className = 'fas fa-play';
            btn.innerHTML = '<i class="fas fa-play"></i> Pause Animation';
            animate();
        } else {
            icon.className = 'fas fa-pause';
            btn.innerHTML = '<i class="fas fa-pause"></i> Resume Animation';
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        }
    }

    function updateSkillDetails() {
        const skillItems = document.querySelectorAll('.skill-item');
        skillItems.forEach(item => {
            item.classList.remove('active');
        });

        if (hoveredStar) {
            const skillName = hoveredStar.name.toLowerCase().replace(/\s+/g, '');
            const skillItem = document.querySelector(`[data-skill="${skillName}"]`);
            if (skillItem) {
                skillItem.classList.add('active');
            }
        }
    }

});
