document.addEventListener('DOMContentLoaded', () => {
    const essays = document.querySelectorAll('.essay-title');
    
    essays.forEach(essay => {
        essay.addEventListener('click', () => {
            const isExpanded = essay.getAttribute('aria-expanded') === 'true';
            const content = essay.nextElementSibling;
            
            // Toggle aria attribute
            essay.setAttribute('aria-expanded', !isExpanded);
            
            // Toggle content visibility
            content.hidden = isExpanded;
            
            // Animate border radius when expanded
            if (!isExpanded) {
                content.style.borderRadius = '0 6px 6px 6px';
            } else {
                content.style.borderRadius = '0 6px 6px 0';
            }
        });
    });
});
