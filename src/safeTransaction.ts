import {SafeOps} from "./safeOps";
import {BigNumber} from "ethers";

export interface SafeTransaction {
    to: string;
    value: BigNumber;
    data: string;
    operation: SafeOps;
    safeTxGas?: BigNumber;
    baseGas?: BigNumber;
    gasToken: string;
    refundReceiver: string;
    nonce?: number;
}
