export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Metodo nao permitido' }); return; }

  // Verificar token do usuário
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Nao autorizado. Faca login para continuar.' });
    return;
  }
  const userToken = authHeader.replace('Bearer ', '');

  // Validar token no Supabase
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    res.status(500).json({ error: 'Configuracao do servidor incompleta.' });
    return;
  }

  try {
    const authCheck = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'apikey': supabaseServiceKey
      }
    });
    if (!authCheck.ok) {
      res.status(401).json({ error: 'Sessao invalida. Faca login novamente.' });
      return;
    }

    // Token válido — chamar Anthropic
    const body = req.body;
    const apiKey = process.env.ANTHROPIC_KEY;
    if (!apiKey) { res.status(500).json({ error: 'Chave API nao configurada' }); return; }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: 'Erro interno', details: error.message });
  }
}
