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

    return { obter, salvar, encerrar, papelAtual, ehProfessor, podeEditar };
})();