document.addEventListener('DOMContentLoaded', () => {
    const radar = document.getElementById('radar');
    const tooltip = document.getElementById('tooltip');
    const canvas = document.getElementById("radar-canvas");
    const ctx = canvas.getContext("2d");

    // Animation control
    let animationFrameId = null;
    let globalRotation = 0;
    let sweepAngle = 0;
    const rotationSpeed = 0.02; // degrees per frame for aircraft
    const SWEEP_SPEED = 2.5; // degrees per frame for sweep
    const SWEEP_WIDTH = 45; // degrees width of the sweep sector

    // Responsive canvas setup
    function resizeCanvas() {
        const size = Math.min(radar.offsetWidth, radar.offsetHeight);
        canvas.width = size;
        canvas.height = size;
        drawRadar();
        positionAircraft();
    }

    function drawRadar() {
        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = width / 2 - 25;

        ctx.clearRect(0, 0, width, height);

        // Draw grid (optional, comment out if not wanted)
        ctx.save();
        ctx.strokeStyle = "rgba(0,255,0,0.2)";
        ctx.lineWidth = 1;
        const gridStep = width / 12;
        for (let x = gridStep; x < width; x += gridStep) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = gridStep; y < height; y += gridStep) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        ctx.restore();

        // Draw radar circles
        ctx.save();
        ctx.strokeStyle = "rgba(0,255,0,0.3)";
        ctx.lineWidth = 1;
        for (let r = radius / 4; r <= radius; r += radius / 4) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, r, 0, 2 * Math.PI);
            ctx.stroke();
        }

        // Draw bearing lines (every 30°)
        for (let a = 0; a < 360; a += 30) {
            const rad = (a * Math.PI) / 180;
            const x = centerX + radius * Math.cos(rad);
            const y = centerY + radius * Math.sin(rad);
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(x, y);
            ctx.stroke();
        }

        // Draw fine ticks (every 1°)
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
        ctx.restore();

        // Draw radar sweep sector
        ctx.save();
        const sweepStart = (sweepAngle - SWEEP_WIDTH / 2) * Math.PI / 180;
        const sweepEnd = (sweepAngle + SWEEP_WIDTH / 2) * Math.PI / 180;
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, "rgba(0,255,0,0.15)");
        gradient.addColorStop(1, "rgba(0,255,0,0)");
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, sweepStart, sweepEnd, false);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.8;
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.restore();

        // Draw radar outer circle (bold)
        ctx.save();
        ctx.strokeStyle = "rgba(0,255,0,1)";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 2, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.restore();

        // Draw bearing labels
        ctx.save();
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
            id: 'home', name: 'Home', url: 'index.html',
            src: 'assets/images/airplane_1.svg',
            bearing: 340, range: 0.1, size: 1.2, subsections: []
        },
        { 
            id: 'projects', name: 'Projects', url: 'projects/index.html',
            src: 'assets/images/airplane_2.svg',
            bearing: 60, range: 0.55, size: 1,
            subsections: [
                { id: 'project1', name: 'Model Building', url: 'projects/model-building.html', src: 'assets/images/airplane_2.svg', bearing: 55, range: 0.65, size: 0.7 },
                { id: 'project2', name: 'Flight Simulator Setup', url: 'projects/flight-sim.html', src: 'assets/images/airplane_2.svg', bearing: 65, range: 0.65, size: 0.7 }
            ]
        },
        { 
            id: 'essays', name: 'Essays', url: 'essays/index.html',
            src: 'assets/images/airplane_3.svg',
            bearing: 120, range: 0.75, size: 1,
            subsections: [
                { id: 'essay1', name: 'Sustainable Aviation', url: 'essays/sustainable-aviation.html', src: 'assets/images/airplane_3.svg', bearing: 125, range: 0.85, size: 0.7 },
                { id: 'essay2', name: 'Future of Air Travel', url: 'essays/future-air-travel.html', src: 'assets/images/airplane_3.svg', bearing: 115, range: 0.85, size: 0.7 }
            ]
        },
        { 
            id: 'readings', name: 'Readings', url: 'readings/index.html',
            src: 'assets/images/airplane_4.svg',
            bearing: 210, range: 0.80, size: 1,
            subsections: [
                { id: 'reading1', name: 'Book Reviews', url: 'readings/book-reviews.html', src: 'assets/images/airplane_4.svg', bearing: 205, range: 0.90, size: 0.7 },
                { id: 'reading2', name: 'Aviation History', url: 'readings/aviation-history.html', src: 'assets/images/airplane_4.svg', bearing: 215, range: 0.90, size: 0.7 }
            ]
        },
        { 
            id: 'notes', name: 'Notes', url: 'notes/index.html',
            src: 'assets/images/airplane_2.svg',
            bearing: 300, range: 0.60, size: 1,
            subsections: [
                { id: 'note1', name: 'Boeing Notes', url: 'notes/newest-boeing.html', src: 'assets/images/airplane_2.svg', bearing: 295, range: 0.70, size: 0.7 },
                { id: 'note2', name: 'Airbus Notes', url: 'notes/airbus-tech.html', src: 'assets/images/airplane_2.svg', bearing: 305, range: 0.70, size: 0.7 }
            ]
        },
        { 
            id: 'about', name: 'About', url: 'about/index.html',
            src: 'assets/images/airplane_1.svg',
            bearing: 170, range: 0.55, size: 1,
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
                createSingleAircraft(subsection);
            });
        });
    }

    function createSingleAircraft(item) {
        const aircraft = document.createElement('img');
        aircraft.src = item.src;
        aircraft.classList.add('aircraft');
        if(item.size < 1) aircraft.classList.add('sub-aircraft');
        aircraft.id = item.id;
        aircraft.dataset.name = item.name;
        aircraft.dataset.url = item.url;
        aircraft.addEventListener('click', navigateTo);

        // Tooltip handlers
        aircraft.addEventListener('mouseover', showTooltip);
        aircraft.addEventListener('mousemove', showTooltip);
        aircraft.addEventListener('mouseout', hideTooltip);

        radar.appendChild(aircraft);
    }

    function positionAircraft() {
        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = width / 2 - 20;

        sections.forEach(section => {
            updateAircraftPosition(section, centerX, centerY, radius);
            section.subsections.forEach(subsection => {
                updateAircraftPosition(subsection, centerX, centerY, radius);
            });
        });
    }

    function updateAircraftPosition(item, centerX, centerY, radius) {
        const aircraft = document.getElementById(item.id);
        if (!aircraft) return;

        // Calculate orbital position
        const currentAngle = (item.bearing + globalRotation) * (Math.PI / 180);
        const orbitRadius = item.range * radius;
        const x = centerX + orbitRadius * Math.cos(currentAngle);
        const y = centerY + orbitRadius * Math.sin(currentAngle);

        // Set position and rotation
        aircraft.style.left = `${x}px`;
        aircraft.style.top = `${y}px`;
        aircraft.style.transform = `translate(-50%, -50%) rotate(${currentAngle + Math.PI/2}rad)`;
    }

    function animate() {
        globalRotation = (globalRotation + rotationSpeed) % 360;
        sweepAngle = (sweepAngle + SWEEP_SPEED) % 360;
        drawRadar();
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

