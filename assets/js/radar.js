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
    const sweepSpeed = 0.5; // degrees per frame for sweep

    // Sweep region configuration
    const n = 8; // Change this for sweep width: n=90 => 4deg, n=45 => 8deg, n=30 => 12deg, etc.
    const SWEEP_WIDTH = 360 / n;

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

        // Draw sweep region (red, fading)
        ctx.save();
        const startAngle = (sweepAngle - SWEEP_WIDTH / 2) * Math.PI / 180;
        const endAngle = (sweepAngle + SWEEP_WIDTH / 2) * Math.PI / 180;
        const steps = 30; // Number of slices for smooth fade

        for (let i = 0; i < steps; i++) {
            const t = i / steps;
            const angle1 = startAngle + t * (endAngle - startAngle);
            const angle2 = startAngle + (t + 1/steps) * (endAngle - startAngle);
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, angle1, angle2, false);
            ctx.closePath();
            // Opacity: 1 at sweep center, fades to 0 at the edge
            const alpha = 0.5 * (0.8 - t);
            ctx.fillStyle = `rgba(255,0,0,${alpha})`;
            ctx.fill();
        }
        ctx.restore();

        // Draw bearing labels
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
    }

    // Aircraft data
    const sections = [
        { 
            id: 'home', name: 'Home', url: 'index.html',
            src: 'assets/images/airplane_1.svg',
            bearing: 340, range: 0.33, size: 1.2, subsections: []
        },
        { 
            id: 'projects', name: 'Projects', url: 'projects/index.html',
            src: 'assets/images/airplane_2.svg',
            bearing: 60, range: 0.55, size: 1,
            subsections: [
            ]
        },
        { 
            id: 'essays', name: 'Essays', url: 'essays/index.html',
            src: 'assets/images/airplane_3.svg',
            bearing: 120, range: 0.65, size: 1,
            subsections: []
        },
        { 
            id: 'readings', name: 'Readings', url: 'readings/index.html',
            src: 'assets/images/airplane_4.svg',
            bearing: 210, range: 0.75, size: 1,
            subsections: []
        },
        { 
            id: 'notes', name: 'Notes', url: 'notes/index.html',
            src: 'assets/images/airplane_2.svg',
            bearing: 300, range: 0.60, size: 1,
            subsections: [
                { id: 'note1', name: 'Boeing MCAS', url: '/notes/note1.html', src: 'assets/images/airplane_2.svg', bearing: 295, range: 0.70, size: 0.7 }
            ]
        },
        { 
            id: 'about', name: 'About', url: 'about/index.html',
            src: 'assets/images/airplane_2.svg',
            bearing: 170, range: 0.55, size: 1,
            subsections: []
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

    // Animation loop
    function animate() {
        globalRotation = (globalRotation + rotationSpeed) % 360;
        sweepAngle = (sweepAngle + sweepSpeed) % 360;
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

