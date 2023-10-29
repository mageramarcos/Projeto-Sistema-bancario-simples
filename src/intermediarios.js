
const intermediario = (req, res, next) => {
    const { senha_banco } = req.query
    if (!senha_banco) {
        return res.status(403).json({ mensagem: "Por favor, informe a senha" })
    }
    if (senha_banco !== "Cubos123Bank") {
        return res.status(401).json({ mensagem: "Senha incorreta." })
    }
    return next()
}

module.exports = intermediario