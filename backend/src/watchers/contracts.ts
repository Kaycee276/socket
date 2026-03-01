import { isAddress } from "viem";

// Simple registry of contract addresses the dashboard is tracking.
// No extra SDK subscriptions — the wildcard reactivity subscription already
// captures all on-chain events; the frontend filters by these addresses.
const watched = new Set<string>();

export function watchContract(address: string): void {
	if (!isAddress(address)) throw new Error("Invalid contract address");
	watched.add(address.toLowerCase());
	console.log(`[contract] watching ${address}`);
}

export function unwatchContract(address: string): void {
	watched.delete(address.toLowerCase());
	console.log(`[contract] unwatched ${address}`);
}

export function getWatchedContracts(): string[] {
	return [...watched];
}
