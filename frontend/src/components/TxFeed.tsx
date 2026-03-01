import { useDashboardStore } from "../store/useDashboardStore";
import type { TxSummary } from "../types";

const EXPLORER = "https://shannon-explorer.somnia.network";

function shortAddr(addr: string | null) {
	if (!addr) return <span className="text-gray-300 dark:text-gray-600 italic">deploy</span>;
	return <span title={addr}>{addr.slice(0, 6)}…{addr.slice(-4)}</span>;
}

function shortHash(hash: string) {
	if (!hash || hash.length < 12) return hash;
	return `${hash.slice(0, 10)}…${hash.slice(-6)}`;
}

const TxRow = ({ tx }: { tx: TxSummary }) => {
	const value = parseFloat(tx.value);
	return (
		<tr className="border-t border-gray-50 dark:border-gray-800 hover:bg-pink-50/60 dark:hover:bg-pink-950/20 transition-colors">
			<td className="px-5 py-3">
				<a
					href={`${EXPLORER}/tx/${tx.hash}`}
					target="_blank"
					rel="noopener noreferrer"
					className="font-mono text-xs text-pink-500 hover:text-pink-600 hover:underline"
				>
					{shortHash(tx.hash)}
				</a>
				<div className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
					block #{tx.blockNumber.toLocaleString()}
				</div>
			</td>
			<td className="px-4 py-3">
				<div className="flex items-center gap-1.5 font-mono text-xs text-gray-600 dark:text-gray-300">
					<span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
						{shortAddr(tx.from)}
					</span>
					<span className="text-gray-300 dark:text-gray-600">→</span>
					<span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
						{shortAddr(tx.to)}
					</span>
				</div>
			</td>
			<td className="px-5 py-3 text-right font-mono text-xs">
				{value === 0 ? (
					<span className="text-gray-300 dark:text-gray-600">—</span>
				) : (
					<span className="text-gray-700 dark:text-gray-300 font-semibold">
						{value < 0.0001 ? value.toExponential(2) : value.toFixed(4)}{" "}
						<span className="text-gray-400 dark:text-gray-500 font-normal">STT</span>
					</span>
				)}
			</td>
		</tr>
	);
};

const TxFeed = () => {
	const txs = useDashboardStore((s) => s.txs);

	return (
		<div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
			<div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
					<h2 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Transactions</h2>
				</div>
				<span className="text-[11px] text-gray-400 dark:text-gray-500 font-mono bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-full">
					{txs.length} txs
				</span>
			</div>

			<div className="overflow-y-auto max-h-80 scrollbar-thin">
				{txs.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-12 text-gray-300 dark:text-gray-600 gap-2">
						<span className="text-3xl">◫</span>
						<p className="text-sm">Waiting for transactions…</p>
					</div>
				) : (
					<table className="w-full text-sm">
						<thead className="sticky top-0 bg-gray-50/90 dark:bg-gray-800/90 backdrop-blur-sm">
							<tr className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest">
								<th className="px-5 py-2.5 text-left font-semibold">Hash</th>
								<th className="px-4 py-2.5 text-left font-semibold">From → To</th>
								<th className="px-5 py-2.5 text-right font-semibold">Value</th>
							</tr>
						</thead>
						<tbody>
							{txs.map((tx) => <TxRow key={tx.hash} tx={tx} />)}
						</tbody>
					</table>
				)}
			</div>
		</div>
	);
};

export default TxFeed;
