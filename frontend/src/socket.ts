import { io } from "socket.io-client";

// Auto-detect: use the configured env var, or fall back to the current
// hostname (works on localhost and local network without changing .env)
const BACKEND_URL =
	import.meta.env.VITE_BACKEND_URL ??
	`http://${window.location.hostname}:3001`;

export const socket = io(BACKEND_URL, {
	autoConnect: false, // connect only after listeners are registered
	reconnectionAttempts: Infinity,
	reconnectionDelay: 2000,
});
