const express = require('express')
const app = express()
const cors = require('cors')
const port = 3042
const crypto = require('./utils/crypto')

app.use(cors())
app.use(express.json())

let balances = {}

app.post('/deposit', (req, res) => {
  const { account, balance } = req.body
  balances[account] = balance
  res.send({
    message: 'Success',
    account,
    balance,
  })
})

app.get('/balance/:account', (req, res) => {
  const { account } = req.params
  const balance = balances[account] || 0

  res.send({ balance })
})

app.post('/send', (req, res) => {
  const { message, signature } = req.body
  const { recipient, amount } = message

  const pubKey = crypto.signatureToPubKey(message, signature)
  const sender = crypto.pubKeyToAccount(pubKey)

  setInitialBalance(sender)
  setInitialBalance(recipient)

  if (balances[sender] < amount) {
    res.status(400).send({ message: 'Not enough funds!' })
  } else {
    balances[sender] = balances[sender] - amount
    balances[recipient] = balances[recipient] + amount
    res.send({ balance: balances[sender] })
  }
})

app.listen(port, () => {
  console.log(`Listening on port ${port}!`)
})

function setInitialBalance(account) {
  if (!balances[account]) {
    balances[account] = 0
  }
}
