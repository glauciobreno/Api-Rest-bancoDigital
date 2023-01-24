let { banco, contas, saques, depositos, transferencias } = require('../DB/bancodedados');
let id = 0;

const accLists = (req, res) => {
    const { senha_banco } = req.query;

    if (!senha_banco) {
        return res.status(400).json({ mensagem: 'A senha é obrigatória!' });
    }

    if (senha_banco === banco.senha) {
        return res.status(200).json(contas);
    }

    return res.status(400).json({ mensagem: 'A senha informada é inválida!' });
};

const createAcc = (req, res) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
        return res.status(400).json({ mensagem: 'O preenchimento de todos os campos são obrigatórios!' });
    }

    const vericarEmailECpf = contas.find((conta) => {
        return conta.usuario.email === email || conta.usuario.cpf === cpf;
    });

    if (vericarEmailECpf) {
        return res.status(400).json({ mensagem: 'Já existe uma conta com o cpf ou e-mail informado!' });
    }

    const cadastrarUsuario = {
        numero: ++id,
        saldo: 0,
        usuario: {
            nome,
            cpf,
            data_nascimento,
            telefone,
            email,
            senha
        }
    };

    contas.push(cadastrarUsuario);
    return res.status(201).send();
};

const updateAccount = (req, res) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;
    const { numeroConta } = req.params;

    if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
        return res.status(400).json({ mensagem: 'O preenchimento de todos os campos são obrigatórios!' });
    }

    const numeroDaConta = contas.find((contaBancaria) => {
        return contaBancaria.numero === Number(numeroConta);
    });

    if (!numeroDaConta) {
        return res.status(404).json({ mensagem: 'Número da conta bancária inválido!' });
    }

    if (cpf !== numeroDaConta.usuario.cpf) {
        const cpfExistente = contas.find((contaBancaria) => {
            return contaBancaria.usuario.cpf === cpf;
        });

        if (cpfExistente) {
            return res.status(400).json({ mensagem: 'O cpf informado já existe no cadastro!' });
        }
    }

    if (email !== numeroDaConta.usuario.email) {
        const emailExistente = contas.find((contaBancaria) => {
            return contaBancaria.usuario.email === email;
        });

        if (emailExistente) {
            return res.status(400).json({ mensagem: 'O e-mail informado já existe no cadastro!' });
        }
    }

    numeroDaConta.usuario = {
        nome,
        cpf,
        data_nascimento,
        telefone,
        email,
        senha
    };

    return res.status(204).send();
};

const deleteAcc = (req, res) => {
    const { numeroConta } = req.params;

    const numeroDaConta = contas.find((contaBancaria) => {
        return contaBancaria.numero === Number(numeroConta);
    });

    if (!numeroDaConta) {
        return res.status(404).json({ mensagem: 'Número da conta bancária inválido!' });
    }

    if (numeroDaConta.saldo > 0) {
        return res.status(403).json({ mensagem: 'A conta só pode ser removida se o saldo for zero!' });
    }

    let indiceDoUsuario = contas.indexOf(numeroDaConta);
    contas.splice(indiceDoUsuario, 1);

    return res.status(204).send();
};

const balanceAcc = (req, res) => {
    const { numero_conta, senha } = req.query;

    if (!numero_conta || !senha) {
        return res.status(400).json({ mensagem: 'O número da conta e a senha são obrigatórios!' });
    }

    const numeroDaConta = contas.find((contaBancaria) => {
        return contaBancaria.numero === Number(numero_conta);
    });

    if (!numeroDaConta) {
        return res.status(404).json({ mensagem: 'Conta bancária não encontada!' });
    }

    if (numeroDaConta.usuario.senha !== senha) {
        return res.status(400).json({ mensagem: 'Senha inválida!' });
    }

    res.status(200).json({ saldo: numeroDaConta.saldo });
};

const accExtract = (req, res) => {
    const { numero_conta, senha } = req.query;

    if (!numero_conta || !senha) {
        return res.status(400).json({ mensagem: 'O número da conta e a senha são obrigatórios!' });
    }

    const numeroDaConta = contas.find((contaBancaria) => {
        return contaBancaria.numero === Number(numero_conta);
    });

    if (!numeroDaConta) {
        return res.status(404).json({ mensagem: 'Conta bancária não encontrada!' });
    }

    if (numeroDaConta.usuario.senha !== senha) {
        return res.status(400).json({ mensagem: 'Senha inválida!' });
    }

    const extratoDepositos = depositos.filter((deposito) => {
        return Number(deposito.numero_conta) === Number(numero_conta);
    });

    const extratoSaques = saques.filter((saque) => {
        return Number(saque.numero_conta) === Number(numero_conta);
    });

    const transferenciasEnviadas = transferencias.filter((transferencia) => {
        return Number(transferencia.numero_conta_origem) === Number(numero_conta);
    });

    const transferenciasRecebidas = transferencias.filter((transferencia) => {
        return Number(transferencia.numero_conta_destino) === Number(numero_conta);
    });

    return res.status(200).json({
        depositos: extratoDepositos,
        saques: extratoSaques,
        transferenciasEnviadas,
        transferenciasRecebidas
    });
};

module.exports = {
    accLists,
    createAcc,
    updateAccount,
    deleteAcc,
    balanceAcc,
    accExtract
};
