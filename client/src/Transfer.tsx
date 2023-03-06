import React, { useState } from 'react'
import server from './utils/server'
import { useWallet } from './WalletContext'

type Props = {
  address: string
  setBalance: React.Dispatch<React.SetStateAction<number>>
}

const setValue = (setter: React.Dispatch<any>) => (evt: React.ChangeEvent<HTMLInputElement>) => setter(evt.target.value)

function Transfer({ address, setBalance }: Props) {
  const wallet = useWallet()

  const [sendAmount, setSendAmount] = useState('')
  const [recipient, setRecipient] = useState('')

  async function transfer(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault()

    const message = {
      amount: parseInt(sendAmount),
      recipient,
    }
    const signature = await wallet.sign(address, message)
    const transaction = {
      message,
      signature,
    }

    try {
      const {
        data: { balance },
      } = await server.post(`send`, transaction)

      setBalance(balance)
    } catch (ex) {
      alert(ex)
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input placeholder="1, 2, 3..." value={sendAmount} onChange={setValue(setSendAmount)}></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  )
}

export default Transfer
