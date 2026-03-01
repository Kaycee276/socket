import { sdk } from "../clients.js";
import { io } from "../server.js";
import { reactivityEvents, MAX_EVENTS } from "../store.js";
import type { ReactivityEvent } from "../types.js";

const RETRY_DELAY_MS = 5_000;

async function attempt(): Promise<void> {
	if (!sdk) {
		console.log("[reactivity] No PRIVATE_KEY — skipping SDK subscription");
		return;
	}

	const result = await sdk.subscribe({
		ethCalls: [],
		onData: (data: any) => {
			// The raw Ethereum log includes `address` (the emitting contract)
			// alongside `topics` and `data` — extract all three
			const event: ReactivityEvent = {
				emitter: data?.result?.address ?? undefined,
				topics: data?.result?.topics ?? [],
				data: data?.result?.data ?? "0x",
				timestamp: Date.now(),
			};

			reactivityEvents.unshift(event);
			if (reactivityEvents.length > MAX_EVENTS)
				reactivityEvents.length = MAX_EVENTS;

			io.emit("reactivity:event", event);
			console.log(
				"[reactivity] event:",
				event.topics[0]?.slice(0, 10) ?? "no-topic",
				event.emitter ? `from ${event.emitter.slice(0, 10)}` : "",
			);
		},
		onError: (err) => {
			console.error("[reactivity] subscription error:", err.message ?? err);
		},
	});

	if (result instanceof Error) {
		throw result;
	}

	console.log("[reactivity] subscribed, id:", result.subscriptionId);
}

export function startReactivity(): void {
	const run = () => {
		attempt().catch((err: unknown) => {
			const msg = err instanceof Error ? err.message : String(err);
			console.error(`[reactivity] failed, retrying in ${RETRY_DELAY_MS / 1000}s:`, msg);
			setTimeout(run, RETRY_DELAY_MS);
		});
	};

	run();
}
