/* =============================================
   ARMAZENAMENTO NO NAVEGADOR (localStorage)
   Permite o site rodar 100% estático (GitHub Pages)
   sem precisar de servidor Node.js/MySQL.
   ============================================= */

const StorageHelper = {

    obter(chave, padrao) {
        try {
            const bruto = localStorage.getItem(chave);
            return bruto ? JSON.parse(bruto) : padrao;
        } catch (e) {
            return padrao;
        }
    },

    salvar(chave, valor) {
        try {
            localStorage.setItem(chave, JSON.stringify(valor));
            return true;
        } catch (e) {
            return false;
        }
    },

    /* Converte uma Data URL (imagem comprimida) em um arquivo Blob para envio à nuvem */
    dataURLParaBlob(dataURL) {
        const partes = dataURL.split(',');
        const meta = partes[0].match(/data:(.*?);base64/);
        const mime = meta ? meta[1] : 'image/jpeg';
        const binario = atob(partes[1]);
        const array = new Uint8Array(binario.length);
        for (let i = 0; i < binario.length; i++) {
            array[i] = binario.charCodeAt(i);
        }
        return new Blob([array], { type: mime });
    },

    /* Converte e COMPRIME uma imagem para caber no navegador antes do envio à nuvem */
    comprimirImagem(arquivo, maxLado, qualidade) {
        return new Promise((resolve, reject) => {
            if (!arquivo || !arquivo.type.startsWith('image/')) {
                return reject(new Error('O arquivo deve ser uma imagem.'));
            }

            const leitor = new FileReader();
            leitor.onerror = () => reject(new Error('Falha ao ler a imagem.'));
            leitor.onload = (e) => {
                const img = new Image();
                img.onerror = () => reject(new Error('Não foi possível processar a imagem.'));
                img.onload = () => {
                    const escala = Math.min(1, maxLado / Math.max(img.width, img.height));
                    const alvoW = Math.max(1, Math.round(img.width * escala));
                    const alvoH = Math.max(1, Math.round(img.height * escala));

                    const canvas = document.createElement('canvas');
                    canvas.width = alvoW;
                    canvas.height = alvoH;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, alvoW, alvoH);

                    const tipo = arquivo.type === 'image/png' ? 'image/png' : 'image/jpeg';
                    resolve(canvas.toDataURL(tipo, qualidade));
                };
                img.src = e.target.result;
            };
            leitor.readAsDataURL(arquivo);
        });
    }
};