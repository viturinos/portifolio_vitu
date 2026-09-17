/* =============================================
   CLIENTE SUPABASE — atividades e momentos na nuvem
   Funciona 100% com GitHub Pages (site estático).
   Requer: supabase-js (CDN) + supabase-config.js
   carregados ANTES deste arquivo.
   ============================================= */

const CLOUDE = (function () {
    let cliente = null;

    if (window.supabase && SUPABASE_URL && SUPABASE_ANON_KEY) {
        cliente = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }

    const BUCKET = 'uploads';

    return {

        estaConfigurado() {
            return !!cliente;
        },

        erroConfiguracao() {
            return 'Este site ainda não foi conectado ao banco de dados na nuvem. Preencha o arquivo supabase-config.js com os dados do seu projeto Supabase.';
        },

        listarAtividades() {
            return cliente
                .from('atividades')
                .select('id, nome, eixo, disciplina, imagem, data')
                .order('data', { ascending: true })
                .then(({ data, error }) => {
                    if (error) throw error;
                    return data || [];
                });
        },

        salvarAtividade(atividade) {
            return cliente
                .from('atividades')
                .insert({
                    nome: atividade.nome,
                    eixo: atividade.eixo,
                    disciplina: atividade.disciplina,
                    imagem: atividade.imagem
                })
                .select('id, nome, eixo, disciplina, imagem, data')
                .single()
                .then(({ data, error }) => {
                    if (error) throw error;
                    return data;
                });
        },

        removerAtividade(id, caminhoArquivo) {
            const remocoes = [];
            if (caminhoArquivo) {
                remocoes.push(
                    cliente.storage.from(BUCKET).remove([caminhoArquivo])
                );
            }
            remocoes.push(cliente.from('atividades').delete().eq('id', id));
            return Promise.all(remocoes).then(() => true);
        },

        listarMomentos() {
            return cliente
                .from('momentos')
                .select('id, titulo, imagem, data')
                .order('data', { ascending: true })
                .then(({ data, error }) => {
                    if (error) throw error;
                    return data || [];
                });
        },

        salvarMomento(momento) {
            return cliente
                .from('momentos')
                .insert({
                    titulo: momento.titulo,
                    imagem: momento.imagem
                })
                .select('id, titulo, imagem, data')
                .single()
                .then(({ data, error }) => {
                    if (error) throw error;
                    return data;
                });
        },

        removerMomento(id, caminhoArquivo) {
            const remocoes = [];
            if (caminhoArquivo) {
                remocoes.push(
                    cliente.storage.from(BUCKET).remove([caminhoArquivo])
                );
            }
            remocoes.push(cliente.from('momentos').delete().eq('id', id));
            return Promise.all(remocoes).then(() => true);
        },

        enviarImagem(arquivo, pasta) {
            if (!cliente) return Promise.reject(new Error(this.erroConfiguracao()));
            const ext = arquivo.type === 'image/png' ? 'png' : 'jpg';
            const nome = Date.now() + '-' + Math.round(Math.random() * 1e9) + '.' + ext;
            const caminho = pasta + '/' + nome;

            return cliente.storage
                .from(BUCKET)
                .upload(caminho, arquivo, { contentType: arquivo.type, upsert: false })
                .then(({ error }) => {
                    if (error) throw error;
                    const { data } = cliente.storage.from(BUCKET).getPublicUrl(caminho);
                    return data.publicUrl;
                });
        },

        caminhoDoArquivo(url) {
            const marcador = BUCKET + '/';
            const indice = (url || '').indexOf(marcador);
            if (indice === -1) return null;
            return (url || '').slice(indice + marcador.length);
        }
    };
})();