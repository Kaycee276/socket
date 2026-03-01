import { useEffect, useState } from "react";
import { useDashboardStore } from "../store/useDashboardStore";
import type { BlockSummary } from "../types";

const EXPLORER = "https://shannon-explorer.somnia.network";

function shortHash(hash: string) {
	if (!hash || hash.length < 12) return hash;
	return `${hash.slice(0, 10)}…${hash.slice(-6)}`;
}

function timeAgo(timestamp: number) {
	const diff = Math.floor(Date.now() / 1000) - timestamp;
	if (diff < 5) return "just now";
	if (diff < 60) return `${diff}s ago`;
	return `${Math.floor(diff / 60)}m ago`;
}

const BlockRow = ({
	block,
	isNew,
}: {
	block: BlockSummary;
	isNew: boolean;
}) => (
	<tr
		className={`border-t border-gray-50 dark:border-gray-800 hover:bg-pink-50/60 dark:hover:bg-pink-950/20 transition-colors ${isNew ? "row-flash" : ""}`}
	>
		<td className="px-5 py-3">
			<a
				href={`${EXPLORER}/block/${block.number}`}
				target="_blank"
				rel="noopener noreferrer"
				className="font-mono font-bold text-pink-500 hover:text-pink-600 hover:underline text-sm"
			>
				#{parseInt(block.number).toLocaleString()}
			</a>
			<div className="text-[11px] text-gray-400 dark:text-gray-500 font-mono mt-0.5">
				{shortHash(block.hash)}
			</div>
		</td>
		<td className="px-4 py-3 text-center">
			{block.txCount > 0 ? (
				<span className="inline-block bg-pink-50 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-900 rounded-full px-2 py-0.5 text-xs font-semibold font-mono">
					{block.txCount}
				</span>
			) : (
				<span className="text-gray-300 dark:text-gray-600 font-mono text-xs">
					0
				</span>
			)}
		</td>
		<td className="px-4 py-3 text-right font-mono text-xs text-gray-400 dark:text-gray-500">
			{parseInt(block.gasUsed).toLocaleString()}
		</td>
		<td className="px-5 py-3 text-right text-xs text-gray-400 dark:text-gray-500">
			{timeAgo(block.timestamp)}
		</td>
	</tr>
);

const BlockFeed = () => {
	const blocks = useDashboardStore((s) => s.blocks);
	const [prevTop, setPrevTop] = useState<string | null>(null);
	const newestBlock = blocks[0]?.number ?? null;
	const isNewTop = newestBlock !== null && newestBlock !== prevTop;

	useEffect(() => {
		if (newestBlock !== null) {
			queueMicrotask(() => setPrevTop(newestBlock));
		}
	}, [newestBlock]);

	return (
		<div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
			<div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
					<h2 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
						Live Blocks
					</h2>
				</div>
				<span className="text-[11px] text-gray-400 dark:text-gray-500 font-mono bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-full">
					{blocks.length} blocks
				</span>
			</div>

			<div className="overflow-y-auto max-h-80 scrollbar-thin">
				{blocks.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-12 text-gray-300 dark:text-gray-600 gap-2">
						<span className="text-3xl">◻</span>
						<p className="text-sm">Waiting for blocks…</p>
					</div>
				) : (
					<table className="w-full text-sm">
						<thead className="sticky top-0 bg-gray-50/90 dark:bg-gray-800/90 backdrop-blur-sm">
							<tr className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest">
								<th className="px-5 py-2.5 text-left font-semibold">Block</th>
								<th className="px-4 py-2.5 text-center font-semibold">Txs</th>
								<th className="px-4 py-2.5 text-right font-semibold">
									Gas used
								</th>
								<th className="px-5 py-2.5 text-right font-semibold">Age</th>
							</tr>
						</thead>
						<tbody>
							{blocks.map((b, i) => (
								<BlockRow
									key={b.number}
									block={b}
									isNew={i === 0 && isNewTop}
								/>
							))}
						</tbody>
					</table>
				)}
			</div>
		</div>
	);
};

export default BlockFeed;
