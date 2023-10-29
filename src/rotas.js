const { numeroDeContas, criarContas, atualizarContas, excluirContas, depositar, sacar, transferir, saldoConta, extrato, } = require('./controladores/contas')
const express = require('express');
const intermediario = require('./intermediarios');


const rotas = express();

rotas.use(intermediario)

rotas.get('/contas', numeroDeContas)
rotas.post('/contas', criarContas)
rotas.put('/contas/:numeroConta/usuario', atualizarContas)
rotas.delete('/contas/:numeroConta', excluirContas)
rotas.post('/transacoes/depositar', depositar)
rotas.post('/transacoes/sacar', sacar)
rotas.post('/transacoes/transferir', transferir)
rotas.get('/contas/saldo', saldoConta)
rotas.get('/contas/extrato', extrato)


module.exports = rotas