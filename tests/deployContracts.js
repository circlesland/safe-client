const ethers = require("ethers");
const safeMasterCode = require("./contracts/GnosisSafe.json");
const safeProxyFactoryCode = require("./contracts/GnosisSafeProxyFactory.json");

const {Interface} = require("ethers/lib/utils");
const {BigNumber} = require("ethers");
const PROXY_FACTORY_ABI = [
    {
        "anonymous": false,
        "inputs": [{"indexed": false, "internalType": "contract Proxy", "name": "proxy", "type": "address"}],
        "name": "ProxyCreation",
        "type": "event"
    }, {
        "constant": false,
        "inputs": [{"internalType": "address", "name": "_mastercopy", "type": "address"}, {
            "internalType": "bytes",
            "name": "initializer",
            "type": "bytes"
        }, {"internalType": "uint256", "name": "saltNonce", "type": "uint256"}],
        "name": "calculateCreateProxyWithNonceAddress",
        "outputs": [{"internalType": "contract Proxy", "name": "proxy", "type": "address"}],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }, {
        "constant": false,
        "inputs": [{"internalType": "address", "name": "masterCopy", "type": "address"}, {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
        }],
        "name": "createProxy",
        "outputs": [{"internalType": "contract Proxy", "name": "proxy", "type": "address"}],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }, {
        "constant": false,
        "inputs": [{"internalType": "address", "name": "_mastercopy", "type": "address"}, {
            "internalType": "bytes",
            "name": "initializer",
            "type": "bytes"
        }, {
            "internalType": "uint256",
            "name": "saltNonce",
            "type": "uint256"
        }, {"internalType": "contract IProxyCreationCallback", "name": "callback", "type": "address"}],
        "name": "createProxyWithCallback",
        "outputs": [{"internalType": "contract Proxy", "name": "proxy", "type": "address"}],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }, {
        "constant": false,
        "inputs": [{"internalType": "address", "name": "_mastercopy", "type": "address"}, {
            "internalType": "bytes",
            "name": "initializer",
            "type": "bytes"
        }, {"internalType": "uint256", "name": "saltNonce", "type": "uint256"}],
        "name": "createProxyWithNonce",
        "outputs": [{"internalType": "contract Proxy", "name": "proxy", "type": "address"}],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }, {
        "constant": true,
        "inputs": [],
        "name": "proxyCreationCode",
        "outputs": [{"internalType": "bytes", "name": "", "type": "bytes"}],
        "payable": false,
        "stateMutability": "pure",
        "type": "function"
    }, {
        "constant": true,
        "inputs": [],
        "name": "proxyRuntimeCode",
        "outputs": [{"internalType": "bytes", "name": "", "type": "bytes"}],
        "payable": false,
        "stateMutability": "pure",
        "type": "function"
    }
];
const SAFE_ABI = [
    {"inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor"}, {
        "anonymous": false,
        "inputs": [{"indexed": false, "internalType": "address", "name": "owner", "type": "address"}],
        "name": "AddedOwner",
        "type": "event"
    }, {
        "anonymous": false,
        "inputs": [{
            "indexed": true,
            "internalType": "bytes32",
            "name": "approvedHash",
            "type": "bytes32"
        }, {"indexed": true, "internalType": "address", "name": "owner", "type": "address"}],
        "name": "ApproveHash",
        "type": "event"
    }, {
        "anonymous": false,
        "inputs": [{"indexed": false, "internalType": "address", "name": "masterCopy", "type": "address"}],
        "name": "ChangedMasterCopy",
        "type": "event"
    }, {
        "anonymous": false,
        "inputs": [{"indexed": false, "internalType": "uint256", "name": "threshold", "type": "uint256"}],
        "name": "ChangedThreshold",
        "type": "event"
    }, {
        "anonymous": false,
        "inputs": [{"indexed": false, "internalType": "contract Module", "name": "module", "type": "address"}],
        "name": "DisabledModule",
        "type": "event"
    }, {
        "anonymous": false,
        "inputs": [{"indexed": false, "internalType": "contract Module", "name": "module", "type": "address"}],
        "name": "EnabledModule",
        "type": "event"
    }, {
        "anonymous": false,
        "inputs": [{
            "indexed": false,
            "internalType": "bytes32",
            "name": "txHash",
            "type": "bytes32"
        }, {"indexed": false, "internalType": "uint256", "name": "payment", "type": "uint256"}],
        "name": "ExecutionFailure",
        "type": "event"
    }, {
        "anonymous": false,
        "inputs": [{"indexed": true, "internalType": "address", "name": "module", "type": "address"}],
        "name": "ExecutionFromModuleFailure",
        "type": "event"
    }, {
        "anonymous": false,
        "inputs": [{"indexed": true, "internalType": "address", "name": "module", "type": "address"}],
        "name": "ExecutionFromModuleSuccess",
        "type": "event"
    }, {
        "anonymous": false,
        "inputs": [{
            "indexed": false,
            "internalType": "bytes32",
            "name": "txHash",
            "type": "bytes32"
        }, {"indexed": false, "internalType": "uint256", "name": "payment", "type": "uint256"}],
        "name": "ExecutionSuccess",
        "type": "event"
    }, {
        "anonymous": false,
        "inputs": [{"indexed": false, "internalType": "address", "name": "owner", "type": "address"}],
        "name": "RemovedOwner",
        "type": "event"
    }, {
        "anonymous": false,
        "inputs": [{"indexed": true, "internalType": "bytes32", "name": "msgHash", "type": "bytes32"}],
        "name": "SignMsg",
        "type": "event"
    }, {"payable": true, "stateMutability": "payable", "type": "fallback"}, {
        "constant": true,
        "inputs": [],
        "name": "NAME",
        "outputs": [{"internalType": "string", "name": "", "type": "string"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }, {
        "constant": true,
        "inputs": [],
        "name": "VERSION",
        "outputs": [{"internalType": "string", "name": "", "type": "string"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }, {
        "constant": false,
        "inputs": [{"internalType": "address", "name": "owner", "type": "address"}, {
            "internalType": "uint256",
            "name": "_threshold",
            "type": "uint256"
        }],
        "name": "addOwnerWithThreshold",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }, {
        "constant": true,
        "inputs": [{"internalType": "address", "name": "", "type": "address"}, {
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
        }],
        "name": "approvedHashes",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }, {
        "constant": false,
        "inputs": [{"internalType": "address", "name": "_masterCopy", "type": "address"}],
        "name": "changeMasterCopy",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }, {
        "constant": false,
        "inputs": [{"internalType": "uint256", "name": "_threshold", "type": "uint256"}],
        "name": "changeThreshold",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }, {
        "constant": false,
        "inputs": [{
            "internalType": "contract Module",
            "name": "prevModule",
            "type": "address"
        }, {"internalType": "contract Module", "name": "module", "type": "address"}],
        "name": "disableModule",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }, {
        "constant": true,
        "inputs": [],
        "name": "domainSeparator",
        "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }, {
        "constant": false,
        "inputs": [{"internalType": "contract Module", "name": "module", "type": "address"}],
        "name": "enableModule",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }, {
        "constant": false,
        "inputs": [{"internalType": "address", "name": "to", "type": "address"}, {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
        }, {"internalType": "bytes", "name": "data", "type": "bytes"}, {
            "internalType": "enum Enum.Operation",
            "name": "operation",
            "type": "uint8"
        }],
        "name": "execTransactionFromModule",
        "outputs": [{"internalType": "bool", "name": "success", "type": "bool"}],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }, {
        "constant": false,
        "inputs": [{"internalType": "address", "name": "to", "type": "address"}, {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
        }, {"internalType": "bytes", "name": "data", "type": "bytes"}, {
            "internalType": "enum Enum.Operation",
            "name": "operation",
            "type": "uint8"
        }],
        "name": "execTransactionFromModuleReturnData",
        "outputs": [{"internalType": "bool", "name": "success", "type": "bool"}, {
            "internalType": "bytes",
            "name": "returnData",
            "type": "bytes"
        }],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }, {
        "constant": true,
        "inputs": [],
        "name": "getModules",
        "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }, {
        "constant": true,
        "inputs": [{"internalType": "address", "name": "start", "type": "address"}, {
            "internalType": "uint256",
            "name": "pageSize",
            "type": "uint256"
        }],
        "name": "getModulesPaginated",
        "outputs": [{"internalType": "address[]", "name": "array", "type": "address[]"}, {
            "internalType": "address",
            "name": "next",
            "type": "address"
        }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }, {
        "constant": true,
        "inputs": [],
        "name": "getOwners",
        "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }, {
        "constant": true,
        "inputs": [],
        "name": "getThreshold",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }, {
        "constant": true,
        "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
        "name": "isOwner",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }, {
        "constant": true,
        "inputs": [],
        "name": "nonce",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }, {
        "constant": false,
        "inputs": [{"internalType": "address", "name": "prevOwner", "type": "address"}, {
            "internalType": "address",
            "name": "owner",
            "type": "address"
        }, {"internalType": "uint256", "name": "_threshold", "type": "uint256"}],
        "name": "removeOwner",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }, {
        "constant": false,
        "inputs": [{"internalType": "address", "name": "handler", "type": "address"}],
        "name": "setFallbackHandler",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }, {
        "constant": true,
        "inputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
        "name": "signedMessages",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }, {
        "constant": false,
        "inputs": [{"internalType": "address", "name": "prevOwner", "type": "address"}, {
            "internalType": "address",
            "name": "oldOwner",
            "type": "address"
        }, {"internalType": "address", "name": "newOwner", "type": "address"}],
        "name": "swapOwner",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }, {
        "constant": false,
        "inputs": [{"internalType": "address[]", "name": "_owners", "type": "address[]"}, {
            "internalType": "uint256",
            "name": "_threshold",
            "type": "uint256"
        }, {"internalType": "address", "name": "to", "type": "address"}, {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
        }, {"internalType": "address", "name": "fallbackHandler", "type": "address"}, {
            "internalType": "address",
            "name": "paymentToken",
            "type": "address"
        }, {"internalType": "uint256", "name": "payment", "type": "uint256"}, {
            "internalType": "address payable",
            "name": "paymentReceiver",
            "type": "address"
        }],
        "name": "setup",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }, {
        "constant": false,
        "inputs": [{"internalType": "address", "name": "to", "type": "address"}, {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
        }, {"internalType": "bytes", "name": "data", "type": "bytes"}, {
            "internalType": "enum Enum.Operation",
            "name": "operation",
            "type": "uint8"
        }, {"internalType": "uint256", "name": "safeTxGas", "type": "uint256"}, {
            "internalType": "uint256",
            "name": "baseGas",
            "type": "uint256"
        }, {"internalType": "uint256", "name": "gasPrice", "type": "uint256"}, {
            "internalType": "address",
            "name": "gasToken",
            "type": "address"
        }, {"internalType": "address payable", "name": "refundReceiver", "type": "address"}, {
            "internalType": "bytes",
            "name": "signatures",
            "type": "bytes"
        }],
        "name": "execTransaction",
        "outputs": [{"internalType": "bool", "name": "success", "type": "bool"}],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }, {
        "constant": false,
        "inputs": [{"internalType": "address", "name": "to", "type": "address"}, {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
        }, {"internalType": "bytes", "name": "data", "type": "bytes"}, {
            "internalType": "enum Enum.Operation",
            "name": "operation",
            "type": "uint8"
        }],
        "name": "requiredTxGas",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }, {
        "constant": false,
        "inputs": [{"internalType": "bytes32", "name": "hashToApprove", "type": "bytes32"}],
        "name": "approveHash",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }, {
        "constant": false,
        "inputs": [{"internalType": "bytes", "name": "_data", "type": "bytes"}],
        "name": "signMessage",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }, {
        "constant": false,
        "inputs": [{"internalType": "bytes", "name": "_data", "type": "bytes"}, {
            "internalType": "bytes",
            "name": "_signature",
            "type": "bytes"
        }],
        "name": "isValidSignature",
        "outputs": [{"internalType": "bytes4", "name": "", "type": "bytes4"}],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }, {
        "constant": true,
        "inputs": [{"internalType": "bytes", "name": "message", "type": "bytes"}],
        "name": "getMessageHash",
        "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }, {
        "constant": true,
        "inputs": [{"internalType": "address", "name": "to", "type": "address"}, {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
        }, {"internalType": "bytes", "name": "data", "type": "bytes"}, {
            "internalType": "enum Enum.Operation",
            "name": "operation",
            "type": "uint8"
        }, {"internalType": "uint256", "name": "safeTxGas", "type": "uint256"}, {
            "internalType": "uint256",
            "name": "baseGas",
            "type": "uint256"
        }, {"internalType": "uint256", "name": "gasPrice", "type": "uint256"}, {
            "internalType": "address",
            "name": "gasToken",
            "type": "address"
        }, {"internalType": "address", "name": "refundReceiver", "type": "address"}, {
            "internalType": "uint256",
            "name": "_nonce",
            "type": "uint256"
        }],
        "name": "encodeTransactionData",
        "outputs": [{"internalType": "bytes", "name": "", "type": "bytes"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }, {
        "constant": true,
        "inputs": [{"internalType": "address", "name": "to", "type": "address"}, {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
        }, {"internalType": "bytes", "name": "data", "type": "bytes"}, {
            "internalType": "enum Enum.Operation",
            "name": "operation",
            "type": "uint8"
        }, {"internalType": "uint256", "name": "safeTxGas", "type": "uint256"}, {
            "internalType": "uint256",
            "name": "baseGas",
            "type": "uint256"
        }, {"internalType": "uint256", "name": "gasPrice", "type": "uint256"}, {
            "internalType": "address",
            "name": "gasToken",
            "type": "address"
        }, {"internalType": "address", "name": "refundReceiver", "type": "address"}, {
            "internalType": "uint256",
            "name": "_nonce",
            "type": "uint256"
        }],
        "name": "getTransactionHash",
        "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
];

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

if (!process.env.PRIVATE_KEY_HEX_STRING && !process.env.MNEMONIC_STRING) {
    throw new Error(`Neither PRIVATE_KEY_HEX_STRING nor PRIVATE_KEY_MNEMONIC are set`);
}

const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
const wallet = process.env.PRIVATE_KEY_HEX_STRING
    ? new ethers.Wallet(process.env.PRIVATE_KEY_HEX_STRING, provider)
    : ethers.Wallet.fromMnemonic(process.env.PRIVATE_KEY_MNEMONIC);

async function deploySafeMaster() {
    await provider.ready;

    const abi = safeMasterCode.abi;
    const byteCode = safeMasterCode.bytecode;

    const contractFactory = new ethers.ContractFactory(abi, byteCode, wallet);
    const result = await contractFactory.deploy();

    return result.address;
}

async function deploySafeProxyFactory() {
    await provider.ready;

    const abi = safeProxyFactoryCode.abi;
    const byteCode = safeProxyFactoryCode.bytecode;

    const contractFactory = new ethers.ContractFactory(abi, byteCode, wallet);
    const result = await contractFactory.deploy();

    return result.address;
}

async function deploySafeProxy(safeProxyFactoryAddress, masterSafeAddress) {
    const safeInterface = new Interface(SAFE_ABI);
    console.error("preparing proxy setup data. owner: " + wallet.address);
    const proxySetupData = safeInterface.encodeFunctionData("setup", [
        [wallet.address],
        1, // threshold (how many owners are required to sign a transaction -> 1)
        ZERO_ADDRESS, // delegatecall for modules (none)
        "0x", // init data for modules (none)
        ZERO_ADDRESS, // fallbackHandler
        ZERO_ADDRESS, // paymentToken (none defaults to ETH)
        0, // payment
        ZERO_ADDRESS // paymentReceiver
    ]);

    const proxyFactory = new ethers.Contract(safeProxyFactoryAddress, PROXY_FACTORY_ABI, wallet);
    const proxySetupResult = await proxyFactory.functions.createProxyWithNonce(masterSafeAddress, proxySetupData, BigNumber.from(1));
    await proxySetupResult.wait();

    console.error("Create proxy tx hash: ", proxySetupResult.hash);
    console.error("Trying to find the proxy contract address from the logs ...");

    const receipt = await provider.getTransactionReceipt(proxySetupResult.hash);
    let proxyAddress = null;
    receipt.logs.forEach(log => {
       if (log.address !== safeProxyFactoryAddress) {
           proxyAddress = log.address;
       }
    });

    console.error("Proxy contract address: ", proxyAddress);
    return proxyAddress;
}

deploySafeMaster().then(async masterSafeAddress => {
    const proxyFactoryAddress = await deploySafeProxyFactory();
    return [masterSafeAddress, proxyFactoryAddress];
}).then((addresses) => {
    const masterSafeAddress = addresses[0];
    console.error("Safe master deployed at: " + masterSafeAddress);
    const proxyFactoryAddress = addresses[1];
    console.error("Safe proxy factory deployed at: " + proxyFactoryAddress);

    return deploySafeProxy(proxyFactoryAddress, masterSafeAddress);
}).then(async (safeProxyAddress) => {
    console.error("Safe proxy deployed at: "+ safeProxyAddress + ". Sending a small amount of ETH to it...");
    const tx = await wallet.sendTransaction({
       to: safeProxyAddress,
       value: ethers.utils.parseEther("1")
    });
    console.log(safeProxyAddress);
    return tx;
}).then(async tx => {
    await tx.wait();
    console.error("Transfer of 1 eth complete:", tx);
});
