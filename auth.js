/* =============================================
   AUTORIZACAO — sessão de login no navegador
   Controla permissões de edição do portfólio.
   ============================================= */

const AUTORIZACAO = (function () {
    const CHAVE = 'portfolio_sessao';

    function obter() {
        try {
            return JSON.parse(localStorage.getItem(CHAVE)) || null;
        } catch (e) {
            return null;
        }
    }

    function salvar(usuario, papel) {
        localStorage.setItem(CHAVE, JSON.stringify({ usuario: usuario, papel: papel }));
    }

    function encerrar() {
        localStorage.removeItem(CHAVE);
    }

    function papelAtual() {
        const sessao = obter();
        return sessao && sessao.papel ? sessao.papel : null;
    }

    function ehProfessor() {
        return papelAtual() === 'professor';
    }

    /* Visitantes sem login e o administrador podem editar. Professor não. */
    function podeEditar() {
        return !ehProfessor();
    }

    /* Aviso fixo no canto da tela com quem está logado + botão sair */
    function exibirStatus() {
        const sessao = obter();
        if (!sessao) return;

        const caixa = document.createElement('div');
        caixa.style.cssText = 'position:fixed;bottom:12px;right:12px;z-index:9999;background:#16213e;color:#fff;padding:8px 14px;border-radius:20px;font-size:13px;font-family:Arial,Helvetica,sans-serif;box-shadow:0 2px 10px rgba(0,0,0,.35);display:flex;align-items:center;gap:10px;';

        const texto = document.createElement('span');
        texto.textContent = sessao.papel === 'professor'
            ? 'Modo Professor (somente leitura)'
            : 'Logado como ' + sessao.usuario;

        const btn = document.createElement('button');
        btn.textContent = 'Sair';
        btn.style.cssText = 'border:none;background:#e63946;color:#fff;border-radius:12px;padding:4px 12px;cursor:pointer;font-size:12px;';

        btn.onclick = function () {
            encerrar();
            window.location.href = 'index.html';
        };

        caixa.appendChild(texto);
        caixa.appendChild(btn);
        document.body.appendChild(caixa);
    }

    if (document.body) {
        exibirStatus();
    } else {
        document.addEventListener('DOMContentLoaded', exibirStatus);
    }

    return { obter, salvar, encerrar, papelAtual, ehProfessor, podeEditar, exibirStatus };
})();