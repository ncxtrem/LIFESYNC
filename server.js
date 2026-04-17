const express = require('express');
const app = express();

// Middleware para garantir que sempre respondemos JSON
app.use(express.json());

// CORS completo e robusto
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Rota de teste
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Backend do LifeSync está funcionando!' });
});

// Rota do chat
app.post('/chat', async (req, res) => { ... });
  console.log('📨 Requisição recebida em /chat');
  
  try {
    const { message, history = [], systemInstruction } = req.body;
    
    // Verifica se a chave da API existe
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY não definida');
      return res.status(500).json({ error: 'Chave da API Gemini não configurada no servidor' });
    }

    // Verifica se o systemInstruction foi enviado
    if (!systemInstruction) {
      console.error('❌ systemInstruction não fornecido');
      return res.status(400).json({ error: 'systemInstruction é obrigatório' });
    }

    const payload = {
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: history,
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
    };

    console.log('📤 Enviando payload para Gemini...');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Erro da API Gemini:', data);
      return res.status(response.status).json({ 
        error: data.error?.message || 'Erro na API Gemini',
        details: data
      });
    }

    const botReply = data.candidates[0].content.parts[0].text;
    console.log('✅ Resposta obtida com sucesso');
    
    res.status(200).json({ resposta: botReply });

  } catch (error) {
    console.error('❌ Erro no servidor:', error);
    // SEMPRE retorna JSON, mesmo em erro
    res.status(500).json({ 
      error: 'Erro interno no servidor',
      message: error.message 
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
  console.log(`📦 GEMINI_API_KEY configurada: ${process.env.GEMINI_API_KEY ? 'SIM' : 'NÃO'}`);
});
