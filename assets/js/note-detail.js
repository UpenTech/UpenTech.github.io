document.addEventListener('DOMContentLoaded', () => {
    const detail = document.getElementById('note-detail-content');
    const listItems = document.querySelectorAll('.note-list-item');

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
                // Load new note page in-place
                fetch(item.dataset.note)
                    .then(res => res.text())
                    .then(html => {
                        // Parse and extract the .note-hero and .note-body content
                        const temp = document.createElement('div');
                        temp.innerHTML = html;
                        const newHero = temp.querySelector('.note-hero');
                        const newBody = temp.querySelector('.note-body');
                        if (newHero && newBody) {
                            detail.querySelector('.note-hero').replaceWith(newHero);
                            detail.querySelector('.note-body').replaceWith(newBody);
                            detail.scrollTop = 0;
                        }
                    });
            });
        });
    } else {
        // On mobile, clicking a note navigates directly
        listItems.forEach(item => {
            item.addEventListener('click', () => {
                window.location.href = item.dataset.note;
            });
        });
    }
});
