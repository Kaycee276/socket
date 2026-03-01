import { app } from "./server.js";

app.get("/health", (_req, res) => {
	res.json({ status: "ok" });
});
