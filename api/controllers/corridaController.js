// === [BLOCO 1] CONTROLLER DE CORRIDA ===
// Lógica para lidar com criação de uma corrida

export const criarCorrida = (req, res) => {
  console.log("📥 Body recebido:", req.body); // debug

  const { passageiroId, origem, destino, distancia, precoEstimado } = req.body;

  if (!passageiroId || !origem || !destino || !distancia || !precoEstimado) {
    return res.status(400).json({ erro: 'Dados incompletos para criar a corrida' });
  }

  const novaCorrida = {
    id: Date.now(),
    passageiroId,
    origem,
    destino,
    distancia,
    precoEstimado,
    status: 'pendente'
  };

  console.log("✅ Corrida recebida:", novaCorrida);

  return res.status(201).json({
    mensagem: 'Corrida criada com sucesso',
    corrida: novaCorrida
  });
};
