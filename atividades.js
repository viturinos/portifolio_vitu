/**
 * ATIVIDADES ESCOLHIDAS — versão nuvem (Supabase)
 *
 * Cada matéria tem 4 espaços (um por eixo). O conteúdo escolhido é salvo
 * na mesma tabela "atividades", usando o prefixo "ESCOLHIDAS:" no campo
 * disciplina. Assim a curadoria não aparece nas páginas das disciplinas e
 * funciona com a estrutura que já existe no banco.
 */

const PREFIXO_ESCOLHIDAS = 'ESCOLHIDAS:';

const MATERIAS = [
    {
        id: 'linguagens',
        rotulo: 'Linguagens',
        original: 'LINGUAGENS',
        pagina: 'linguagens.html',
        icone: 'fa-book-open',
        cor: '#c084fc',
        descricao: 'Leitura, escrita, literatura e produção de texto.'
    },
    {
        id: 'humanas',
        rotulo: 'Ciências Humanas',
        original: 'CIÊNCIAS HUMANAS',
        pagina: 'humanas.html',
        icone: 'fa-earth-americas',
        cor: '#f472b6',
        descricao: 'História, geografia, filosofia e sociologia.'
    },
    {
        id: 'natureza',
        rotulo: 'Ciências da Natureza',
        original: 'CIÊNCIAS DA NATUREZA',
        pagina: 'natureza.html',
        icone: 'fa-flask',
        cor: '#4ade80',
        descricao: 'Biologia, física e química na prática.'
    },
    {
        id: 'matematica',
        rotulo: 'Matemática',
        original: 'MATEMÁTICA',
        pagina: 'matematica.html',
        icone: 'fa-calculator',
        cor: '#60a5fa',
        descricao: 'Raciocínio lógico, resolução de problemas e modelagem.'
    },
    {
        id: 'senai',
        rotulo: 'SENAI',
        original: 'SENAI',
        pagina: 'senai.html',
        icone: 'fa-gears',
        cor: '#fbbf24',
        descricao: 'Formação técnica, projetos e prática profissional.'
    }
];

const EIXOS = [1, 2, 3, 4];

const listaMaterias = document.getElementById('lista-materias');
const avisoNuvem = document.getElementById('aviso-nuvem');

const picker = document.getElementById('picker');
const pickerFechar = document.getElementById('picker-fechar');
const pickerMateria = document.getElementById('picker-materia');
const pickerTitulo = document.getElementById('picker-titulo');
const pickerGaleria = document.getElementById('picker-galeria');
const pickerVazio = document.getElementById('picker-vazio');
const pickerForm = document.getElementById('picker-form');
const pickerNome = document.getElementById('picker-nome');
const pickerArquivo = document.getElementById('picker-arquivo');
const pickerSalvar = document.getElementById('picker-salvar');
const pickerMsg = document.getElementById('picker-msg');

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxLegenda = document.getElementById('lightbox-legenda');
const lightboxMeta = document.getElementById('lightbox-meta');
const lightboxFechar = document.getElementById('lightbox-fechar');
const lightboxRotacionar = document.getElementById('lightbox-rotacionar');
const lightboxAnterior = document.getElementById('lightbox-anterior');
const lightboxProximo = document.getElementById('lightbox-proximo');

const toast = document.getElementById('toast');
const toastTexto = document.getElementById('toast-texto');

let todasAtividades = [];
let atividadesLocais = [];
let estado = {};
let refs = {};
let pickerAtual = null;
let salvando = false;
let enviando = false;
let lightboxLista = [];
let lightboxIndice = 0;
let rotacaoAtual = 0;
let toastTimer = null;

/* ================= UTILIDADES ================= */

function podeEditar() {
    return typeof AUTORIZACAO !== 'undefined' ? AUTORIZACAO.podeEditar() : true;
}

function normalizarNome(nome) {
    return (nome || '').trim().toUpperCase();
}

function obterNumeroEixo(nomeEixo) {
    const achado = (nomeEixo || '').match(/\d+/);
    return achado ? parseInt(achado[0], 10) : 1;
}

function chave(materiaId, eixo) {
    return materiaId + '|' + eixo;
}

function materiaPorDisciplina(nome) {
    const alvo = normalizarNome(nome);
    return MATERIAS.find((m) => normalizarNome(m.original) === alvo) || null;
}

function mostrarAviso(texto) {
    avisoNuvem.textContent = texto;
    avisoNuvem.classList.add('visivel');
}

function esconderAviso() {
    avisoNuvem.textContent = '';
    avisoNuvem.classList.remove('visivel');
}

function mostrarToast(texto, erro) {
    toastTexto.textContent = texto;
    toast.classList.toggle('erro', !!erro);
    toast.querySelector('i').className = erro
        ? 'fa-solid fa-circle-exclamation'
        : 'fa-solid fa-circle-check';

    toast.classList.add('visivel');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visivel'), 3200);
}

/* ================= CONSTRUÇÃO DAS SEÇÕES ================= */

function construirSecoes() {
    listaMaterias.innerHTML = '';

    MATERIAS.forEach((materia) => {
        const secao = document.createElement('section');
        secao.className = 'materia-section';
        secao.style.setProperty('--materia-cor', materia.cor);
        secao.dataset.materia = materia.id;

        const cabecalho = document.createElement('div');
        cabecalho.className = 'materia-cabecalho';

        const icone = document.createElement('div');
        icone.className = 'materia-icone';
        icone.innerHTML = '<i class="fa-solid ' + materia.icone + '"></i>';

        const titulo = document.createElement('div');
        titulo.className = 'materia-titulo';
        const h2 = document.createElement('h2');
        h2.textContent = materia.rotulo;
        const p = document.createElement('p');
        p.textContent = materia.descricao;
        titulo.appendChild(h2);
        titulo.appendChild(p);

        const progresso = document.createElement('span');
        progresso.className = 'materia-progresso';
        progresso.innerHTML = '<strong>0</strong> de 4 eixos';

        cabecalho.appendChild(icone);
        cabecalho.appendChild(titulo);
        cabecalho.appendChild(progresso);

        const grid = document.createElement('div');
        grid.className = 'materia-grid';

        EIXOS.forEach((eixo) => {
            const slot = document.createElement('div');
            slot.className = 'slot';
            slot.dataset.materia = materia.id;
            slot.dataset.eixo = eixo;
            grid.appendChild(slot);
        });

        secao.appendChild(cabecalho);
        secao.appendChild(grid);
        listaMaterias.appendChild(secao);

        refs[materia.id] = {
            secao: secao,
            grid: grid,
            progresso: progresso,
            slots: Array.from(grid.children)
        };
    });
}

/* ================= RENDERIZAÇÃO ================= */

function renderizarTudo() {
    MATERIAS.forEach((materia) => {
        const referencia = refs[materia.id];
        if (!referencia) return;

        referencia.slots.forEach((slot, indice) => {
            renderizarSlot(slot, materia, EIXOS[indice]);
        });

        const preenchidos = EIXOS.filter((eixo) => !!estado[chave(materia.id, eixo)]).length;
        referencia.progresso.innerHTML = '<strong>' + preenchidos + '</strong> de 4 eixos';
    });
}

function renderizarSlot(slot, materia, eixo) {
    slot.innerHTML = '';
    slot.className = 'slot';

    const atividade = estado[chave(materia.id, eixo)];
    const editavel = podeEditar();

    if (!atividade) {
        slot.classList.add('slot-vazio');

        const conteudo = document.createElement('div');
        conteudo.className = 'slot-vazio-conteudo';

        const icone = document.createElement('div');
        icone.className = 'slot-vazio-icone';
        icone.innerHTML = '<i class="fa-regular fa-image"></i>';

        const h3 = document.createElement('h3');
        h3.textContent = 'Eixo ' + eixo;

        const p = document.createElement('p');
        p.textContent = editavel
            ? 'Nenhuma atividade escolhida ainda.'
            : 'Este eixo ainda não foi preenchido.';

        conteudo.appendChild(icone);
        conteudo.appendChild(h3);
        conteudo.appendChild(p);

        if (editavel) {
            const botao = document.createElement('button');
            botao.type = 'button';
            botao.className = 'btn-adicionar';
            botao.innerHTML = '<i class="fa-solid fa-plus"></i> Adicionar atividade';
            botao.addEventListener('click', () => abrirPicker(materia, eixo));
            conteudo.appendChild(botao);
        } else {
            const bloqueado = document.createElement('span');
            bloqueado.className = 'slot-bloqueado';
            bloqueado.textContent = 'Somente leitura';
            conteudo.appendChild(bloqueado);
        }

        slot.appendChild(conteudo);
        return;
    }

    slot.classList.add('slot-cheio');

    const midia = document.createElement('div');
    midia.className = 'slot-midia';
    midia.setAttribute('role', 'button');
    midia.setAttribute('tabindex', '0');
    midia.setAttribute('aria-label', 'Ampliar a atividade ' + atividade.nome);

    const badge = document.createElement('span');
    badge.className = 'slot-eixo';
    badge.textContent = 'Eixo ' + eixo;

    const img = document.createElement('img');
    img.src = atividade.imagem;
    img.alt = atividade.nome;
    img.loading = 'lazy';

    const zoom = document.createElement('span');
    zoom.className = 'slot-zoom';
    zoom.innerHTML = '<i class="fa-solid fa-expand"></i>';

    midia.appendChild(badge);
    midia.appendChild(img);
    midia.appendChild(zoom);

    const abrir = () => abrirLightbox(materia, eixo);
    midia.addEventListener('click', abrir);
    midia.addEventListener('keydown', (evento) => {
        if (evento.key === 'Enter' || evento.key === ' ') {
            evento.preventDefault();
            abrir();
        }
    });

    const info = document.createElement('div');
    info.className = 'slot-info';

    const nome = document.createElement('h3');
    nome.textContent = atividade.nome;

    const meta = document.createElement('span');
    meta.textContent = materia.rotulo + ' · Eixo ' + eixo;

    info.appendChild(nome);
    info.appendChild(meta);

    slot.appendChild(midia);
    slot.appendChild(info);

    if (editavel) {
        const acoes = document.createElement('div');
        acoes.className = 'slot-acoes';

        const trocar = document.createElement('button');
        trocar.type = 'button';
        trocar.className = 'btn-slot trocar';
        trocar.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Trocar';
        trocar.addEventListener('click', () => abrirPicker(materia, eixo));

        const remover = document.createElement('button');
        remover.type = 'button';
        remover.className = 'btn-slot remover';
        remover.innerHTML = '<i class="fa-solid fa-trash"></i> Remover';
        remover.addEventListener('click', () => removerEscolhida(materia, eixo));

        acoes.appendChild(trocar);
        acoes.appendChild(remover);
        slot.appendChild(acoes);
    }
}

/* ================= CARREGAMENTO ================= */

/* Lê as atividades que já aparecem nas páginas das disciplinas (HTML estático)
   para que elas também possam ser escolhidas na curadoria. */
async function carregarAtividadesLocais() {
    const encontradas = [];

    await Promise.all(MATERIAS.map(async (materia) => {
        try {
            const resposta = await fetch(materia.pagina, { cache: 'no-cache' });
            if (!resposta.ok) return;

            const html = await resposta.text();
            const documento = new DOMParser().parseFromString(html, 'text/html');

            documento.querySelectorAll('.eixo-section').forEach((secao) => {
                const titulo = secao.querySelector('.eixo-titulo h2');
                const eixo = obterNumeroEixo(titulo ? titulo.textContent : '');

                secao.querySelectorAll('.atividade-card').forEach((card) => {
                    const img = card.querySelector('img');
                    const legenda = card.querySelector('figcaption');
                    const src = img ? img.getAttribute('src') : '';
                    if (!src) return;

                    encontradas.push({
                        nome: (legenda ? legenda.textContent : (img.getAttribute('alt') || 'Atividade')).trim(),
                        imagem: src,
                        eixo: 'EIXO ' + eixo,
                        disciplina: materia.original,
                        local: true
                    });
                });
            });
        } catch (erro) {
            /* Se a página não puder ser lida, seguimos apenas com a nuvem. */
        }
    }));

    return encontradas;
}

async function carregarTudo() {
    if (typeof CLOUDE === 'undefined' || !CLOUDE.estaConfigurado()) {
        mostrarAviso(
            typeof CLOUDE !== 'undefined'
                ? CLOUDE.erroConfiguracao()
                : 'Não foi possível carregar a conexão com a nuvem.'
        );
        renderizarTudo();
        return;
    }

    try {
        const resultados = await Promise.all([
            CLOUDE.listarAtividades(),
            carregarAtividadesLocais()
        ]);

        todasAtividades = resultados[0] || [];
        atividadesLocais = resultados[1] || [];
        estado = {};

        todasAtividades.forEach((atividade) => {
            const disciplina = normalizarNome(atividade.disciplina);
            if (disciplina.indexOf(PREFIXO_ESCOLHIDAS) !== 0) return;

            const materia = materiaPorDisciplina(disciplina.slice(PREFIXO_ESCOLHIDAS.length));
            if (!materia) return;

            const eixo = obterNumeroEixo(atividade.eixo);
            if (eixo < 1 || eixo > 4) return;

            /* Se houver mais de um registro no mesmo espaço, o mais recente vence. */
            estado[chave(materia.id, eixo)] = atividade;
        });

        esconderAviso();
        renderizarTudo();
    } catch (erro) {
        mostrarAviso('Erro ao carregar as atividades da nuvem: ' + (erro.message || erro));
        renderizarTudo();
    }
}

/* ================= PICKER ================= */

function abrirPicker(materia, eixo) {
    if (!podeEditar()) return;

    pickerAtual = { materia: materia, eixo: eixo };
    pickerMateria.textContent = materia.rotulo;
    pickerTitulo.textContent = 'Eixo ' + eixo + ' · ' + materia.rotulo;

    pickerForm.reset();
    limparMsgPicker();
    preencherGaleria(materia, eixo);

    picker.classList.add('ativo');
    picker.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function fecharPicker() {
    picker.classList.remove('ativo');
    picker.setAttribute('aria-hidden', 'true');
    pickerAtual = null;
    if (!lightbox.classList.contains('ativo')) {
        document.body.style.overflow = '';
    }
}

function preencherGaleria(materia, eixo) {
    pickerGaleria.innerHTML = '';

    const vistos = new Set();
    const disponiveis = todasAtividades.concat(atividadesLocais).filter((atividade) => {
        const disciplina = normalizarNome(atividade.disciplina);
        const mesmoEixo = disciplina === normalizarNome(materia.original)
            && obterNumeroEixo(atividade.eixo) === eixo;
        if (!mesmoEixo) return false;

        const assinatura = atividade.imagem + '|' + atividade.nome;
        if (vistos.has(assinatura)) return false;
        vistos.add(assinatura);
        return true;
    });

    if (disponiveis.length === 0) {
        pickerVazio.classList.add('visivel');
        return;
    }

    pickerVazio.classList.remove('visivel');

    disponiveis.forEach((atividade) => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'picker-item';

        const img = document.createElement('img');
        img.src = atividade.imagem;
        img.alt = atividade.nome;
        img.loading = 'lazy';

        const nome = document.createElement('span');
        nome.textContent = atividade.nome;

        item.appendChild(img);
        item.appendChild(nome);
        item.addEventListener('click', () => {
            salvarEscolhida({ nome: atividade.nome, imagem: atividade.imagem });
        });

        pickerGaleria.appendChild(item);
    });
}

function limparMsgPicker() {
    pickerMsg.className = 'picker-msg';
    pickerMsg.textContent = '';
}

function definirMsgPicker(tipo, texto) {
    pickerMsg.className = 'picker-msg ' + tipo;
    pickerMsg.textContent = texto;
}

async function salvarEscolhida(dados, interno) {
    if (!pickerAtual) return;
    if ((salvando || enviando) && !interno) return;

    const materia = pickerAtual.materia;
    const eixo = pickerAtual.eixo;
    const atual = estado[chave(materia.id, eixo)];

    salvando = true;
    pickerSalvar.disabled = true;
    definirMsgPicker('sucesso', 'Salvando a atividade na nuvem...');

    try {
        if (atual) {
            /* Remove só o registro antigo. A imagem original é preservada. */
            await CLOUDE.removerAtividade(atual.id);
            todasAtividades = todasAtividades.filter((a) => a.id !== atual.id);
        }

        const salva = await CLOUDE.salvarAtividade({
            nome: dados.nome,
            eixo: 'EIXO ' + eixo,
            disciplina: PREFIXO_ESCOLHIDAS + materia.original,
            imagem: dados.imagem
        });

        estado[chave(materia.id, eixo)] = salva;
        todasAtividades.push(salva);

        fecharPicker();
        renderizarTudo();
        mostrarToast('Eixo ' + eixo + ' de ' + materia.rotulo + ' atualizado.');
    } catch (erro) {
        definirMsgPicker('erro', 'Não foi possível salvar: ' + (erro.message || erro));
    } finally {
        salvando = false;
        pickerSalvar.disabled = false;
    }
}

async function enviarNovaAtividade(evento) {
    evento.preventDefault();

    if (!pickerAtual || enviando) return;

    const nome = pickerNome.value.trim();
    const arquivo = pickerArquivo.files[0];

    if (!nome || !arquivo) {
        definirMsgPicker('erro', 'Preencha o nome e escolha uma imagem.');
        return;
    }

    if (!arquivo.type.startsWith('image/')) {
        definirMsgPicker('erro', 'O arquivo precisa ser uma imagem (PNG, JPG, etc).');
        return;
    }

    if (!CLOUDE.estaConfigurado()) {
        definirMsgPicker('erro', CLOUDE.erroConfiguracao());
        return;
    }

    enviando = true;
    pickerSalvar.disabled = true;
    definirMsgPicker('sucesso', 'Processando a imagem, aguarde...');

    try {
        const imagemComprimida = await StorageHelper.comprimirImagem(arquivo, 1400, 0.85);
        definirMsgPicker('sucesso', 'Enviando a imagem para a nuvem...');

        const blob = StorageHelper.dataURLParaBlob(imagemComprimida);
        const urlImagem = await CLOUDE.enviarImagem(blob, 'escolhidas');

        await salvarEscolhida({ nome: nome, imagem: urlImagem }, true);
    } catch (erro) {
        definirMsgPicker('erro', 'Erro ao enviar a imagem: ' + (erro.message || erro));
    } finally {
        enviando = false;
        pickerSalvar.disabled = false;
    }
}

async function removerEscolhida(materia, eixo) {
    if (!podeEditar()) return;

    const atual = estado[chave(materia.id, eixo)];
    if (!atual) return;

    const confirmar = window.confirm(
        'Remover a atividade do Eixo ' + eixo + ' de ' + materia.rotulo + '?'
    );
    if (!confirmar) return;

    try {
        await CLOUDE.removerAtividade(atual.id);
        delete estado[chave(materia.id, eixo)];
        todasAtividades = todasAtividades.filter((a) => a.id !== atual.id);
        renderizarTudo();
        mostrarToast('Atividade removida.');
    } catch (erro) {
        mostrarToast('Erro ao remover: ' + (erro.message || erro), true);
    }
}

/* ================= LIGHTBOX ================= */

function abrirLightbox(materia, eixoClicado) {
    lightboxLista = [];

    EIXOS.forEach((eixo) => {
        const atividade = estado[chave(materia.id, eixo)];
        if (atividade) {
            lightboxLista.push({ atividade: atividade, materia: materia, eixo: eixo });
        }
    });

    if (lightboxLista.length === 0) return;

    lightboxIndice = lightboxLista.findIndex((item) => item.eixo === eixoClicado);
    if (lightboxIndice < 0) lightboxIndice = 0;

    atualizarLightbox();
    lightbox.classList.add('ativo');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function fecharLightbox() {
    lightbox.classList.remove('ativo');
    lightbox.setAttribute('aria-hidden', 'true');
    resetarRotacao();
    if (!picker.classList.contains('ativo')) {
        document.body.style.overflow = '';
    }
}

function atualizarLightbox() {
    const item = lightboxLista[lightboxIndice];
    if (!item) return;

    lightboxImg.src = item.atividade.imagem;
    lightboxImg.alt = item.atividade.nome;
    lightboxLegenda.textContent = item.atividade.nome;
    lightboxMeta.textContent = item.materia.rotulo + ' · Eixo ' + item.eixo;

    const temVarias = lightboxLista.length > 1;
    lightboxAnterior.style.display = temVarias ? 'flex' : 'none';
    lightboxProximo.style.display = temVarias ? 'flex' : 'none';

    resetarRotacao();
}

function navegarLightbox(direcao) {
    if (lightboxLista.length < 2) return;
    lightboxIndice = (lightboxIndice + direcao + lightboxLista.length) % lightboxLista.length;
    atualizarLightbox();
}

function girarImagem() {
    rotacaoAtual -= 90;
    lightboxImg.style.transform = 'rotate(' + rotacaoAtual + 'deg)';
}

function resetarRotacao() {
    rotacaoAtual = 0;
    if (lightboxImg) lightboxImg.style.transform = '';
}

/* ================= EVENTOS ================= */

if (pickerFechar) pickerFechar.addEventListener('click', fecharPicker);
if (pickerForm) pickerForm.addEventListener('submit', enviarNovaAtividade);

if (lightboxFechar) lightboxFechar.addEventListener('click', fecharLightbox);
if (lightboxRotacionar) lightboxRotacionar.addEventListener('click', girarImagem);
if (lightboxAnterior) lightboxAnterior.addEventListener('click', () => navegarLightbox(-1));
if (lightboxProximo) lightboxProximo.addEventListener('click', () => navegarLightbox(1));

if (picker) {
    picker.addEventListener('click', (evento) => {
        if (evento.target === picker) fecharPicker();
    });
}

if (lightbox) {
    lightbox.addEventListener('click', (evento) => {
        if (evento.target === lightbox) fecharLightbox();
    });
}

document.addEventListener('keydown', (evento) => {
    if (lightbox.classList.contains('ativo')) {
        if (evento.key === 'Escape') fecharLightbox();
        if (evento.key === 'ArrowLeft') navegarLightbox(-1);
        if (evento.key === 'ArrowRight') navegarLightbox(1);
        if (evento.key === 'r' || evento.key === 'R') girarImagem();
        return;
    }

    if (picker.classList.contains('ativo') && evento.key === 'Escape') {
        fecharPicker();
    }
});

/* ================= INÍCIO ================= */

construirSecoes();
renderizarTudo();
carregarTudo();
