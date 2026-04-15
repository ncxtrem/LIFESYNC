const express = require('express');
const app = express();

// === CONFIGURAÇÃO DE CORS (CORRIGIDA) ===
app.use((req, res, next) => {
  // Permite requisições de qualquer origem (incluindo o Netlify)
  res.header('Access-Control-Allow-Origin', '*');
  // Métodos permitidos
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  // Headers permitidos
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  // Responde OK para requisições OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Middleware para processar JSON
app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
  res.send('Backend do LifeSync está funcionando!');
});

// Rota do chat
app.post('/chat', async (req, res) => {
  try {
    const { message, history = [], systemInstruction } = req.body;
    
    // Railway injeta a chave da API como variável de ambiente
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    // Estrutura corrigida do payload
    const payload = {
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: history,
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Erro na API Gemini');

    const botReply = data.candidates[0].content.parts[0].text;
    res.status(200).json({ resposta: botReply });

  } catch (error) {
    console.error('Erro no backend:', error);
    res.status(500).json({ error: error.message });
  }
});

// Railway fornece a porta dinamicamente. NUNCA defina uma porta fixa.
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🔥 Servidor rodando na porta ${PORT}`);
});
