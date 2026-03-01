import {
	formatEther,
	formatGwei,
	type Block,
	type Transaction,
} from "viem";
import { publicClient } from "../clients.js";
import { io } from "../server.js";
import {
	recentBlocks,
	recentTxs,
	MAX_BLOCKS,
	MAX_TXS,
	recordBlock,
	calcTps,
} from "../store.js";
import type { BlockSummary, TxSummary } from "../types.js";

let latestGasPrice = "0";

async function refreshGasPrice(): Promise<void> {
	try {
		latestGasPrice = formatGwei(await publicClient.getGasPrice());
	} catch {
		// keep previous value on error
	}
}

export function startBlockWatcher(): void {
	// Prime the gas price before the first block arrives
	refreshGasPrice();

	publicClient.watchBlocks({
		includeTransactions: true,
		onBlock: (block: Block<bigint, true>) => {
			const txs = Array.isArray(block.transactions)
				? (block.transactions as Transaction[]).filter(
						(t) => typeof t === "object",
					)
				: [];

			const txCount = txs.length;

			const blockSummary: BlockSummary = {
				number: (block.number ?? 0n).toString(),
				hash: block.hash ?? "",
				txCount,
				timestamp: Number(block.timestamp),
				gasUsed: (block.gasUsed ?? 0n).toString(),
			};

			recentBlocks.push(blockSummary);
			if (recentBlocks.length > MAX_BLOCKS) recentBlocks.shift();

			recordBlock(Number(block.timestamp), txCount);

			const newTxs: TxSummary[] = txs.map((tx) => ({
				hash: tx.hash,
				from: tx.from,
				to: tx.to ?? null,
				value: formatEther(tx.value ?? 0n),
				blockNumber: Number(block.number ?? 0n),
			}));
			recentTxs.unshift(...newTxs);
			if (recentTxs.length > MAX_TXS) recentTxs.length = MAX_TXS;

			refreshGasPrice();

			const tps = calcTps();

			io.emit("block:new", blockSummary);
			io.emit("stats", {
				blockNumber: blockSummary.number,
				tps,
				gasPrice: latestGasPrice,
			});
			if (newTxs.length > 0) io.emit("tx:batch", newTxs.slice(0, 10));

			console.log(
				`[block] #${blockSummary.number} | txs: ${txCount} | tps: ${tps}`,
			);
		},
		onError: (err) => {
			console.error("[watchBlocks]", err.message);
		},
	});
}
