require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

const OMDB_API_KEY = process.env.OMDB_API_KEY || '3d3686d0';
const OMDB_BASE_URL = 'http://www.omdbapi.com';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/filmes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM filmes ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar filmes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/omdb/search/:titulo', async (req, res) => {
  const { titulo } = req.params;

  try {
    const response = await axios.get(`${OMDB_BASE_URL}/?apikey=${OMDB_API_KEY}&t=${encodeURIComponent(titulo)}`);

    if (response.data.Response === 'False') {
      return res.status(404).json({ error: 'Filme não encontrado' });
    }

    const filme = response.data;
    const filmeFormatado = {
      titulo: filme.Title,
      genero: filme.Genre,
      descricao: filme.Plot,
      imagem: filme.Poster !== 'N/A' ? filme.Poster : '',
      ano: filme.Year,
      diretor: filme.Director,
      atores: filme.Actors,
      rating: filme.imdbRating,
      tipo: filme.Type
    };

    res.json(filmeFormatado);
  } catch (error) {
    console.error('Erro ao buscar filme no OMDB:', error);
    res.status(500).json({ error: 'Erro ao buscar filme na base de dados externa' });
  }
});

app.get('/api/omdb/buscar/:termo', async (req, res) => {
  const { termo } = req.params;

  try {
    const response = await axios.get(`${OMDB_BASE_URL}/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(termo)}`);

    if (response.data.Response === 'False') {
      return res.json({ filmes: [], message: 'Nenhum filme encontrado' });
    }

    const filmes = response.data.Search.map(filme => ({
      titulo: filme.Title,
      ano: filme.Year,
      imagem: filme.Poster !== 'N/A' ? filme.Poster : '',
      tipo: filme.Type,
      imdbID: filme.imdbID
    }));

    res.json({ filmes });
  } catch (error) {
    console.error('Erro ao buscar filmes no OMDB:', error);
    res.status(500).json({ error: 'Erro ao buscar filmes na base de dados externa' });
  }
});

app.post('/api/filmes', async (req, res) => {
  const { titulo, genero, descricao, imagem, omdbData } = req.body;

  if (!titulo || !genero) {
    return res.status(400).json({ error: 'Título e gênero são obrigatórios' });
  }

  try {
    const dadosFinais = {
      titulo: titulo || (omdbData ? omdbData.titulo : ''),
      genero: genero || (omdbData ? omdbData.genero : ''),
      descricao: descricao || (omdbData ? omdbData.descricao : ''),
      imagem: imagem || (omdbData ? omdbData.imagem : '')
    };

    if (!dadosFinais.titulo || !dadosFinais.genero) {
      return res.status(400).json({ error: 'Título e gênero são obrigatórios' });
    }

    const result = await pool.query(
      'INSERT INTO filmes (titulo, genero, descricao, imagem, gostei, nao_gostei) VALUES ($1, $2, $3, $4, 0, 0) RETURNING *',
      [dadosFinais.titulo, dadosFinais.genero, dadosFinais.descricao, dadosFinais.imagem]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao cadastrar filme:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/filmes/:id/voto', async (req, res) => {
  const { id } = req.params;
  const { tipo } = req.body;
  if (tipo !== 'gostei' && tipo !== 'nao_gostei') {
    return res.status(400).json({ error: 'Tipo de voto inválido' });
  }

  try {
    const campo = tipo === 'gostei' ? 'gostei' : 'nao_gostei';
    const result = await pool.query(
      `UPDATE filmes SET ${campo} = ${campo} + 1 WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Filme não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao registrar voto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/votos/positivos', async (req, res) => {
  try {
    const result = await pool.query('SELECT SUM(gostei) as total FROM filmes');
    res.json({ total: parseInt(result.rows[0].total) || 0 });
  } catch (error) {
    console.error('Erro ao buscar votos positivos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/votos/negativos', async (req, res) => {
  try {
    const result = await pool.query('SELECT SUM(nao_gostei) as total FROM filmes');
    res.json({ total: parseInt(result.rows[0].total) || 0 });
  } catch (error) {
    console.error('Erro ao buscar votos negativos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/votos/totais', async (req, res) => {
  try {
    const result = await pool.query('SELECT SUM(gostei) as positivos, SUM(nao_gostei) as negativos FROM filmes');
    res.json({
      positivos: parseInt(result.rows[0].positivos) || 0,
      negativos: parseInt(result.rows[0].negativos) || 0
    });
  } catch (error) {
    console.error('Erro ao buscar totais de votos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

module.exports = app;
