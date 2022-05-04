require("dotenv").config()
const
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
    } = require("@hashgraph/sdk")
const { readFileSync } = require("fs")
const operatorId = AccountId.fromString(process.env.OPERATOR_ID)
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_PVKEY)
const client = Client.forTestnet().setOperator(operatorId, operatorKey)


async function main()
{
    //Import the compiled bytecode
    const contractBytecode = readFileSync("Lookup_sol_Lookup.bin")

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


    //Instantiate the smart contract
    const contractInstantiateTx = new ContractCreateTransaction()
        .setBytecodeFileId(bytecodeFileId)
        .setGas(100000)
        .setConstructorParameters(new ContractFunctionParameters().addString("Alice").addUint256(1111))
    const contractInstantiateSubmit = await contractInstantiateTx.execute(client)
    const contractInstantiateRx = await contractInstantiateSubmit.getReceipt(client)
    const contractId = contractInstantiateRx.contractId
    const contractAddress = contractId.toSolidityAddress()
    console.log(`The contract ID is: ${contractId} \n`)
    console.log(`The contract ID in Solidity is: ${contractAddress} \n`)
    //Query the contract to check changes in state variable

    const contractQueryTx = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction("getMobileNumber", new ContractFunctionParameters().addString("Alice"))
    const contractQuerySubmit = await contractQueryTx.execute(client)
    const contractQueryRx = contractQuerySubmit.getUint256(0)
    console.log(`Here's the phone number you asked for: ${contractQueryRx} \n`)

    //Call contract function to update the state variable
    const contractTransactionTx = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction("setMobileNumber", new ContractFunctionParameters().addString("Bob").addUint256(222222))
        .setMaxTransactionFee(new Hbar(.75))
    const contractExecuteSubmit = await contractTransactionTx.execute(client)
    const contractExecuteRx = await contractExecuteSubmit.getReceipt(client)
    console.log(`Function call Status: ${contractExecuteRx.status}`)

    //Query the contract to check the changes in the state variable
    const contractQueryTx1 = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction("getMobileNumber", new ContractFunctionParameters().addString("Bob"))
    const contractQuerySubmit1 = await contractQueryTx1.execute(client)
    const contractQueryRx1 = contractQuerySubmit1.getUint256(0)
    console.log(`Here's the phone number you asked for: ${contractQueryRx1} \n`)


}

main()