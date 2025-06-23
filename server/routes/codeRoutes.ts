import { Express, Request, Response } from "express";
import { runJsCode } from "../services/codeExecutor";

// ?? Code execution endpoint
export function registerCodeRoutes(app: Express) {
  app.post("/api/code/run", (req: Request, res: Response) => {
    const { code } = req.body as { code: string };
    if (typeof code !== "string") {
      return res.status(400).json({ success: false, message: "Missing code in body." });
    }
    const output = runJsCode(code);
    res.json({ success: true, output });
  });
}
