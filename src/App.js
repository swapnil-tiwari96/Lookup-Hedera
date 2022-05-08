import { createFile, instantiateSmartContract, stateVariableUpdate, queryChanges } from './hbarsdk'
import React, { useState, Component } from "react";

function App()
{
    const [contractId, funcContractId] = useState()
    const [getVariable, funcGetVariable] = useState()
    const [setVariable, funcSetVariable] = useState()

    async function createContractId()
    {
        const bytecodeFileId = await createFile()
        const settingId = await instantiateSmartContract(bytecodeFileId)
        funcContractId(settingId)
    }

    async function settingVariable()
    {
        const _temp = await stateVariableUpdate(contractId, "Alice", 1111)
        funcSetVariable(_temp)
    }

    async function gettingVariable()
    {
        const _temp = await queryChanges(contractId, "Alice")
        funcGetVariable(_temp)
    }


    return (

        <div >
            <h1>The Hedera Getter Setter</h1>
            <button onClick={createContractId}> Create contract id </button>
            {/* <p> {setVariable}</p> */}
            <button onClick={settingVariable}> Setting the Variable </button>
            <button onClick={gettingVariable}> Getting the Variable: </button>
            {/* <p> {getVariable} </p> */}
        </div>




    )
}

export default App;