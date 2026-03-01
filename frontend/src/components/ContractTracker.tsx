import { useState, useMemo } from "react";
import { socket } from "../socket";
import { useDashboardStore } from "../store/useDashboardStore";

const EXPLORER = "https://shannon-explorer.somnia.network";

function shortAddr(addr: string) {
	return `${addr.slice(0, 8)}…${addr.slice(-6)}`;
}

function fmtTime(timestamp: number) {
	return new Date(timestamp).toLocaleTimeString(undefined, { hour12: false });
}

function isValidAddress(addr: string) {
	return /^0x[0-9a-fA-F]{40}$/.test(addr);
}

const ContractTracker = () => {
	const [input, setInput] = useState("");
	const [inputError, setInputError] = useState("");

	const watchedContracts = useDashboardStore((s) => s.watchedContracts);
	const contractError = useDashboardStore((s) => s.contractError);
	const setContractError = useDashboardStore((s) => s.setContractError);

	// Filter the global reactivity events by watched contract addresses
	const events = useDashboardStore((s) => s.events);
	const watchedSet = useMemo(
		() => new Set(watchedContracts.map((c) => c.toLowerCase())),
		[watchedContracts],
	);
	const contractEvents = useMemo(
		() =>
			events.filter(
				(ev) => ev.emitter && watchedSet.has(ev.emitter.toLowerCase()),
			),
		[events, watchedSet],
	);

	const handleWatch = () => {
		setInputError("");
		setContractError(null);

		if (!isValidAddress(input)) {
			setInputError("Enter a valid 0x contract address");
			return;
		}
		if (
			watchedContracts.map((c) => c.toLowerCase()).includes(input.toLowerCase())
		) {
			setInputError("Already watching this contract");
			return;
		}

		socket.emit("contract:watch", input);
		setInput("");
	};

	const handleUnwatch = (addr: string) => {
		setContractError(null);
		socket.emit("contract:unwatch", addr);
	};

	return (
		<div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
			{/* Header */}
			<div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
					<h2 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
						Contract Tracker
					</h2>
					<span className="text-[10px] text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/50 border border-pink-200 dark:border-pink-900 rounded-full px-2 py-0.5 font-semibold uppercase tracking-wide">
						Reactivity
					</span>
				</div>
				<span className="text-[11px] text-gray-400 dark:text-gray-500 font-mono bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-full">
					{watchedContracts.length} active
				</span>
			</div>

			{/* Address input */}
			<div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
				<div className="flex gap-2">
					<input
						value={input}
						onChange={(e) => {
							setInput(e.target.value);
							setInputError("");
							setContractError(null);
						}}
						onKeyDown={(e) => e.key === "Enter" && handleWatch()}
						placeholder="0x contract address…"
						spellCheck={false}
						className="flex-1 font-mono text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none focus:border-pink-400 dark:focus:border-pink-600 focus:bg-white dark:focus:bg-gray-750 transition-colors"
					/>
					<button
						onClick={handleWatch}
						className="bg-pink-500 hover:bg-pink-600 active:bg-pink-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
					>
						Watch
					</button>
				</div>
				{(inputError || contractError) && (
					<p className="text-red-500 text-xs mt-2 font-mono">
						{inputError || contractError}
					</p>
				)}
			</div>

			{/* Watched contract chips */}
			{watchedContracts.length > 0 && (
				<div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex flex-wrap gap-2">
					{watchedContracts.map((addr) => (
						<span
							key={addr}
							className="inline-flex items-center gap-1.5 bg-pink-50 dark:bg-pink-950/50 border border-pink-200 dark:border-pink-900 rounded-full pl-3 pr-2 py-1 text-xs font-mono text-pink-700 dark:text-pink-300"
						>
							<a
								href={`${EXPLORER}/address/${addr}`}
								target="_blank"
								rel="noopener noreferrer"
								className="hover:underline"
							>
								{shortAddr(addr)}
							</a>
							<button
								onClick={() => handleUnwatch(addr)}
								title="Stop watching"
								className="w-4 h-4 rounded-full flex items-center justify-center text-pink-400 hover:text-white hover:bg-pink-500 transition-colors text-xs"
							>
								×
							</button>
						</span>
					))}
				</div>
			)}

			{/* Event feed */}
			<div className="overflow-y-auto max-h-56 scrollbar-thin">
				{contractEvents.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-10 gap-1 text-gray-300 dark:text-gray-600">
						<p className="text-sm">
							{watchedContracts.length === 0
								? "Paste a contract address above to track its events"
								: "Waiting for events from watched contracts…"}
						</p>
					</div>
				) : (
					<table className="w-full text-xs font-mono">
						<thead className="sticky top-0 bg-gray-50/90 dark:bg-gray-800/90 backdrop-blur-sm">
							<tr className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest">
								<th className="px-5 py-2 text-left font-semibold">Time</th>
								<th className="px-3 py-2 text-left font-semibold">Contract</th>
								<th className="px-3 py-2 text-left font-semibold">Event sig</th>
								<th className="px-5 py-2 text-left font-semibold">Data</th>
							</tr>
						</thead>
						<tbody>
							{contractEvents.map((ev, i) => (
								<tr
									key={`${ev.timestamp}-${i}`}
									className="border-t border-gray-50 dark:border-gray-800 hover:bg-pink-50/60 dark:hover:bg-pink-950/20 transition-colors"
								>
									<td className="px-5 py-2.5 text-gray-400 dark:text-gray-500 tabular-nums">
										{fmtTime(ev.timestamp)}
									</td>
									<td className="px-3 py-2.5">
										<a
											href={`${EXPLORER}/address/${ev.emitter}`}
											target="_blank"
											rel="noopener noreferrer"
											className="text-pink-500 hover:underline"
										>
											{shortAddr(ev.emitter!)}
										</a>
									</td>
									<td className="px-3 py-2.5">
										{ev.topics[0] ? (
											<span
												title={ev.topics[0]}
												className="text-pink-600 dark:text-pink-400 font-semibold"
											>
												{ev.topics[0].slice(0, 12)}…
											</span>
										) : (
											<span className="text-gray-300 dark:text-gray-600 italic">
												—
											</span>
										)}
									</td>
									<td className="px-5 py-2.5 text-gray-400 dark:text-gray-500">
										{ev.data && ev.data !== "0x" ? (
											<span title={ev.data}>{ev.data.slice(0, 14)}…</span>
										) : (
											<span className="text-gray-200 dark:text-gray-700">
												—
											</span>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
		</div>
	);
};

export default ContractTracker;
