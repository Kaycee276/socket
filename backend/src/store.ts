import type { BlockSummary, TxSummary, ReactivityEvent } from "./types.js";

export const MAX_BLOCKS = 30;
export const MAX_TXS = 50;
export const MAX_EVENTS = 100;

// Live data buffers — shared between watchers and the Socket.IO init handler
export const recentBlocks: BlockSummary[] = [];
export const recentTxs: TxSummary[] = [];
export const reactivityEvents: ReactivityEvent[] = [];

// Rolling window of (timestamp, txCount) pairs for TPS calculation
const blockTimestamps: { ts: number; txCount: number }[] = [];
const TPS_WINDOW = 10;

export function recordBlock(ts: number, txCount: number): void {
	blockTimestamps.push({ ts, txCount });
	if (blockTimestamps.length > MAX_BLOCKS) blockTimestamps.shift();
}

export function calcTps(): number {
	if (blockTimestamps.length < 2) return 0;
	const window = blockTimestamps.slice(-TPS_WINDOW);
	const totalTxs = window.slice(1).reduce((s, b) => s + b.txCount, 0);
	const timeDiff = window[window.length - 1].ts - window[0].ts;
	if (timeDiff <= 0) return 0;
	return Math.round((totalTxs / timeDiff) * 10) / 10;
}
