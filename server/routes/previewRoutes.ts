import express, { Request, Response } from "express";
import puppeteer from "puppeteer";

export function registerPreviewRoute(app: express.Express) {
  app.post("/api/preview", async (req: Request, res: Response) => {
    const { html } = req.body as { html: string };
    if (!html) return res.status(400).send("Missing html");
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    const screenshot = await page.screenshot({ encoding: "base64" });
    await browser.close();
    res.json({ success: true, image: `data:image/png;base64,${screenshot}` });
  });
}
