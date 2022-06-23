import {BigNumber, ethers} from "ethers";
import {EthersSafeProxy} from "../src/ethersSafeProxy";
import {SafeTransactionBuilder} from "../src/safeTransactionBuilder";
import {TransactionInput, TransactionType} from "ethers-multisend";

describe("gnosis safe proxy", () => {
  const safeAddress = process.env.SAFE_ADDRESS
    ? process.env.SAFE_ADDRESS
    : "0xDE374ece6fA50e781E81Aac78e811b33D16912c7";

  const provider = new ethers.providers.JsonRpcProvider({
    url: "http://localhost:8545",
  });

  if (!process.env.PRIVATE_KEY_HEX_STRING && !process.env.MNEMONIC_STRING) {
    throw new Error(`Neither PRIVATE_KEY_HEX_STRING nor PRIVATE_KEY_MNEMONIC are set`);
  }

  const wallet = process.env.PRIVATE_KEY_HEX_STRING
    ? new ethers.Wallet(process.env.PRIVATE_KEY_HEX_STRING, provider)
    : ethers.Wallet.fromMnemonic(process.env.PRIVATE_KEY_MNEMONIC);

  console.log("Using EOA owner with address:", wallet.address);

  describe("constructor", () => {
    it("should create a new instance", async () => {
      console.log(`Creating a new instance of GnosisSafeProxy with address ${safeAddress}`);
      const safeProxy = new EthersSafeProxy(provider, wallet, safeAddress);
      expect(safeProxy.safeAddress).toEqual(safeAddress);
    });
  });

  it("should estimate the gas for a transfer", async () => {
    const safeProxy = new EthersSafeProxy(provider, wallet, safeAddress);
    const txBuilder = new SafeTransactionBuilder(safeProxy);
    const testTx = await txBuilder.transfer(
      BigNumber.from(1),
      "0x0000000000000000000000000000000000000000",
      BigNumber.from(1));

    const safeTxGas = await safeProxy.estimateGas(testTx);
    console.log(`safeTxGas: ${safeTxGas}`);
  });

  it("should get the current owners of a safe", async () => {
    const safeProxy = new EthersSafeProxy(provider, wallet, safeAddress);
    const owners = await safeProxy.getOwners();

    expect(owners.length).toBeGreaterThan(0);
    console.log(`owners of safe ${safeProxy.safeAddress}:`, owners);
  });

  it("should read the current nonce", async () => {
    const safeProxy = new EthersSafeProxy(provider, wallet, safeAddress);
    const nonce = await safeProxy.getNonce();

    expect(nonce).toBe(0);
    console.log(`nonce of safe ${safeProxy.safeAddress}:`, nonce);
  });

  it("should read the current balance of a safe", async () => {
    const safeProxy = new EthersSafeProxy(provider, wallet, safeAddress);
    const balance = await safeProxy.getBalance();

    expect(balance.gt("0")).toBeTruthy();
    console.log(`balance of safe ${safeProxy.safeAddress}:`, balance);
  });

  it("should calculate the hash of an UnsignedTransaction", async () => {
    const safeProxy = new EthersSafeProxy(provider, wallet, safeAddress);
    const txBuilder = new SafeTransactionBuilder(safeProxy);
    const gasLimit = BigNumber.from(21000);

    const transferTx = await txBuilder.transfer(
      ethers.utils.parseEther("0.000000001"),
      "0xD68193591d47740E51dFBc410da607A351b56586",
      gasLimit);

    const baseGas = BigNumber.from("0");
    const safeTxGas = BigNumber.from("0");

    const hash = await safeProxy.getTransactionHash(
      transferTx,
      0,
      baseGas,
      safeTxGas);

    expect(hash.length).toBeGreaterThan(0);
    console.log(`hash of transfer tx:`, hash);
  });

  describe("executeTransaction", () => {

    it("should transfer funds to another account", async () => {
      const safeProxy = new EthersSafeProxy(provider, wallet, safeAddress);
      const txBuilder = new SafeTransactionBuilder(safeProxy);

      const gasLimit = BigNumber.from(221000);

      const transferTx = await txBuilder.transfer(
        ethers.utils.parseEther("0.000000001"),
        "0xD68193591d47740E51dFBc410da607A351b56586",
        gasLimit);

      const receipt = await safeProxy.executeTransaction(transferTx);
      console.log(receipt)
    });

    it("should transfer multiple tokens in one transaction", async () => {
      const safeProxy = new EthersSafeProxy(provider, wallet, safeAddress);
      const txBuilder = new SafeTransactionBuilder(safeProxy);
      const gasLimit = BigNumber.from(21000);

      const multiSendTx = await txBuilder.multiSend([<TransactionInput>{
        id: "1",
        from: "0xde374ece6fa50e781e81aac78e811b33d16912c7",
        to: "0xc5a786eafefcf703c114558c443e4f17969d9573",
        amount: "0.01",
        decimals: 18,
        type: TransactionType.transferFunds,
        token: "0x04e7c72a70975b3d2f35ec7f6b474451f43d4ea0",
      }, <TransactionInput>{
        id: "2",
        from: "0xde374ece6fa50e781e81aac78e811b33d16912c7",
        to: "0xc5a786eafefcf703c114558c443e4f17969d9573",
        amount: "0.01",
        decimals: 18,
        type: TransactionType.transferFunds,
        token: "0xd9190f4c57240955bf4e7bfef4d8c168cc94bef0",
      }], gasLimit);

      const receipt = await safeProxy.executeTransaction(multiSendTx);
      console.log(receipt)
    });

    it("should deploy another safe contract", async () => {
      fail("not implemented");
    });

    it("should execute a delegate call on another contract", async () => {
      fail("not implemented");
    });
  });
});
