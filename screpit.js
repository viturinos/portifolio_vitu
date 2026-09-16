/***
 * SCREPIT.JS — versão estática
 * Login validado no próprio navegador (sem servidor).
 */

const USUARIOS = [
    { nome: 'Victor', senha: '12512641' },
    { nome: 'Professores', senha: '12345@' }
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