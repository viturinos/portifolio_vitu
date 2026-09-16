const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('./db');

const app = express();
const PORT = 3000;

const UPLOADS_DIR = path.join(__dirname, 'uploads');
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');

if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname) || '.png';
        const nome = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
        cb(null, nome);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Apenas imagens são permitidas'));
    }
});

app.use(express.static(FRONTEND_DIR));
app.use('/uploads', express.static(UPLOADS_DIR));
app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
});

async function iniciarBanco() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS atividades (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nome VARCHAR(255) NOT NULL,
            eixo VARCHAR(50) NOT NULL,
            disciplina VARCHAR(100) NOT NULL,
            imagem VARCHAR(255) NOT NULL,
            data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS momentos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            titulo VARCHAR(255) NOT NULL,
            imagem VARCHAR(255) NOT NULL,
            data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nome VARCHAR(100) NOT NULL,
            senha VARCHAR(255) NOT NULL
        )
    `);
}

app.get('/api/atividades', async (req, res) => {
    try {
        const [linhas] = await pool.query(
            'SELECT id, nome, eixo, disciplina, imagem, data FROM atividades ORDER BY data ASC'
        );
        res.json(linhas.map(a => ({
            ...a,
            data: a.data ? new Date(a.data).toISOString() : null
        })));
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.post('/api/atividades', upload.single('arquivo'), async (req, res) => {
    try {
        const { nome, eixo, disciplina } = req.body;

        if (!nome || !eixo || !disciplina) {
            return res.status(400).json({ erro: 'Nome, eixo e disciplina são obrigatórios.' });
        }

        if (!req.file) {
            return res.status(400).json({ erro: 'Nenhuma imagem enviada.' });
        }

        const imagem = '/uploads/' + req.file.filename;

        const [result] = await pool.query(
            'INSERT INTO atividades (nome, eixo, disciplina, imagem) VALUES (?, ?, ?, ?)',
            [nome, eixo, disciplina, imagem]
        );

        const atividade = {
            id: result.insertId,
            nome,
            eixo,
            disciplina,
            imagem,
            data: new Date().toISOString()
        };

        res.status(201).json(atividade);
    } catch (err) {
        if (req.file) {
            const caminho = path.join(UPLOADS_DIR, req.file.filename);
            if (fs.existsSync(caminho)) fs.unlinkSync(caminho);
        }
        res.status(500).json({ erro: err.message });
    }
});

app.delete('/api/atividades/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);

        const [linhas] = await pool.query('SELECT imagem FROM atividades WHERE id = ?', [id]);
        if (linhas.length === 0) return res.status(404).json({ erro: 'Atividade não encontrada' });

        const imagem = linhas[0].imagem;
        if (imagem) {
            const caminho = path.join(__dirname, imagem.replace(/^\//, ''));
            if (fs.existsSync(caminho)) fs.unlinkSync(caminho);
        }

        await pool.query('DELETE FROM atividades WHERE id = ?', [id]);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.get('/api/momentos', async (req, res) => {
    try {
        const [linhas] = await pool.query(
            'SELECT id, titulo, imagem, data FROM momentos ORDER BY data ASC'
        );
        res.json(linhas.map(a => ({
            ...a,
            data: a.data ? new Date(a.data).toISOString() : null
        })));
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.post('/api/momentos', upload.single('arquivo'), async (req, res) => {
    try {
        const titulo = (req.body.titulo || '').trim();
        const arquivo = req.file;

        if (!titulo) {
            return res.status(400).json({ erro: 'Digite um título/legenda para o momento.' });
        }

        if (!arquivo) {
            return res.status(400).json({ erro: 'Nenhuma imagem enviada.' });
        }

        const imagem = '/uploads/' + arquivo.filename;

        const [result] = await pool.query(
            'INSERT INTO momentos (titulo, imagem) VALUES (?, ?)',
            [titulo, imagem]
        );

        const momento = {
            id: result.insertId,
            titulo,
            imagem,
            data: new Date().toISOString()
        };

        res.status(201).json(momento);
    } catch (err) {
        if (req.file) {
            const caminho = path.join(UPLOADS_DIR, req.file.filename);
            if (fs.existsSync(caminho)) fs.unlinkSync(caminho);
        }
        res.status(500).json({ erro: err.message });
    }
});

app.delete('/api/momentos/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);

        const [linhas] = await pool.query('SELECT imagem FROM momentos WHERE id = ?', [id]);
        if (linhas.length === 0) return res.status(404).json({ erro: 'Momento não encontrado' });

        const imagem = linhas[0].imagem;
        if (imagem) {
            const caminho = path.join(__dirname, imagem.replace(/^\//, ''));
            if (fs.existsSync(caminho)) fs.unlinkSync(caminho);
        }

        await pool.query('DELETE FROM momentos WHERE id = ?', [id]);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { nome, senha } = req.body;

        if (!nome || !senha) {
            return res.status(400).json({ ok: false, erro: 'Informe usuário e senha.' });
        }

        const [linhas] = await pool.query(
            'SELECT id, nome FROM usuarios WHERE nome = ? AND senha = ? LIMIT 1',
            [nome.trim(), senha]
        );

        if (linhas.length === 0) {
            return res.status(401).json({ ok: false, erro: 'Usuário ou senha inválidos!' });
        }

        res.json({ ok: true, usuario: linhas[0].nome });
    } catch (err) {
        res.status(500).json({ ok: false, erro: err.message });
    }
});

app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        const mensagem = err.code === 'LIMIT_FILE_SIZE'
            ? 'O arquivo é muito grande (máximo de 20MB).'
            : 'Erro ao enviar o arquivo.';
        return res.status(400).json({ erro: mensagem });
    }

    if (err) {
        return res.status(400).json({ erro: err.message || 'Erro ao enviar o arquivo.' });
    }

    next();
});

iniciarBanco()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Servidor rodando em http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Erro ao iniciar banco de dados:', err.message);
        process.exit(1);
    });
