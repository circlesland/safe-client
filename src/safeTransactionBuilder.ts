import {BigNumber, UnsignedTransaction} from "ethers";
import {EMPTY_DATA} from "./consts";
import {EthersSafeProxy} from "./ethersSafeProxy";
import {encodeMulti, encodeSingle, TransactionInput} from "ethers-multisend";

export class SafeTransactionBuilder {
  readonly _safe:EthersSafeProxy;

  constructor(safe:EthersSafeProxy) {
    this._safe = safe;
  }

  async transfer(value: BigNumber, to: string, txGasLimit: BigNumber) : Promise<UnsignedTransaction> {
    const safeNonce = await this._safe.getNonce();
    const gasPrice = await this._safe.provider.getGasPrice();

    return <UnsignedTransaction>{
      from: this._safe.safeAddress,
      to: to,
      nonce: safeNonce,
      gasLimit: txGasLimit,
      gasPrice: gasPrice,
      data: EMPTY_DATA,
      value: value
    };
  }


  async multiSend(input:TransactionInput[], txGasLimit: BigNumber) : Promise<UnsignedTransaction> {
    const metaTransactions = input.map((o, index) => encodeSingle({
      ...o,
      id: index.toString()
    }));

    const safeNonce = await this._safe.getNonce();
    const gasPrice = await this._safe.provider.getGasPrice();
    const multiTx = encodeMulti(metaTransactions);

    return {
      to: multiTx.to,
      nonce: safeNonce,
      data: multiTx.data,
      gasLimit: txGasLimit,
      gasPrice: gasPrice,
      value: BigNumber.from(0)
    }
  }
}
