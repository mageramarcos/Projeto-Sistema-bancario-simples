let { contas, transferencias, depositos, saques } = require('../bancodedados')


const numeroDeContas = (req, res) => {

    if (contas.length === 0) {
        return res.status(404).json({ mensagem: "Nenhuma conta foi localizada." })
    }
    return res.status(200).json({ contas })
}



const criarContas = (req, res) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body

    if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
        return res.status(400).json({ mensagem: 'Complete todos os campos necessários.' })
    }


    let validarCpf = false
    let validarEmail = false


    for (let i = 0; i < contas.length; i++) {
        if (contas[i].usuario.cpf === cpf) {
            validarCpf = true
            break
        }
    }
    for (let i = 0; i < contas.length; i++) {
        if (contas[i].usuario.email === email) {
            validarEmail = true
            break
        }
    }

    if (validarEmail === true) {
        return res.status(409).json({ mensagem: 'O email já foi registrado.' })
    }


    let contadorConta = contas.length + 1
    const novaConta = {
        numero: contadorConta.toString(),
        saldo: 0,
        usuario: {
            nome,
            cpf,
            data_nascimento,
            telefone,
            email,
            senha
        }
    }
    contas.push(novaConta)

    res.status(201).json({
        mensagem: "Conta registrada com sucesso!",
        novaConta
    })
}



const atualizarContas = (req, res) => {
    const { numeroConta } = req.params
    let { nome, cpf, data_nascimento, telefone, email, senha } = req.body

    const conta = contas.find((conta) => {
        return conta.numero === numeroConta
    })

    if (!conta) {
        return res.status(404).json({ mensagem: "A conta não foi localizada." })
    }

    if (nome || cpf || data_nascimento || telefone || email || senha) {

        if (nome) {
            conta.usuario.nome = nome
        }

        if (cpf) {
            let cpfEncontrado = false
            for (let i = 0; i < contas.length; i++) {
                if (contas[i].usuario.cpf === cpf) {
                    cpfEncontrado = true
                    break
                }
            }
            if (cpfEncontrado === true) {
                return res.status(409).json({ mensagem: 'Já temos um cadastro com esse CPF' })
            }
            conta.usuario.cpf = cpf

        }

        if (data_nascimento) {
            conta.usuario.data_nascimento = data_nascimento

        }
        if (telefone) {
            conta.usuario.telefone = telefone

        }
        if (email) {
            let emailEncontrado = false
            for (let i = 0; i < contas.length; i++) {
                if (contas[i].usuario.email === email) {
                    emailEncontrado = true
                    break
                }
            }
            if (emailEncontrado === true) {
                return res.status(409).json({ mensagem: 'Já temos um cadastro com esse EMAIL' })
            }
            conta.usuario.email = email

        }

        if (senha) {
            conta.usuario.senha = senha

        }
    } else {
        res.status(404).json({ mensagem: "Preencha pelo menos 1 campo." })
    }
    res.status(200).json({ mensagem: "Conta Atualizada com sucesso!" })

}



const excluirContas = (req, res) => {
    const { numeroConta } = req.params

    const conta = contas.find((conta) => {
        return conta.numero === numeroConta
    })

    if (!conta) {
        return res.status(404).json({ mensagem: "Conta não localizada." })
    }

    if (conta.saldo > 0) {
        return res.status(400).json({ mensagem: "A conta contém saldo, portanto não é possível efetuar a exclusão" })
    }
    contas = contas.filter((conta) => {
        return conta.numero !== numeroConta
    })
    return res.status(200).json({ mensagem: "Conta excluída com sucesso!" })
}



const depositar = (req, res) => {
    const { numero_conta, valor } = req.body

    const conta = contas.find((conta) => {
        return conta.numero === numero_conta
    })

    if (!conta) {
        return res.status(404).json({ mensagem: "conta não encontrada" })
    }

    if (!valor || valor <= 0 || isNaN(valor)) {
        return res.status(400).json({ mensagem: "O valor deve conter apenas números e ser maior que zero." })
    }

    const indConta = contas.findIndex((i) => {
        return i.numero === numero_conta
    })
    if (indConta === -1) {
        return res.status(404).json({ mensagem: "conta não encontrada" })
    }

    contas[indConta].saldo += Number(valor)
    const fusorario = new Date().setUTCHours(-4)
    const date = new Date(fusorario).toISOString().replace('T', " ").slice(0, 19)
    const transacao = {
        data: date,
        numero_conta,
        valor
    }
    depositos.push(transacao)
    return res.status(200).json({ mensagem: "Depósito realizado com sucesso" })


}


const sacar = (req, res) => {
    const { numero_conta, valor, senha } = req.body


    const conta = contas.find((conta) => {
        return conta.numero === numero_conta
    })
    if (!conta) {
        return res.status(404).json({ mensagem: "conta não encontrada" })
    }

    if (!senha) {
        return res.status(404).json({ mensagem: "Por favor, digite a senha" })
    }

    if (!valor || valor <= 0 || isNaN(valor)) {
        return res.status(400).json({ mensagem: "O valor deve conter apenas números e ser maior que zero." })
    }

    const indConta = contas.findIndex((i) => {
        return i.numero === numero_conta
    })
    if (indConta === -1) {
        return res.status(404).json({ mensagem: "conta não encontrada" })
    }
    if (Number(valor) > contas[indConta].saldo) {
        return res.status(400).json({ mensagem: "Saldo insuficiente." })
    }


    if (senha !== contas[indConta].usuario.senha) {
        return res.status(400).json({ mensagem: "Senha incorreta" })
    }


    const fusorario = new Date().setUTCHours(-4)
    const date = new Date(fusorario).toISOString().replace('T', " ").slice(0, 19)
    contas[indConta].saldo -= Number(valor)

    const transacao = {
        data: date,
        numero_conta,
        valor
    }
    saques.push(transacao)

    return res.status(201).json(transacao)

}


const transferir = (req, res) => {
    const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body


    const contaOrigem = contas.find((conta) => {
        return conta.numero === numero_conta_origem
    })
    const contaTransferir = contas.find((conta) => {
        return conta.numero === numero_conta_destino
    })
    if (!contaOrigem) {
        return res.status(404).json({ mensagem: "Conta de origem não localizada." })
    }
    if (!contaTransferir) {
        return res.status(404).json({ mensagem: "Conta destino não localizada" })
    }

    const indContaOrigem = contas.findIndex((atual) => {
        return atual.numero === numero_conta_origem
    })
    if (indContaOrigem === -1) {
        return res.status(404).json({ mensagem: "conta não encontrada" })
    }
    const indiceContaTrasferir = contas.findIndex((atual) => {
        return atual.numero === numero_conta_destino
    })
    if (indiceContaTrasferir === -1) {
        return res.status(404).json({ mensagem: "conta não encontrada" })
    }
    if (Number(valor) > contas[indContaOrigem].saldo) {
        return res.status(400).json({ mensagem: "Saldo insuficiente." })
    }

    if (senha !== contas[indContaOrigem].usuario.senha) {
        return res.status(400).json({ mensagem: "Senha incorreta" })
    }
    const fusorario = new Date().setUTCHours(-4)
    const date = new Date(fusorario).toISOString().replace('T', " ").slice(0, 19)

    contas[indContaOrigem].saldo -= Number(valor)

    transferencias.push({
        data: date,
        numero_conta_origem,
        numero_conta_destino,
        valor
    })

    contas[indiceContaTrasferir].saldo += Number(valor)

    transferencias.push({
        data: date,
        numero_conta_origem,
        numero_conta_destino,
        valor
    })


    return res.status(201).json({ mensagem: "Trasnferência realizada com sucesso" })


}


const saldoConta = (req, res) => {

    const { numero_conta, senha } = req.query

    const conta = contas.find((conta) => {
        return conta.numero === numero_conta
    })
    if (!conta) {
        return res.status(404).json({ mensagem: "conta não encontrada" })
    }
    if (!senha) {
        return res.status(404).json({ mensagem: "Por favor, digite a senha" })
    }

    const indConta = contas.findIndex((atual) => {
        return atual.numero === numero_conta
    })
    if (indConta === -1) {
        return res.status(404).json({ mensagem: "conta não encontrada" })
    }

    if (senha !== contas[indConta].usuario.senha) {
        return res.status(400).json({ mensagem: "Senha incorreta" })
    }

    let saldoConta = contas[indConta].saldo
    return res.status(200).json({ saldo: saldoConta })

}


const extrato = (req, res) => {
    const { numero_conta, senha } = req.query

    if (!numero_conta || !senha) {
        return res.status(404).json({ mensagem: "Senha ou número da conta não informados." })
    }

    const indConta = contas.findIndex((atual) => {
        return atual.numero === numero_conta
    })
    if (indConta === -1) {
        return res.status(404).json({ mensagem: "conta não encontrada" })
    }
    if (senha !== contas[indConta].usuario.senha) {
        return res.status(400).json({ mensagem: "Senha incorreta" })
    }

    const deposito = depositos.filter((deposito) => deposito.numero_conta === numero_conta)
    const saque = saques.filter((saque) => saque.numero_conta === numero_conta)
    const env = transferencias.filter((transferencia) => transferencia.numero_conta_origem === numero_conta)
    const rec = transferencias.filter((transferencia) => transferencia.numero_conta_destino === numero_conta)


    res.json({
        deposito,
        saque,
        env,
        rec

    })

}

module.exports = {
    numeroDeContas,
    criarContas,
    atualizarContas,
    excluirContas,
    depositar,
    sacar,
    transferir,
    saldoConta,
    extrato
}
