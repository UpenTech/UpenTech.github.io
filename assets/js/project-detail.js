// Only enable desktop slide-in and in-page navigation
document.addEventListener('DOMContentLoaded', () => {
    const detail = document.getElementById('project-detail-content');
    const listItems = document.querySelectorAll('.project-list-item');

    // Slide-in animation
    if (window.innerWidth >= 900) {
        setTimeout(() => detail.classList.add('slide-in'), 80);

        // In-page navigation for desktop
        listItems.forEach(item => {
            item.addEventListener('click', () => {
                if (item.classList.contains('active')) return;
                // Remove active from all
                listItems.forEach(btn => btn.classList.remove('active'));
                item.classList.add('active');
                // Load new project page in-place
                fetch(item.dataset.project)
                    .then(res => res.text())
                    .then(html => {
                        // Parse and extract the .project-detail-column content
                        const temp = document.createElement('div');
                        temp.innerHTML = html;
                        const newContent = temp.querySelector('.project-detail-column');
                        if (newContent) {
                            detail.innerHTML = newContent.innerHTML;
                            detail.scrollTop = 0;
                        }
                    });
            });
        });
    } else {
        // On mobile, clicking a project navigates directly
        listItems.forEach(item => {
            item.addEventListener('click', () => {
                window.location.href = item.dataset.project;
            });
        });
    }
});
