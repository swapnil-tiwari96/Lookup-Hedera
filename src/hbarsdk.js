//require("dotenv").config()
import
{
    AccountId,
    PrivateKey,
    Client,
    FileCreateTransaction,
    ContractCreateTransaction,
    ContractFunctionParameters,
    ContractExecuteTransaction,
    ContractCallQuery,
    Hbar
} from "@hashgraph/sdk"


let client;
async function createFile()
{
    const operatorId = AccountId.fromString("0.0.34194909")
    const operatorKey = PrivateKey.fromString("302e020100300506032b657004220420f8a94c0825d5f1391f9874d71726897c580ab493bfb8bbd21a5385381f69ce78")
    client = Client.forTestnet().setOperator(operatorId, operatorKey)
    //Import the compiled bytecode
    const helloHedera = require("./Lookup.json")
    const contractBytecode = helloHedera.data.bytecode.object;
    //Create a file on Hedera and store the bytecode
    const fileCreateTx = new FileCreateTransaction()
        .setContents(contractBytecode)
        .setKeys([operatorKey])
        .setMaxTransactionFee(new Hbar(0.75))
        .freezeWith(client)
    const fileCreateSign = await fileCreateTx.sign(operatorKey)
    const fileSubmitTx = await fileCreateSign.execute(client)
    const fileCreateReceipt = await fileSubmitTx.getReceipt(client)
    const bytecodeFileId = fileCreateReceipt.fileId
    console.log(`The bytecode file ID is ${bytecodeFileId} \n`)
    return bytecodeFileId
}


//Instantiate the smart contract
async function instantiateSmartContract(bytecodeFileId)
{

    const contractInstantiateTx = new ContractCreateTransaction()
        .setBytecodeFileId(bytecodeFileId)
        .setGas(100000)
        .setConstructorParameters(new ContractFunctionParameters().addString("Bob").addUint256(2222))
    const contractInstantiateSubmit = await contractInstantiateTx.execute(client)
    const contractInstantiateRx = await contractInstantiateSubmit.getReceipt(client)
    const contractId = contractInstantiateRx.contractId
    //const contractAddress = contractId.toSolidityAddress()
    console.log(`The contract ID is: ${contractId} \n`)
    //console.log(`The contract ID in Solidity is: ${contractAddress} \n`)
    return contractId
}

//Query the state variables
async function queryChanges(_contractId, _name)
{
    const contractQueryTx = new ContractCallQuery()
        .setContractId(_contractId)
        .setGas(100000)
        .setFunction("getMobileNumber", new ContractFunctionParameters().addString(_name))
    const contractQuerySubmit = await contractQueryTx.execute(client)
    const contractQueryRx = contractQuerySubmit.getUint256(0)
    console.log(`Here's the phone number you asked for: ${contractQueryRx} \n`)
    return contractQueryRx
}


//Call contract function to update the state variable
async function stateVariableUpdate(_contractId, _name, _phone)
{
    const contractTransactionTx = new ContractExecuteTransaction()
        .setContractId(_contractId)
        .setGas(100000)
        .setFunction("setMobileNumber", new ContractFunctionParameters().addString(_name).addUint256(_phone))
        .setMaxTransactionFee(new Hbar(.75))
    const contractExecuteSubmit = await contractTransactionTx.execute(client)
    const contractExecuteRx = await contractExecuteSubmit.getReceipt(client)
    console.log(`Function call Status: ${contractExecuteRx.status}`)
    return contractExecuteRx
}


export { createFile, instantiateSmartContract, stateVariableUpdate, queryChanges }