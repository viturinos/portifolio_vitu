/***
 * SCREPIT.JS — versão estática
 * Login validado no próprio navegador (sem servidor).
 * Salva a sessão (usuário e papel) para controlar permissões.
 */

const USUARIOS = [
    { nome: 'Victor', senha: '12512641', papel: 'admin' },
    { nome: 'Professores', senha: '12345@', papel: 'professor' }
];

async function logar() {
    const loginInput = document.getElementById("login").value.trim();
    const senhaInput = document.getElementById("senha").value;
    const msgErro = document.getElementById("mensagem");

    const usuario = USUARIOS.find(u => u.nome === loginInput && u.senha === senhaInput);

    if (!usuario) {
        msgErro.style.display = "block";
        msgErro.innerHTML = '<span class="texto-erro">Usuário ou senha inválidos!</span><br><span class="texto-ajuda">Verifique seus dados e tente novamente.</span>';
        return;
    }

    AUTORIZACAO.salvar(usuario.nome, usuario.papel);

    msgErro.style.display = "none";

    const curtain = document.getElementById("curtain");
    curtain.classList.add("active");

    setTimeout(() => {
        window.location.href = "home1.html";
    }, 1500);
}

function cancelar() {
    document.getElementById("login").value = "";
    document.getElementById("senha").value = "";
    document.getElementById("mensagem").style.display = "none";
}

/* Permite deslogar e voltar ao login */
function sair() {
    AUTORIZACAO.encerrar();
    window.location.href = "index.html";
}