import { VM, VMScript } from "vm2";

export function runJsCode(code: string): string {
  const vm = new VM({
    timeout: 1000,
    sandbox: {}
  });
  try {
    const script = new VMScript(code);
    const result = vm.run(script);
    return result === undefined ? "" : String(result);
  } catch (err: any) {
    return `Error: ${err.message}`;
  }
}
