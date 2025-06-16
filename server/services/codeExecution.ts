import { VM } from 'vm2';
import { spawn } from 'child_process';
import { writeFileSync, unlinkSync, mkdtempSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

export interface ExecutionResult {
  output: string;
  error: string;
  status: 'completed' | 'error' | 'timeout';
  executionTime: number;
}

export async function executeJavaScript(code: string): Promise<ExecutionResult> {
  const startTime = Date.now();
  let output = '';
  let error = '';

  try {
    // Create a sandbox with limited capabilities
    const vm = new VM({
      timeout: 5000, // 5 second timeout
      sandbox: {
        console: {
          log: (...args: any[]) => {
            output += args.map(arg => 
              typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
            ).join(' ') + '\n';
          },
          error: (...args: any[]) => {
            error += args.map(arg => 
              typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
            ).join(' ') + '\n';
          }
        },
        setTimeout: setTimeout,
        setInterval: setInterval,
        clearTimeout: clearTimeout,
        clearInterval: clearInterval,
        Math: Math,
        Date: Date,
        JSON: JSON,
        parseInt: parseInt,
        parseFloat: parseFloat,
        isNaN: isNaN,
        isFinite: isFinite
      }
    });

    // Execute the code
    vm.run(code);

    return {
      output: output || 'Code executed successfully (no output)',
      error,
      status: error ? 'error' : 'completed',
      executionTime: Date.now() - startTime
    };
  } catch (err) {
    return {
      output,
      error: (err as Error).message,
      status: 'error',
      executionTime: Date.now() - startTime
    };
  }
}

export async function executePython(code: string): Promise<ExecutionResult> {
  const startTime = Date.now();
  
  return new Promise((resolve) => {
    let output = '';
    let error = '';

    // Create a temporary file for the Python code
    const tempDir = mkdtempSync(join(tmpdir(), 'python-exec-'));
    const tempFile = join(tempDir, 'temp.py');
    
    try {
      writeFileSync(tempFile, code);

      // Execute Python with timeout
      const python = spawn('python3', [tempFile], {
        timeout: 10000, // 10 second timeout
        stdio: ['pipe', 'pipe', 'pipe']
      });

      python.stdout.on('data', (data) => {
        output += data.toString();
      });

      python.stderr.on('data', (data) => {
        error += data.toString();
      });

      python.on('close', (code) => {
        // Clean up temp file
        try {
          unlinkSync(tempFile);
        } catch (e) {
          // Ignore cleanup errors
        }

        resolve({
          output: output || 'Code executed successfully (no output)',
          error,
          status: code === 0 && !error ? 'completed' : 'error',
          executionTime: Date.now() - startTime
        });
      });

      python.on('error', (err) => {
        // Clean up temp file
        try {
          unlinkSync(tempFile);
        } catch (e) {
          // Ignore cleanup errors
        }

        resolve({
          output,
          error: `Failed to execute Python: ${err.message}`,
          status: 'error',
          executionTime: Date.now() - startTime
        });
      });

    } catch (err) {
      resolve({
        output,
        error: `Failed to create temp file: ${(err as Error).message}`,
        status: 'error',
        executionTime: Date.now() - startTime
      });
    }
  });
}

export async function executeCode(code: string, language: string): Promise<ExecutionResult> {
  switch (language) {
    case 'javascript':
    case 'js':
      return executeJavaScript(code);
    case 'python':
    case 'py':
      return executePython(code);
    default:
      return {
        output: '',
        error: `Language '${language}' is not supported. Supported languages: JavaScript, Python`,
        status: 'error',
        executionTime: 0
      };
  }
}
