import * as secp from 'ethereum-cryptography/secp256k1'
import { keccak256 } from 'ethereum-cryptography/keccak'
import { hexToBytes, toHex } from 'ethereum-cryptography/utils'

import React, { useContext, useState } from 'react'

export type Account = {
  address: string
  privateKey: string
  publicKey: string
}

type WalletContextType = {
  accounts: Account[]
  hashMessage: (message: any) => Uint8Array | null
  newAccount: () => Account | null
  getPrivateKey: (address: string) => Uint8Array | null
  getPublicKey: (address: string) => Uint8Array | null
  getHexPubKey: (address: string) => string | null
  sign: (address: string, message: any) => Promise<string>
}

export const WalletContext = React.createContext<WalletContextType>({
  accounts: [],
  hashMessage: () => null,
  newAccount: () => null,
  getPrivateKey: (_addres) => null,
  getPublicKey: (_address) => null,
  getHexPubKey: (_addres) => null,
  sign: (_address, _message) => Promise.resolve(''),
})

export const WalletContextProvider = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>([])

  const hashMessage = (message: any) => keccak256(Uint8Array.from(message))

  const newAccount = () => {
    const privateKey = secp.utils.randomPrivateKey()
    const publicKey = secp.getPublicKey(privateKey)

    const address = '0x' + toHex(keccak256(publicKey.slice(1).slice(-20))).toString()
    const account: Account = {
      address,
      privateKey: toHex(privateKey),
      publicKey: toHex(publicKey),
    }

    setAccounts((prev) => [...prev, account])
    return account
  }

  const getPrivateKey = (address: string) => {
    if (!address) return null
    return hexToBytes(accounts.find((acc) => acc.address === address)!.privateKey)
  }

  const getPublicKey = (address: string) => {
    return hexToBytes(accounts.find((acc) => acc.address === address)!.publicKey)
  }

  const getHexPubKey = (address: string) => {
    if (!address) return null
    return toHex(getPublicKey(address))
  }

  const sign = async (address: string, message: string) => {
    const privateKey = getPrivateKey(address) as Uint8Array
    const hash = hashMessage(message)

    const [signature, recoveryBit] = await secp.sign(hash, privateKey, {
      recovered: true,
    })
    const fullSignature = new Uint8Array([recoveryBit, ...signature])
    return toHex(fullSignature)
  }

  return (
    <WalletContext.Provider
      value={{
        accounts,
        hashMessage,
        newAccount,
        getPrivateKey,
        getPublicKey,
        getHexPubKey,
        sign,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => useContext(WalletContext)
