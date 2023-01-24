let {
  contas,
  saques,
  depositos,
  transferencias,
} = require("../DB/bancodedados");
const { format } = require("date-fns");

const depositar = (req, res) => {
  const { numero_conta, valor } = req.body;

  if (!numero_conta || !valor) {
    return res
      .status(400)
      .json({ mensagem: "O número da conta e o valor são obrigatórios!" });
  }

  const numeroDaConta = contas.find((contaBancaria) => {
    return contaBancaria.numero === Number(numero_conta);
  });

  if (!numeroDaConta) {
    return res.status(404).json({ mensagem: "Conta não encontrada!" });
  }

  if (valor <= 0) {
    return res
      .status(400)
      .json({ mensagem: "Não é permitido depósitos com valores zerados!" });
  }

  numeroDaConta.saldo += Number(valor);

  const registroDoDeposito = {
    data: format(new Date(), "dd-MM-yyyy HH:mm:ss"),
    numero_conta,
    valor,
  };

  depositos.push(registroDoDeposito);
  res.status(201).send();
};

const sacar = (req, res) => {
  const { numero_conta, valor, senha } = req.body;

  if (!numero_conta || !valor || !senha) {
    return res.status(400).json({
      mensagem: "O preenchimento de todos os campos são obrigatórios!",
    });
  }

  const numeroDaConta = contas.find((contaBancaria) => {
    return contaBancaria.numero === Number(numero_conta);
  });

  if (!numeroDaConta) {
    return res.status(404).json({ mensagem: "Conta não encontrada!" });
  }

  if (numeroDaConta.usuario.senha !== senha) {
    return res.status(400).json({ mensagem: "Senha inválida!" });
  }

  if (numeroDaConta.saldo < valor) {
    return res.status(403).json({ mensagem: "Saldo insuficiente!" });
  }

  numeroDaConta.saldo -= Number(valor);

  const registroDoSaque = {
    data: format(new Date(), "dd-MM-yyyy HH:mm:ss"),
    numero_conta,
    valor,
  };

  saques.push(registroDoSaque);
  res.status(201).send();
};

const transferir = (req, res) => {
  const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;

  if (!numero_conta_origem || !numero_conta_destino || !valor || !senha) {
    return res.status(400).json({
      mensagem: "O preenchimento de todos os campos são obrigatórios!",
    });
  }

  const contaOrigem = contas.find((contaBancaria) => {
    return contaBancaria.numero === Number(numero_conta_origem);
  });

  if (!contaOrigem) {
    return res
      .status(404)
      .json({ mensagem: "Número da conta de origem inválido!" });
  }

  const contaDestino = contas.find((contaBancaria) => {
    return contaBancaria.numero === Number(numero_conta_destino);
  });

  if (!contaDestino) {
    return res
      .status(404)
      .json({ mensagem: "Número da conta de destino inválido!" });
  }

  if (contaOrigem.usuario.senha !== senha) {
    return res.status(400).json({ mensagem: "Senha inválida!" });
  }

  if (contaOrigem.saldo < valor) {
    return res.status(403).json({
      mensagem: "Saldo insuficiente para concluir essa transferência!",
    });
  }

  contaOrigem.saldo -= Number(valor);
  contaDestino.saldo += Number(valor);

  const registroDaTransferencia = {
    data: format(new Date(), "dd-MM-yyyy HH:mm:ss"),
    numero_conta_origem,
    numero_conta_destino,
    valor,
    senha,
  };

  transferencias.push(registroDaTransferencia);
  res.status(201).send();
};

module.exports = {
  depositar,
  sacar,
  transferir,
};
