import { h, Fragment } from "preact"
import { useState } from "preact/hooks"
import { useDebouncedCallback }  from "use-debounce"
import Editor, { DiffEditor } from "@monaco-editor/react"

import * as api from "./api"
import CompilerConfigSelect from "./CompilerConfigSelect"

const DEFAULT_C_CODE = `int add(int a, int b) {
    return a + b;
}
`

function App() {
    const [compilerConfig, setCompilerConfig] = useState(null)

    const [cCode, setCCode] = useState(DEFAULT_C_CODE)
    const [targetAsm, setTargetAsm] = useState("/* target asm */")
    const [currentAsm, setCurrentAsm] = useState("/* press 'compile!' */")

    const compile = async () => {
        const compiledAsm = await api.post("/compile", {
            compiler_config: compilerConfig,
            code: cCode,
        })

        setCurrentAsm(compiledAsm)
    }

    // Recompile automatically
    const debounced = useDebouncedCallback(compile, 1000)

    return <>
        <nav>
            decomp.me scratchpad

            <CompilerConfigSelect value={compilerConfig} onChange={id => setCompilerConfig(id)} />

            {compilerConfig !== null && <button onClick={compile}>compile!</button>}
        </nav>
        <div class="scratchpad-c">
            <Editor
                value={cCode}
                onChange={value => debounced(setCCode(value))}

                language="c"
                theme="vs-dark"
                options={{
                    minimap: {
                        enabled: false,
                    },
                }}
            />
        </div>
        <div class="scratchpad-output">
            <DiffEditor
                original={currentAsm}
                modified={targetAsm}
                onChange={value => setTargetAsm(value)}

                language="asm"
                theme="vs-dark"
                options={{
                    minimap: {
                        enabled: false,
                    },
                }}
            />
        </div>
    </>
}

export default App
