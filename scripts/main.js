document.addEventListener('DOMContentLoaded', function () {
    const navButtons = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('.page');
    const startBtn = document.getElementById('start-btn');

    function changePage(pageId) {
        pages.forEach(page => {
            page.classList.remove('active');
        });

        navButtons.forEach(btn => {
            btn.classList.remove('active');
        });

        document.getElementById(pageId).classList.add('active');
        document.querySelector(`.nav-btn[data-page="${pageId}"]`).classList.add('active');
    }

    navButtons.forEach(button => {
        button.addEventListener('click', function () {
            const pageId = this.getAttribute('data-page');
            changePage(pageId);
        });
    });

    if (startBtn) {
        startBtn.addEventListener('click', function () {
            changePage('about');
            this.classList.add('is-disabled');
            this.textContent = 'AVVENTURA INIZIATA!';
            console.log('> Avventura iniziata! Esplora il portfolio.');
        });
    }

    const specialButtons = document.querySelectorAll('.special-btn');
    specialButtons.forEach(btn => {
        btn.addEventListener('mouseenter', function () {
            this.style.transform = 'scale(1.05)';
        });

        btn.addEventListener('mouseleave', function () {
            this.style.transform = 'scale(1)';
        });
    });
});
