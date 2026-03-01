import "dotenv/config";

// Catch WebSocket-level unhandled rejections from viem/Somnia SDK
// so a transient RPC disconnect doesn't crash the process
process.on("unhandledRejection", (reason) => {
	console.error("[process] unhandled rejection (non-fatal):", reason);
});

import { httpServer, io } from "./server.js";
import { recentBlocks, recentTxs, reactivityEvents } from "./store.js";
import "./routes.js";
import { startBlockWatcher } from "./watchers/blocks.js";
import { startReactivity } from "./watchers/reactivity.js";
import {
	watchContract,
	unwatchContract,
	getWatchedContracts,
} from "./watchers/contracts.js";

const PORT = Number(process.env.PORT) ?? 3001;

function buildInitPayload() {
	return {
		blocks: recentBlocks.slice(-10).reverse(),
		txs: recentTxs.slice(0, 20),
		events: reactivityEvents.slice(0, 20),
		watchedContracts: getWatchedContracts(),
	};
}

io.on("connection", (socket) => {
	console.log(`[socket] connected: ${socket.id}`);

	socket.emit("init", buildInitPayload());

	// Client may re-request history (e.g. React StrictMode remount)
	socket.on("request-init", () => {
		socket.emit("init", buildInitPayload());
	});

	// Add a contract to the tracked list (synchronous — no extra SDK connection)
	socket.on("contract:watch", (address: string) => {
		try {
			watchContract(address);
			io.emit("contract:watching", getWatchedContracts());
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err);
			socket.emit("contract:error", msg);
		}
	});

	// Remove a contract from the tracked list
	socket.on("contract:unwatch", (address: string) => {
		unwatchContract(address);
		io.emit("contract:watching", getWatchedContracts());
	});

	socket.on("disconnect", () => {
		console.log(`[socket] disconnected: ${socket.id}`);
	});
});

startBlockWatcher();
startReactivity();

httpServer.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
