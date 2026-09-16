/***
 * MOMENTOS.JS — versão estática
 * Funciona sem servidor: momentos ficam salvos no localStorage do navegador.
 */

const chaveArmazenamento = 'portfolio_momentos';

const formMomento = document.getElementById('form-momento');
const campoTitulo = document.getElementById('momento-titulo');
const campoArquivo = document.getElementById('momento-arquivo');
const msgMomento = document.getElementById('momento-msg');
const btnLimpar = document.getElementById('momento-limpar');

const pista = document.getElementById('carrossel-pista');
const vazio = document.getElementById('carrossel-vazio');
const btnAnterior = document.getElementById('carrossel-anterior');
const btnProximo = document.getElementById('carrossel-proximo');

let momentos = [];
let indiceAtual = 0;

function gerarId() {
    return Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 8);
}

function salvarMomentos() {
    return StorageHelper.salvar(chaveArmazenamento, momentos);
}

function mostrarMsg(tipo, texto) {
    msgMomento.className = 'momento-msg ' + tipo;
    msgMomento.textContent = texto;
}

function carregarMomentos() {
    momentos = StorageHelper.obter(chaveArmazenamento, []);
    indiceAtual = 0;
    renderizarCarrossel();
}

function renderizarCarrossel() {
    pista.innerHTML = '';

    if (momentos.length === 0) {
        vazio.style.display = 'block';
        return;
    }

    vazio.style.display = 'none';

    momentos.forEach((momento, i) => {
        const slide = document.createElement('div');
        slide.className = 'momento-slide';

        const img = document.createElement('img');
        img.src = momento.imagem;
        img.alt = momento.titulo;

        const legenda = document.createElement('div');
        legenda.className = 'slide-legenda';
        legenda.textContent = momento.titulo;

        const acoes = document.createElement('div');
        acoes.className = 'slide-acoes';

        const contador = document.createElement('span');
        contador.className = 'slide-contador';
        contador.textContent = (indiceAtual + 1) + ' / ' + momentos.length;

        const btnDel = document.createElement('button');
        btnDel.className = 'btn-deletar';
        btnDel.textContent = 'Remover';
        btnDel.addEventListener('click', () => deletarMomento(momento.id));

        acoes.appendChild(contador);
        acoes.appendChild(btnDel);

        slide.appendChild(img);
        slide.appendChild(legenda);
        slide.appendChild(acoes);

        pista.appendChild(slide);
    });

    atualizarContadorGlobal();
    irPara(indiceAtual);
}

function atualizarContadorGlobal() {
    const contadores = pista.querySelectorAll('.slide-contador');
    contadores.forEach((c, i) => {
        c.textContent = (i + 1) + ' / ' + momentos.length;
    });
}

function irPara(index) {
    if (momentos.length === 0) return;
    indiceAtual = ((index % momentos.length) + momentos.length) % momentos.length;
    pista.style.transform = 'translateX(-' + (indiceAtual * 100) + '%)';
}

function proximo() { irPara(indiceAtual + 1); }
function anterior() { irPara(indiceAtual - 1); }

async function handleSubmit(e) {
    e.preventDefault();

    const titulo = campoTitulo.value.trim();
    const arquivo = campoArquivo.files[0];

    if (!titulo || !arquivo) {
        mostrarMsg('erro', 'Preencha o título e selecione uma imagem.');
        return;
    }

    if (!arquivo.type.startsWith('image/')) {
        mostrarMsg('erro', 'O arquivo deve ser uma imagem.');
        return;
    }

    mostrarMsg('sucesso', 'Processando imagem, aguarde...');

    let imagem;
    try {
        imagem = await StorageHelper.comprimirImagem(arquivo, 1200, 0.82);
    } catch (err) {
        mostrarMsg('erro', err.message || 'Não foi possível processar a imagem.');
        return;
    }

    const momento = {
        id: gerarId(),
        titulo: titulo,
        imagem: imagem,
        data: new Date().toISOString()
    };

    momentos.push(momento);
    if (!salvarMomentos()) {
        momentos.pop();
        mostrarMsg('erro', 'Espaço de armazenamento do navegador esgotado. Remova momentos antigos ou use imagens menores.');
        return;
    }

    campoTitulo.value = '';
    campoArquivo.value = '';
    renderizarCarrossel();
    irPara(momentos.length - 1);
    mostrarMsg('sucesso', 'Momento salvo com sucesso!');
}

function deletarMomento(id) {
    momentos = momentos.filter(m => m.id !== id);
    salvarMomentos();
    renderizarCarrossel();
}

function limparFormulario() {
    campoTitulo.value = '';
    campoArquivo.value = '';
    msgMomento.className = 'momento-msg';
    msgMomento.textContent = '';
}

if (formMomento) formMomento.addEventListener('submit', handleSubmit);
if (btnLimpar) btnLimpar.addEventListener('click', limparFormulario);
if (btnAnterior) btnAnterior.addEventListener('click', anterior);
if (btnProximo) btnProximo.addEventListener('click', proximo);

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') anterior();
    if (e.key === 'ArrowRight') proximo();
});

carregarMomentos();