import * as secp from 'ethereum-cryptography/secp256k1'
import { keccak256 } from 'ethereum-cryptography/keccak'
import { hexToBytes, toHex } from 'ethereum-cryptography/utils'

export type Account = {
  address: string
  privateKey: string
  publicKey: string
}

class Wallet {
  public account: Account[] = []

  hashMessage = (message: any) => keccak256(Uint8Array.from(message))

  getAccount = () => {
    return this.account
  }

  newAccount = () => {
    const privateKey = secp.utils.randomPrivateKey()
    const publicKey = secp.getPublicKey(privateKey)

    const address = '0x' + toHex(keccak256(publicKey.slice(1).slice(-20))).toString()
    const account: Account = {
      address,
      privateKey: toHex(privateKey),
      publicKey: toHex(publicKey),
    }

    this.account.push(account)
  }

  getPrivateKey = (account: string) => {
    if (!account) return null
    return hexToBytes(this.account.find((acc) => acc.address === account)!.privateKey)
  }

  getPublicKey = (account: string) => {
    return hexToBytes(this.account.find((acc) => acc.address === account)!.publicKey)
  }

  getHexPubKey = (account: string) => {
    if (!account) return null
    return toHex(this.getPublicKey(account))
  }

  sign = async (account: string, message: string) => {
    const privateKey = this.getPrivateKey(account) as Uint8Array
    const hash = this.hashMessage(message)

    const [signature, recoveryBit] = await secp.sign(hash, privateKey, {
      recovered: true,
    })
    const fullSignature = new Uint8Array([recoveryBit, ...signature])
    return toHex(fullSignature)
  }
}

const wallet = new Wallet()
export default wallet
