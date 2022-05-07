import { createFile, instantiateSmartContract, stateVariableUpdate, queryChanges } from './hbarsdk'
import React, { useState } from "react";

function App()
{
    const [getVariable, funcGetVariable] = useState()
    const [setVariable, funcSetVariable] = useState()

    const createContractId = async function ()
    {
        const bytecodeFileId = await createFile()
        const settingId = await instantiateSmartContract(bytecodeFileId)
        return settingId
    }

    async function settingVariable()
    {
        const _temp = await stateVariableUpdate(createContractId, "Alive", 1111)
        funcSetVariable(_temp)
    }

    async function gettingVariable()
    {
        const _temp = await queryChanges(createContractId, "Alice")
        funcGetVariable(_temp)
    }


    return (
        <div>
            <h1>The Hedera Getter Setter</h1>
            <p> {setVariable}</p>
            <button onClick={settingVariable}> Setting the Variable </button>
            <button onClick={gettingVariable}> Getting the Variable: </button>
            <p> {getVariable} </p>
        </div>

    )
}

export default App;