/**
 * DISCIPLINAS.JS — versão nuvem (Supabase)
 * As atividades ficam salvas em um banco de dados na nuvem,
 * disponíveis em qualquer dispositivo e no GitHub Pages.
 */

let listaCards = Array.from(document.querySelectorAll('.atividade-card'));
let atividadesSalvas = [];

const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-img');
const modalLegenda = document.getElementById('modal-legenda');
const btnFechar = document.getElementById('modal-fechar');
const btnAnterior = document.getElementById('modal-anterior');
const btnProximo = document.getElementById('modal-proximo');
const btnRotacionar = document.getElementById('modal-rotacionar');

let indiceAtual = 0;
let eixosPorCard = [];
let rotacaoAtual = 0;

const nomeDisciplina = (document.querySelector('.disciplina-header h1') || {}).textContent || '';

function mapearEixos() {
    eixosPorCard = [];
    const secoes = document.querySelectorAll('.eixo-section');
    secoes.forEach((secao) => {
        const eixoTitulo = secao.querySelector('.eixo-titulo h2').textContent;
        const cardsDoEixo = secao.querySelectorAll('.atividade-card');
        cardsDoEixo.forEach(() => eixosPorCard.push(eixoTitulo));
    });
}

function reindexarCards() {
    listaCards = Array.from(document.querySelectorAll('.atividade-card'));
    mapearEixos();
    listaCards.forEach((card, index) => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => abrirModal(index));
    });
}

function abrirModal(index) {
    indiceAtual = index;
    atualizarModal();
    modal.classList.add('ativo');
    document.body.style.overflow = 'hidden';
}

function fecharModal() {
    modal.classList.remove('ativo');
    document.body.style.overflow = '';
    resetarRotacao();
}

function girarImagem() {
    rotacaoAtual -= 90;
    modalImg.style.transform = 'rotate(' + rotacaoAtual + 'deg)';
}

function resetarRotacao() {
    rotacaoAtual = 0;
    if (modalImg) modalImg.style.transform = '';
}

function atualizarModal() {
    const card = listaCards[indiceAtual];
    const img = card.querySelector('img');
    const caption = card.querySelector('figcaption').textContent;
    modalImg.src = img.src;
    modalImg.alt = img.alt;
    modalLegenda.textContent = caption;
}

function mostrarToqueEixo(eixo) {
    const toc = document.getElementById('toast-eixo');
    const texto = document.getElementById('toast-eixo-texto');
    texto.textContent = eixo;
    toc.classList.add('visivel');

    clearTimeout(mostrarToqueEixo._timer);
    mostrarToqueEixo._timer = setTimeout(() => {
        toc.classList.remove('visivel');
    }, 2200);
}

function navegar(direcao) {
    const eixoAtual = eixosPorCard[indiceAtual];
    indiceAtual = (indiceAtual + direcao + listaCards.length) % listaCards.length;
    const novoEixo = eixosPorCard[indiceAtual];

    if (eixoAtual !== novoEixo) {
        mostrarToqueEixo(novoEixo);
    }

    resetarRotacao();
    atualizarModal();
}

/* FORMULÁRIO DE ANEXO */
const formAnexo = document.getElementById('form-anexo');
const campoNome = document.getElementById('anexo-nome');
const campoEixo = document.getElementById('anexo-eixo');
const campoArquivo = document.getElementById('anexo-arquivo');
const msgAnexo = document.getElementById('anexo-msg');
const btnLimpar = document.getElementById('anexo-limpar');

function eixosDaPagina() {
    return Array.from(document.querySelectorAll('.eixo-section .eixo-titulo h2'))
        .map((h) => (h.textContent || '').trim())
        .filter(Boolean);
}

function eixoExiste(eixo) {
    return eixosDaPagina().includes(eixo);
}

function preencherOpcoesEixo() {
    if (!campoEixo) return;
    const eixos = eixosDaPagina();
    const atual = campoEixo.value;
    campoEixo.innerHTML = '';

    const opcaoPadrao = document.createElement('option');
    opcaoPadrao.value = '';
    opcaoPadrao.textContent = 'Selecione o eixo';
    campoEixo.appendChild(opcaoPadrao);

    eixos.forEach((eixo) => {
        const opcao = document.createElement('option');
        opcao.value = eixo;
        opcao.textContent = eixo;
        campoEixo.appendChild(opcao);
    });

    if (atual && eixos.includes(atual)) {
        campoEixo.value = atual;
    }
}

function obterNumeroEixo(nomeEixo) {
    const match = (nomeEixo || '').match(/\d+/);
    return match ? parseInt(match[0], 10) : 1;
}

function encontrarSecaoEixo(numero) {
    const secoes = document.querySelectorAll('.eixo-section');
    for (const secao of secoes) {
        const eixoNumero = obterNumeroEixo(secao.querySelector('.eixo-titulo h2').textContent);
        if (eixoNumero === numero) return secao;
    }
    return null;
}

function mostrarMsg(tipo, texto) {
    msgAnexo.className = 'anexo-msg ' + tipo;
    msgAnexo.textContent = texto;
}

function adicionarCard(nome, imagemSrc, eixo, id) {
    const nomeEixo = (eixo || (campoEixo ? campoEixo.value : '') || '').trim();
    const numeroEixo = obterNumeroEixo(nomeEixo);
    const secaoAlvo = encontrarSecaoEixo(numeroEixo);
    if (!secaoAlvo) return false;

    const figura = document.createElement('figure');
    figura.className = 'atividade-card';

    const img = document.createElement('img');
    img.src = imagemSrc;
    img.alt = nome;

    const legenda = document.createElement('figcaption');
    legenda.textContent = nome;

    figura.appendChild(img);
    figura.appendChild(legenda);

    if (id) {
        figura.appendChild(criarBotaoRemover(id));
    }

    secaoAlvo.querySelector('.atividades-grid').appendChild(figura);
    reindexarCards();
    return true;
}

function criarBotaoRemover(id) {
    const botao = document.createElement('button');
    botao.className = 'btn-remover-atividade';
    botao.type = 'button';
    botao.textContent = 'Remover';
    botao.title = 'Remover esta atividade';
    botao.addEventListener('click', (evento) => {
        evento.stopPropagation();
        removerAtividade(id, botao.closest('figure'));
    });
    return botao;
}

function carregarAtividades() {
    if (!CLOUDE.estaConfigurado()) {
        mostrarMsg('erro', CLOUDE.erroConfiguracao());
        return;
    }

    mostrarMsg('sucesso', 'Carregando atividades da nuvem...');

    CLOUDE.listarAtividades()
        .then((todas) => {
            atividadesSalvas = todas.filter((a) => a.disciplina === nomeDisciplina);

            atividadesSalvas.forEach((atividade) => {
                const secaoAlvo = encontrarSecaoEixo(obterNumeroEixo(atividade.eixo));
                if (!secaoAlvo) return;

                const figura = document.createElement('figure');
                figura.className = 'atividade-card';

                const img = document.createElement('img');
                img.src = atividade.imagem;
                img.alt = atividade.nome;

                const legenda = document.createElement('figcaption');
                legenda.textContent = atividade.nome;

                figura.appendChild(img);
                figura.appendChild(legenda);

                if (AUTORIZACAO.podeEditar()) {
                    const botaoRemover = criarBotaoRemover(atividade.id);
                    figura.appendChild(botaoRemover);
                }

                secaoAlvo.querySelector('.atividades-grid').appendChild(figura);
            });

            reindexarCards();
            limparMsg();
        })
        .catch((err) => {
            mostrarMsg('erro', 'Erro ao carregar as atividades: ' + (err.message || err));
        });
}

async function handleAnexo(e) {
    if (e) e.preventDefault();

    if (!AUTORIZACAO.podeEditar()) {
        mostrarMsg('erro', 'Professores não podem adicionar atividades.');
        return;
    }

    if (!CLOUDE.estaConfigurado()) {
        mostrarMsg('erro', CLOUDE.erroConfiguracao());
        return;
    }

    const nome = campoNome.value.trim();
    const eixo = campoEixo.value;
    const arquivo = campoArquivo.files[0];

    if (!nome || !eixo || !arquivo) {
        mostrarMsg('erro', 'Preencha todos os campos (nome, eixo e arquivo).');
        return;
    }

    if (!eixoExiste(eixo)) {
        mostrarMsg('erro', 'O eixo escolhido não existe nesta página.');
        preencherOpcoesEixo();
        return;
    }

    const ehImagem = arquivo.type.startsWith('image/');
    if (!ehImagem) {
        mostrarMsg('erro', 'O arquivo deve ser uma imagem (PNG, JPG, etc).');
        return;
    }

    mostrarMsg('sucesso', 'Processando imagem, aguarde...');

    let imagemSrc;
    try {
        imagemSrc = await StorageHelper.comprimirImagem(arquivo, 1200, 0.82);
    } catch (err) {
        mostrarMsg('erro', err.message || 'Não foi possível processar a imagem.');
        return;
    }

    mostrarMsg('sucesso', 'Enviando para a nuvem, aguarde...');

    try {
        const blob = StorageHelper.dataURLParaBlob(imagemSrc);
        const urlImagem = await CLOUDE.enviarImagem(blob, 'atividades');

        const atividadeSalva = await CLOUDE.salvarAtividade({
            nome: nome,
            eixo: eixo,
            disciplina: nomeDisciplina,
            imagem: urlImagem
        });

        atividadesSalvas.push(atividadeSalva);

        const adicionado = adicionarCard(atividadeSalva.nome, atividadeSalva.imagem, atividadeSalva.eixo, atividadeSalva.id);
        if (!adicionado) {
            mostrarMsg('erro', 'Eixo não encontrado nesta página.');
            return;
        }

        campoNome.value = '';
        campoEixo.value = '';
        campoArquivo.value = '';
        limparMsg();
        mostrarMsg('sucesso', 'Atividade salva na nuvem. Já aparece em qualquer dispositivo!');
    } catch (err) {
        mostrarMsg('erro', 'Erro ao salvar na nuvem: ' + (err.message || err));
    }
}

function removerAtividade(id, figura) {
    if (!AUTORIZACAO.podeEditar()) return;
    if (!CLOUDE.estaConfigurado()) return;

    const atividade = atividadesSalvas.find((a) => a.id === id);
    const caminho = atividade ? CLOUDE.caminhoDoArquivo(atividade.imagem) : null;

    mostrarMsg('sucesso', 'Removendo atividade...');

    CLOUDE.removerAtividade(id, caminho)
        .then(() => {
            atividadesSalvas = atividadesSalvas.filter((a) => a.id !== id);
            if (figura) figura.remove();
            reindexarCards();
            limparMsg();
            mostrarMsg('sucesso', 'Atividade removida da nuvem.');
        })
        .catch((err) => {
            mostrarMsg('erro', 'Erro ao remover: ' + (err.message || err));
        });
}

function limparFormulario() {
    campoNome.value = '';
    campoEixo.value = '';
    campoArquivo.value = '';
    limparMsg();
}

function limparMsg() {
    if (msgAnexo) {
        msgAnexo.className = 'anexo-msg';
        msgAnexo.textContent = '';
    }
}

if (formAnexo) {
    formAnexo.addEventListener('submit', handleAnexo);
    preencherOpcoesEixo();

    if (!AUTORIZACAO.podeEditar()) {
        formAnexo.style.display = 'none';
    }
}

if (btnLimpar) {
    btnLimpar.addEventListener('click', limparFormulario);
}

reindexarCards();
carregarAtividades();

if (btnFechar) {
    btnFechar.addEventListener('click', fecharModal);
}

if (btnAnterior) {
    btnAnterior.addEventListener('click', (e) => {
        e.stopPropagation();
        navegar(-1);
    });
}

if (btnProximo) {
    btnProximo.addEventListener('click', (e) => {
        e.stopPropagation();
        navegar(1);
    });
}

if (btnRotacionar) {
    btnRotacionar.addEventListener('click', (e) => {
        e.stopPropagation();
        girarImagem();
    });
}

if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) fecharModal();
    });
}

document.addEventListener('keydown', (e) => {
    if (!modal || !modal.classList.contains('ativo')) return;
    if (e.key === 'Escape') fecharModal();
    if (e.key === 'ArrowLeft') navegar(-1);
    if (e.key === 'ArrowRight') navegar(1);
});