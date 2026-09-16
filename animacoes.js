document.addEventListener('DOMContentLoaded', function () {

    /* ===== CURSOR QUE SEGUE O MOUSE ===== */
    (function cursorEfeito() {
        const ponto = document.createElement('div');
        ponto.className = 'cursor-ponto';
        const aneis = document.createElement('div');
        aneis.className = 'cursor-aneis';

        document.body.appendChild(ponto);
        document.body.appendChild(aneis);

        let mouseX = 0, mouseY = 0;
        let aneisX = 0, aneisY = 0;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            ponto.style.left = mouseX + 'px';
            ponto.style.top = mouseY + 'px';
        });

        function animarAneis() {
            aneisX += (mouseX - aneisX) * 0.18;
            aneisY += (mouseY - aneisY) * 0.18;
            aneis.style.left = aneisX + 'px';
            aneis.style.top = aneisY + 'px';
            requestAnimationFrame(animarAneis);
        }
        animarAneis();

        const elementosInterativos = document.querySelectorAll('a, button, input, select, .atividade-card, .momento-slide img, .carrossel-setas, figure');
        elementosInterativos.forEach((el) => {
            el.addEventListener('mouseenter', () => aneis.classList.add('cursor-ativo'));
            el.addEventListener('mouseleave', () => aneis.classList.remove('cursor-ativo'));
        });
    })();

    /* ===== SCROLL REVEAL ===== */
    (function scrollReveal() {
        const alvos = document.querySelectorAll(
            '.disciplina-header, .momentos-header, .eixo-section, .atividade-card, ' +
            '.momento-form, .carrossel-section, .sobre, .forma, .hab, .cardVidro, ' +
            '.areas, header, .hero-texto, .boneco-area, section, main > div'
        );

        alvos.forEach((el) => {
            if (!el.classList.contains('scroll-reveal')) {
                el.classList.add('scroll-reveal');
            }
        });

        const observar = new IntersectionObserver((entradas) => {
            entradas.forEach((entrada) => {
                if (entrada.isIntersecting) {
                    entrada.target.classList.add('visivel');
                    observar.unobserve(entrada.target);
                }
            });
        }, { threshold: 0.1 });

        const elementos = document.querySelectorAll('.scroll-reveal');
        elementos.forEach((el) => observar.observe(el));
    })();

});
