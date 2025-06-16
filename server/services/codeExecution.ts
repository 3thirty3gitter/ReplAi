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
  
  return new Promise((resolve) => {
    let output = '';
    let error = '';

    // Create a temporary file for the JavaScript code
    const tempDir = mkdtempSync(join(tmpdir(), 'js-exec-'));
    const tempFile = join(tempDir, 'temp.js');
    
    try {
      writeFileSync(tempFile, code);

      // Execute Node.js with timeout
      const node = spawn('node', [tempFile], {
        timeout: 10000, // 10 second timeout
        stdio: ['pipe', 'pipe', 'pipe']
      });

      node.stdout.on('data', (data) => {
        output += data.toString();
      });

      node.stderr.on('data', (data) => {
        error += data.toString();
      });

      node.on('close', (code) => {
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

      node.on('error', (err) => {
        // Clean up temp file
        try {
          unlinkSync(tempFile);
        } catch (e) {
          // Ignore cleanup errors
        }

        resolve({
          output,
          error: `Failed to execute Node.js: ${err.message}`,
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
