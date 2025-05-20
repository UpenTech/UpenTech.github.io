document.addEventListener('DOMContentLoaded', () => {
    const radar = document.getElementById('radar');
    const tooltip = document.getElementById('tooltip');
    const canvas = document.getElementById("radar-canvas");
    const ctx = canvas.getContext("2d");
    
    // Animation control
    let animationFrameId = null;
    let globalRotation = 0;
    const rotationSpeed = 0.3; // Reduced speed for slower rotation (degrees per frame)

    // Responsive canvas setup
    function resizeCanvas() {
        const size = Math.min(radar.offsetWidth, radar.offsetHeight);
        canvas.width = size;
        canvas.height = size;
        drawRadar();
        positionAircraft(); // Reposition aircraft after resize
    }

    function drawRadar() {
        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = width / 2 - 20;

        ctx.clearRect(0, 0, width, height);

        // Draw radar circles (unchanged)
        ctx.save();
        ctx.strokeStyle = "rgba(0,255,0,0.3)";
        ctx.lineWidth = 1;
        for (let r = radius / 4; r <= radius; r += radius / 4) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, r, 0, 2 * Math.PI);
            ctx.stroke();
        }

        // Draw bearing lines (every 30°) (unchanged)
        for (let a = 0; a < 360; a += 30) {
            const rad = (a * Math.PI) / 180;
            const x = centerX + radius * Math.cos(rad);
            const y = centerY + radius * Math.sin(rad);
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(x, y);
            ctx.stroke();
        }

        // Draw fine ticks (every 1°) (unchanged)
        ctx.strokeStyle = "rgba(0,255,0,0.15)";
        for (let a = 0; a < 360; a += 1) {
            const rad = (a * Math.PI) / 180;
            const inner = radius - 8;
            const outer = radius;
            const x1 = centerX + inner * Math.cos(rad);
            const y1 = centerY + inner * Math.sin(rad);
            const x2 = centerX + outer * Math.cos(rad);
            const y2 = centerY + outer * Math.sin(rad);
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }

        // Draw bearing labels (unchanged)
        ctx.fillStyle = "rgba(0,255,0,0.6)";
        ctx.font = `${Math.max(11, Math.floor(width / 40))}px monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        for (let a = 0; a < 360; a += 30) {
            const rad = (a * Math.PI) / 180;
            const x = centerX + (radius + 16) * Math.cos(rad);
            const y = centerY + (radius + 16) * Math.sin(rad);
            ctx.fillText(a.toString().padStart(3, "0") + "°", x, y);
        }
        ctx.restore();
    }

    // Aircraft data
    const sections = [
        { 
            id: 'home', 
            name: 'Home', 
            url: 'index.html',
            src: 'assets/images/airplane_1.svg',
            bearing: 340, // degrees
            range: 0.35, // 0 = center, 1 = edge
            size: 1.2,
            subsections: []
        },
        { 
            id: 'projects', 
            name: 'Projects', 
            url: 'projects/index.html',
            src: 'assets/images/airplane_2.svg',
            bearing: 60,
            range: 0.55,
            size: 1,
            subsections: [
                { id: 'project1', name: 'Model Building', url: 'projects/model-building.html', src: 'assets/images/airplane_2.svg', bearing: 55, range: 0.65, size: 0.7 },
                { id: 'project2', name: 'Flight Simulator Setup', url: 'projects/flight-sim.html', src: 'assets/images/airplane_2.svg', bearing: 65, range: 0.65, size: 0.7 }
            ]
        },
        { 
            id: 'essays', 
            name: 'Essays', 
            url: 'essays/index.html',
            src: 'assets/images/airplane_3.svg',
            bearing: 120,
            range: 0.75,
            size: 1,
            subsections: [
                { id: 'essay1', name: 'Sustainable Aviation', url: 'essays/sustainable-aviation.html', src: 'assets/images/airplane_3.svg', bearing: 125, range: 0.85, size: 0.7 },
                { id: 'essay2', name: 'Future of Air Travel', url: 'essays/future-air-travel.html', src: 'assets/images/airplane_3.svg', bearing: 115, range: 0.85, size: 0.7 }
            ]
        },
        { 
            id: 'readings', 
            name: 'Readings', 
            url: 'readings/index.html',
            src: 'assets/images/airplane_4.svg',
            bearing: 210,
            range: 0.80,
            size: 1,
            subsections: [
                { id: 'reading1', name: 'Book Reviews', url: 'readings/book-reviews.html', src: 'assets/images/airplane_4.svg', bearing: 205, range: 0.90, size: 0.7 },
                { id: 'reading2', name: 'Aviation History', url: 'readings/aviation-history.html', src: 'assets/images/airplane_4.svg', bearing: 215, range: 0.90, size: 0.7 }
            ]
        },
        { 
            id: 'notes', 
            name: 'Notes', 
            url: 'notes/index.html',
            src: 'assets/images/airplane_2.svg',
            bearing: 300,
            range: 0.60,
            size: 1,
            subsections: [
                { id: 'note1', name: 'Boeing Notes', url: 'notes/newest-boeing.html', src: 'assets/images/airplane_2.svg', bearing: 295, range: 0.70, size: 0.7 },
                { id: 'note2', name: 'Airbus Notes', url: 'notes/airbus-tech.html', src: 'assets/images/airplane_2.svg', bearing: 305, range: 0.70, size: 0.7 }
            ]
        },
        { 
            id: 'about', 
            name: 'About', 
            url: 'about/index.html',
            src: 'assets/images/airplane_1.svg',
            bearing: 170,
            range: 0.55,
            size: 1,
            subsections: [
                { id: 'about1', name: 'Bio', url: 'about/bio.html', src: 'assets/images/airplane_1.svg', bearing: 175, range: 0.65, size: 0.7 },
                { id: 'about2', name: 'Contact', url: 'about/contact.html', src: 'assets/images/airplane_1.svg', bearing: 165, range: 0.65, size: 0.7 }
            ]
        }
    ];

    // Aircraft DOM creation
    function createAircraft() {
        document.querySelectorAll('.aircraft').forEach(el => el.remove());
        sections.forEach(section => {
            createSingleAircraft(section);
            section.subsections.forEach(subsection => {
                createSingleAircraft(subsection, true);
            });
        });
    }

    function createSingleAircraft(item, isSub) {
        const aircraft = document.createElement('img');
        aircraft.src = item.src;
        aircraft.classList.add('aircraft');
        aircraft.id = item.id;
        aircraft.dataset.name = item.name;
        aircraft.dataset.url = item.url;
        if (isSub) aircraft.classList.add('sub-aircraft');
        aircraft.addEventListener('mouseover', showTooltip);
        aircraft.addEventListener('mouseout', hideTooltip);
        aircraft.addEventListener('click', navigateTo);
        radar.appendChild(aircraft);
    }

    function positionAircraft() {
        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = width / 2 - 20;

        sections.forEach(section => {
            const aircraft = document.getElementById(section.id);
            if (aircraft) {
                setAircraftPosition(aircraft, section, centerX, centerY, radius);
            }
            section.subsections.forEach(subsection => {
                const subAircraft = document.getElementById(subsection.id);
                if (subAircraft) {
                    setAircraftPosition(subAircraft, subsection, centerX, centerY, radius);
                }
            });
        });
    }

    function setAircraftPosition(aircraft, item, centerX, centerY, radius) {
        // Calculate current angle with global rotation
        const currentAngle = (item.bearing + globalRotation) * (Math.PI / 180);
        const orbitRadius = item.range * radius;
        
        // Calculate position
        const x = centerX + orbitRadius * Math.cos(currentAngle);
        const y = centerY + orbitRadius * Math.sin(currentAngle);
        
        // Calculate rotation (add 90deg to face tangent direction)
        const rotationDeg = (currentAngle * (180/Math.PI)) + 90;
        
        // Apply transformations
        aircraft.style.left = `${x}px`;
        aircraft.style.top = `${y}px`;
        aircraft.style.transform = `translate(-50%, -50%) rotate(${rotationDeg}deg)`;
    }

    // Animation loop
    function animate() {
        globalRotation = (globalRotation + rotationSpeed) % 360;
        positionAircraft();
        animationFrameId = requestAnimationFrame(animate);
    }

    function showTooltip(e) {
        const aircraft = e.target;
        tooltip.textContent = aircraft.dataset.name;
        tooltip.style.opacity = '1';
        const rect = aircraft.getBoundingClientRect();
        const radarRect = radar.getBoundingClientRect();
        tooltip.style.left = `${rect.left - radarRect.left + rect.width + 10}px`;
        tooltip.style.top = `${rect.top - radarRect.top}px`;
    }

    function hideTooltip() {
        tooltip.style.opacity = '0';
    }

    function navigateTo(e) {
        const url = e.target.dataset.url;
        window.location.href = url;
    }

    // Initialization
    resizeCanvas();
    createAircraft();
    animate();

    // Cleanup on window resize
    window.addEventListener('resize', () => {
        cancelAnimationFrame(animationFrameId);
        resizeCanvas();
        animate();
    });
});
