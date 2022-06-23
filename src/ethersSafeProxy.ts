import {BigNumber, Contract, ethers, providers, Signer, UnsignedTransaction} from "ethers";
import {SAFE_ABI} from "./ABIs/safe";
import {ZERO_ADDRESS} from "./consts";
import {Interface} from "ethers/lib/utils";

export type SafeOps = 0 | 1;

export class EthersSafeProxy {
  readonly safeAddress:string;
  readonly provider:providers.Provider;
  readonly signer:Signer;
  readonly contract:Contract;

  constructor(provider:providers.Provider, signer:Signer, safeAddress:string){
    this.provider = provider;
    this.signer = signer;
    this.safeAddress = safeAddress;
    this.contract = new ethers.Contract(this.safeAddress, SAFE_ABI, this.signer);
  }

  async getOwners(): Promise<string[]>{
    return await this.contract.getOwners();
  }

  async getNonce(): Promise<number>{
    return (await this.contract.nonce()).toNumber();
  }

  async getBalance() {
    return await this.provider.getBalance(this.safeAddress);
  }

  async executeTransaction(transaction: UnsignedTransaction): Promise<any> {
    const operation = 0;

    const eoaNonce = await this.signer.getTransactionCount('pending');
    const feeData = await this.provider.getFeeData();
    console.log("feeData:", feeData);

    const baseGas = BigNumber.from((21000 * 4).toString());
    const gas = baseGas.mul(feeData.maxFeePerGas);

    const txHash = await this.getTransactionHash(
      transaction,
      operation,
      baseGas,
      BigNumber.from(0));

    const signatures = await this.sign(txHash);

    const iface = new Interface(SAFE_ABI);
    const execTransactionData = iface.encodeFunctionData("execTransaction", [
      // to
      transaction.to,
      // value
      transaction.value,
      // data
      transaction.data,
      // operation
      operation,
      // safeTxGas
      BigNumber.from(0),
      // baseGas
      gas,
      // gasPrice
      transaction.gasPrice,
      // gasToken
      ZERO_ADDRESS,
      // refundReceiver
      ZERO_ADDRESS,
      // signatures
      signatures.signature]);

    const signedTransaction = await this.signer.signTransaction({
      to: this.safeAddress,
      data: execTransactionData,
      nonce: eoaNonce,
      gasLimit: gas,
      gasPrice: transaction.gasPrice,
      value: 0,
      from: this.signer.getAddress()
    });

    return await this.provider.sendTransaction(signedTransaction);
  }

  async estimateGas(transaction: UnsignedTransaction) {
    const operation = 0;
    const baseGasForEstimate = BigNumber.from(21000);
    const txGasForEstimate = BigNumber.from(0);

    const txHash = await this.getTransactionHash(
      transaction,
      operation,
      baseGasForEstimate,
      txGasForEstimate);

    const signatures = await this.sign(txHash);

    return await this.contract.estimateGas.execTransaction(
      // to
      transaction.to,
      // value
      transaction.value,
      // data
      transaction.data,
      // operation
      operation,
      // safeTxGas
      txGasForEstimate,
      // baseGas
      baseGasForEstimate,
      // gasPrice
      transaction.gasPrice,
      // gasToken
      ZERO_ADDRESS,
      // refundReceiver
      ZERO_ADDRESS,
      // signatures
      signatures.signature);
  }

  async getTransactionHash(
    transaction: UnsignedTransaction,
    operation: SafeOps,
    baseGas: BigNumber,
    safeTxGas: BigNumber): Promise<string> {
    return await this.contract.getTransactionHash(
      transaction.to,
      transaction.value,
      transaction.data,
      operation,
      safeTxGas,
      baseGas,
      transaction.gasPrice,
      ZERO_ADDRESS,
      ZERO_ADDRESS,
      transaction.nonce
    );
  }

  async sign(message: string) {
    const signature = await this.signer.signMessage(message);
    const parts = ethers.utils.splitSignature(signature);

    return {
      signature,
      r: parts.r,
      s: parts.s,
      v: parts.v
    };
  }
}
