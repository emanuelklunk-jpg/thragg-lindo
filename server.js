import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY_GROQ;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ROTA DO CHAT (Ajustada para /api/chat conforme o seu HTML)
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ erro: "A mensagem não pode estar vazia." });
  }

  if (!API_KEY) {
    console.error('ERRO: API_KEY_GROQ não encontrada no .env');
    return res.status(500).json({ erro: "Chave API_KEY_GROQ não configurada no arquivo .env." });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY.trim()}`
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b', 
        messages: [
          { 
            role: "system", 
            content: "Você é o Grande Regente Thragg, líder supremo do Império Viltrumita de Invincible. Responda sempre em português brasileiro, de forma imponente, arrogante, autoritária, curta e direta, agindo como um verdadeiro guerreiro conquistador espacial que exige respeito de seres inferiores, você sabe de tudo, você não se relaciona com machos, não fique repetindo o que você é." 
          },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro detalhado retornado pela Groq:', data);
      return res.status(500).json({ erro: data.error?.message || 'O Groq recusou a requisição.' });
    }

    const reply = data.choices?.[0]?.message?.content || 'Sem resposta no momento.';
    
    // Retorna o campo "reply" esperado pelo seu HTML
    return res.json({ reply: reply });

  } catch (error) {
    console.error('Erro no servidor do chat:', error);
    return res.status(500).json({ erro: 'Erro interno ao conectar com a IA.' });
  }
});

// Rota para carregar o index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[OK] Servidor iniciado com sucesso!`);
  console.log(`[LINK] Acesse agora: http://localhost:${PORT}`);
});