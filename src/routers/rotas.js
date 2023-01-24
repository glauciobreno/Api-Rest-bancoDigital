const express = require('express');
const contasBancarias = require('../controllers/contas');
const transacoes = require('../controllers/transacoes');
const rotas = express();

rotas.get('/contas', contasBancarias.accLists);
rotas.post('/contas', contasBancarias.createAcc);
rotas.put('/contas/:numeroConta/usuario', contasBancarias.updateAccount);
rotas.delete('/contas/:numeroConta', contasBancarias.deleteAcc);
rotas.get('/contas/saldo', contasBancarias.balanceAcc);
rotas.get('/contas/extrato', contasBancarias.accExtract);

rotas.post('/transacoes/depositar', transacoes.depositar);
rotas.post('/transacoes/sacar', transacoes.sacar);
rotas.post('/transacoes/transferir', transacoes.transferir);

module.exports = rotas;
