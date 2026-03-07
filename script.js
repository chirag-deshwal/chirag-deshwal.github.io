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
                
                // Initialize mind map for skills tab
                if (targetId === 'skills' && !cy) {
                    setTimeout(() => {
                        try {
                            const cyContainer = document.getElementById('cy');
                            if (cyContainer) {
                                initializeSkillsMindMap();
                            } else {
                                console.warn('Cytoscape container not found');
                            }
                        } catch (error) {
                            console.error('Error initializing mind map:', error);
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

    /* --- Interactive Skills Mind Map --- */
    let cy = null;

    function initializeSkillsMindMap() {
        cy = cytoscape({
            container: document.getElementById('cy'),
            style: [
                {
                    selector: 'node',
                    style: {
                        'content': 'data(label)',
                        'text-valign': 'center',
                        'text-halign': 'center',
                        'background-color': 'data(color)',
                        'width': 'data(size)',
                        'height': 'data(size)',
                        'border-width': '3px',
                        'border-color': 'data(borderColor)',
                        'color': '#FFFFFF',
                        'font-size': 'data(fontSize)',
                        'font-weight': 'bold',
                        'font-family': 'var(--font-ui)',
                        'text-background-color': '#0B0C15',
                        'text-background-padding': '6px',
                        'text-background-opacity': 0.95,
                        'text-background-shape': 'roundrectangle',
                        'text-margin-y': '2px',
                        'box-shadow': 'data(shadow)',
                        'transition-property': 'box-shadow',
                        'transition-duration': '0.3s'
                    }
                },
                {
                    selector: 'node:hover',
                    style: {
                        'border-width': '4px',
                        'border-color': '#FFFFFF',
                        'box-shadow': '0 0 25px currentColor'
                    }
                },
                {
                    selector: 'node[category="hub"]',
                    style: {
                        'width': '110px',
                        'height': '110px',
                        'font-size': '13px',
                        'text-background-padding': '8px',
                        'box-shadow': '0 0 15px currentColor'
                    }
                },
                {
                    selector: 'node[category="primary"]',
                    style: {
                        'width': '85px',
                        'height': '85px',
                        'font-size': '12px',
                        'box-shadow': '0 0 10px currentColor'
                    }
                },
                {
                    selector: 'node[category="secondary"]',
                    style: {
                        'width': '70px',
                        'height': '70px',
                        'font-size': '10px',
                        'box-shadow': '0 0 8px currentColor'
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'line-color': 'data(edgeColor)',
                        'width': 'data(edgeWidth)',
                        'curve-style': 'bezier',
                        'target-arrow-color': 'data(edgeColor)',
                        'target-arrow-shape': 'vee',
                        'opacity': 0.7,
                        'z-index': 1
                    }
                },
                {
                    selector: 'edge.highlight',
                    style: {
                        'line-color': 'data(edgeColor)',
                        'width': '3px',
                        'target-arrow-color': 'data(edgeColor)',
                        'opacity': 1,
                        'z-index': 10,
                        'box-shadow': '0 0 10px currentColor'
                    }
                }
            ],
            elements: [
                // Core Hubs
                { data: { id: 'android', label: 'Mobile App', color: '#00D4FF', borderColor: '#0099CC', size: '110px', fontSize: '13px', shadow: '0 0 15px #00D4FF', category: 'hub' } },
                { data: { id: 'databases', label: 'Databases', color: '#FF6B6B', borderColor: '#CC0000', size: '110px', fontSize: '13px', shadow: '0 0 15px #FF6B6B', category: 'hub' } },

                // Android Ecosystem (Primary)
                { data: { id: 'kotlin', label: 'Kotlin', color: '#7F52FF', borderColor: '#5C3ACC', size: '85px', fontSize: '12px', category: 'primary' } },
                { data: { id: 'java', label: 'Java', color: '#FF6B6B', borderColor: '#CC0000', size: '85px', fontSize: '12px', category: 'primary' } },
                { data: { id: 'sdk', label: 'Android SDK', color: '#4ECDC4', borderColor: '#2BA89F', size: '85px', fontSize: '12px', category: 'primary' } },
                { data: { id: 'jetpack', label: 'Jetpack Compose', color: '#FFB347', borderColor: '#FF8C00', size: '85px', fontSize: '12px', category: 'primary' } },
                { data: { id: 'mvvm', label: 'MVVM Pattern', color: '#95E1D3', borderColor: '#5DBFAA', size: '85px', fontSize: '12px', category: 'primary' } },

                // Cross-Platform (Primary)
                { data: { id: 'flutter', label: 'Flutter', color: '#02569B', borderColor: '#013E7A', size: '85px', fontSize: '12px', category: 'primary' } },
                { data: { id: 'dart', label: 'Dart', color: '#00D4D4', borderColor: '#00A0A0', size: '85px', fontSize: '12px', category: 'primary' } },

                // Database Technologies (Primary)
                { data: { id: 'sqlite', label: 'SQLite', color: '#BFDB38', borderColor: '#99BB00', size: '85px', fontSize: '12px', category: 'primary' } },
                { data: { id: 'firebase', label: 'Firebase', color: '#FFA500', borderColor: '#FF8C00', size: '85px', fontSize: '12px', category: 'primary' } },
                { data: { id: 'room', label: 'Room DB', color: '#A8D5BA', borderColor: '#7DBFAA', size: '85px', fontSize: '12px', category: 'primary' } },

                // Backend & Integration (Secondary)
                { data: { id: 'api', label: 'REST API', color: '#C1666B', borderColor: '#994444', size: '70px', fontSize: '10px', category: 'secondary' } },
                { data: { id: 'git', label: 'Git', color: '#F4511E', borderColor: '#CC3300', size: '70px', fontSize: '10px', category: 'secondary' } },
                { data: { id: 'ai', label: 'AI Integration', color: '#9B59B6', borderColor: '#7A4499', size: '70px', fontSize: '10px', category: 'secondary' } },

                // Edges - Android connections (Blue theme for Android)
                { data: { source: 'android', target: 'kotlin', edgeColor: '#00D4FF', edgeWidth: '2.5px' } },
                { data: { source: 'android', target: 'java', edgeColor: '#00D4FF', edgeWidth: '2.5px' } },
                { data: { source: 'android', target: 'sdk', edgeColor: '#00D4FF', edgeWidth: '2.5px' } },
                { data: { source: 'android', target: 'jetpack', edgeColor: '#00D4FF', edgeWidth: '2.5px' } },
                { data: { source: 'android', target: 'mvvm', edgeColor: '#00D4FF', edgeWidth: '2.5px' } },
                { data: { source: 'android', target: 'api', edgeColor: '#00D4FF', edgeWidth: '2px' } },

                // Database connections (Red theme for Databases)
                { data: { source: 'databases', target: 'sqlite', edgeColor: '#FF6B6B', edgeWidth: '2.5px' } },
                { data: { source: 'databases', target: 'firebase', edgeColor: '#FF6B6B', edgeWidth: '2.5px' } },
                { data: { source: 'databases', target: 'room', edgeColor: '#FF6B6B', edgeWidth: '2.5px' } },

                // Cross connections (Gradient-style colors)
                { data: { source: 'kotlin', target: 'flutter', edgeColor: '#7F52FF', edgeWidth: '2px' } },
                { data: { source: 'java', target: 'api', edgeColor: '#FF6B6B', edgeWidth: '2px' } },
                { data: { source: 'firebase', target: 'android', edgeColor: '#FFA500', edgeWidth: '2px' } },
                { data: { source: 'firebase', target: 'flutter', edgeColor: '#FFA500', edgeWidth: '2px' } },
                { data: { source: 'room', target: 'android', edgeColor: '#A8D5BA', edgeWidth: '2px' } },
                { data: { source: 'sqlite', target: 'flutter', edgeColor: '#BFDB38', edgeWidth: '2px' } },
                { data: { source: 'git', target: 'android', edgeColor: '#F4511E', edgeWidth: '2px' } },
                { data: { source: 'git', target: 'flutter', edgeColor: '#F4511E', edgeWidth: '2px' } },
                { data: { source: 'ai', target: 'android', edgeColor: '#9B59B6', edgeWidth: '2px' } },
                { data: { source: 'dart', target: 'flutter', edgeColor: '#00D4D4', edgeWidth: '2px' } },
                { data: { source: 'mvvm', target: 'jetpack', edgeColor: '#95E1D3', edgeWidth: '2px' } }
            ],
            layout: {
                name: 'cose',
                directed: true,
                roots: '#android',
                animate: true,
                animationDuration: 500,
                avoidOverlap: true,
                nodeSpacing: 10,
                gravity: 0.25,
                cooling: 0.95
            },
            wheelSensitivity: 0.1
        });

        // Enable dragging
        cy.elements().ungrabify();
        cy.nodes().grabify();

        // Click to highlight connections
        cy.on('tap', 'node', function(evt) {
            const node = evt.target;
            cy.elements().removeClass('highlight');
            node.connectedEdges().addClass('highlight');
            node.addClass('highlight');
        });

        cy.on('tap', function() {
            cy.elements().removeClass('highlight');
        });

        // Zoom and Pan controls
        document.getElementById('zoomIn').addEventListener('click', () => {
            cy.zoom(cy.zoom() * 1.2);
        });

        document.getElementById('zoomOut').addEventListener('click', () => {
            cy.zoom(cy.zoom() / 1.2);
        });

        document.getElementById('resetZoom').addEventListener('click', () => {
            cy.fit(undefined, 50);
            cy.zoom(1);
            cy.pan({ x: 0, y: 0 });
        });
    }

});
