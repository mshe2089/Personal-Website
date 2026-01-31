import { useState } from 'react';
import { executeRustCode } from '../api/RustApi';

/**
 * Controller Layer: useRustPlayground Hook
 * Manages state and execution logic for the Rust Playground.
 */
export const useRustPlayground = () => {
    const [code, setCode] = useState('fn main() {\n    println!("Hello from the Lab!");\n}');
    const [output, setOutput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('IDLE');

    const execute = async () => {
        setIsLoading(true);
        setStatus('COMPILING');
        setOutput('>> COMPILING...\n');

        try {
            const data = await executeRustCode(code);

            if (data.success) {
                setOutput(`>> COMPILATION SUCCESSFUL\n\n${data.stdout}`);
                setStatus('SUCCESS');
            } else {
                setOutput(`>> ERROR\n\n${data.stderr}`);
                setStatus('ERROR');
            }
        } catch (error) {
            setOutput(`>> CONNECTION ERROR: Could not reach Rust Node.\n${error.message}`);
            setStatus('ERROR');
        } finally {
            setIsLoading(false);
        }
    };

    return {
        code,
        setCode,
        output,
        isLoading,
        status,
        execute
    };
};
