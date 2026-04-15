const express = require('express');
const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.get('/', (req, res) => res.send('Backend do LifeSync está funcionando!'));

app.post('/chat', async (req, res) => {
  try {
    const { message, history = [], systemInstruction } = req.body;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    // 🚀 Estrutura CORRIGIDA (systemInstruction como objeto separado)
    const payload = {
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: history,
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
    };

    console.log('Payload para Gemini:', JSON.stringify(payload, null, 2));

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🔥 Servidor rodando na porta ${PORT}`));
