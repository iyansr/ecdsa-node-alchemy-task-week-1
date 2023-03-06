import React, { useCallback, useState } from 'react'
import server from './utils/server'
import { useWallet } from './WalletContext'

type Props = {
  address: string
  setAddress: (addres: string) => void
  balance: number
  setBalance: (balance: number) => void
}

const setValue = (setter: React.Dispatch<any>) => (evt: React.ChangeEvent<HTMLInputElement>) => setter(evt.target.value)

function Wallet({ address, setAddress, balance, setBalance }: Props) {
  const wallet = useWallet()

  const [deposit, setDeposit] = useState<string>('')
  async function onSelectAccount(evt: React.ChangeEvent<HTMLSelectElement>) {
    const account = evt.target.value
    setAddress(account)

    if (account) {
      const {
        data: { balance },
      } = await server.get(`balance/${account}`)
      setBalance(balance)
    } else {
      setBalance(0)
    }
  }

  const onGenerate = useCallback(
    async (evt: React.FormEvent<HTMLFormElement>) => {
      evt.preventDefault()

      const newAccount = wallet.newAccount()

      let newDeposit = parseInt(deposit)

      setAddress(newAccount!.address)

      const addAccount = {
        account: newAccount!.address,
        balance: newDeposit,
      }

      setDeposit('0')

      try {
        const {
          data: { balance },
        } = await server.post(`deposit`, addAccount)
        setBalance(balance)
      } catch (ex) {
        alert(ex)
      }
    },
    [wallet.accounts, deposit]
  )

  return (
    <div className="container">
      <div className="wallet">
        <h1>Wallet</h1>
        {wallet.accounts.map((a, i) => (
          <div key={i}>{a?.address}</div>
        ))}
        <select onChange={onSelectAccount} value={address} style={{ marginTop: 16 }}>
          <option value="">-----Select Account------</option>
          {wallet.accounts.map((a, i) => (
            <option key={i} value={a?.address}>
              {a?.address}
            </option>
          ))}
        </select>

        <div className="balance">Balance: {balance}</div>
      </div>

      <form className="transfer" onSubmit={onGenerate}>
        <label>
          Create Account
          <input required placeholder="Enter initial deposit" value={deposit} onChange={setValue(setDeposit)}></input>
          <input type="submit" className="button" value="Generate"></input>
        </label>
      </form>
    </div>
  )
}

export default Wallet
