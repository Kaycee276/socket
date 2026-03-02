import { useDashboardStore } from "../store/useDashboardStore";
import type { ReactivityEvent } from "../types";

function shortHex(hex: string, chars = 12) {
	if (!hex || hex.length <= chars + 2) return hex;
	return `${hex.slice(0, chars)}…`;
}

function ts(timestamp: number) {
	return new Date(timestamp).toLocaleTimeString(undefined, { hour12: false });
}

const EventRow = ({ ev }: { ev: ReactivityEvent }) => (
	<div className="flex flex-wrap items-start gap-x-5 gap-y-1 px-5 py-2.5 border-t border-pink-950 hover:bg-pink-500/5 transition-colors font-mono text-xs">
		<span className="text-pink-900 shrink-0 tabular-nums">{ts(ev.timestamp)}</span>

		{ev.topics.length === 0 ? (
			<span className="text-pink-900 italic">no topics</span>
		) : (
			<div className="flex flex-wrap gap-x-4 gap-y-1 flex-1">
				{ev.topics.map((t, i) => (
					<span key={i}>
						<span className="text-pink-800/70">{i === 0 ? "sig" : `t${i}`}: </span>
						<span className={i === 0 ? "text-pink-400" : "text-pink-300/80"} title={t}>
							{shortHex(t, 14)}
						</span>
					</span>
				))}
				{ev.data && ev.data !== "0x" && (
					<span>
						<span className="text-pink-800/70">data: </span>
						<span className="text-pink-200/60" title={ev.data}>
							{shortHex(ev.data, 18)}
						</span>
					</span>
				)}
			</div>
		)}
	</div>
);

const EventSkeletonRow = ({ wide }: { wide?: boolean }) => (
	<div className="flex items-center gap-5 px-5 py-2.5 border-t border-pink-950">
		<div className="h-3 w-14 bg-pink-950/80 animate-pulse rounded shrink-0" />
		<div className={`h-3 ${wide ? "w-48" : "w-32"} bg-pink-950/80 animate-pulse rounded`} />
		<div className="h-3 w-24 bg-pink-950/80 animate-pulse rounded" />
	</div>
);

const EventLog = () => {
	const events = useDashboardStore((s) => s.events);
	const connectionStatus = useDashboardStore((s) => s.connectionStatus);

	const isConnecting = connectionStatus === "connecting";

	return (
		<div className="rounded-2xl shadow-sm border border-pink-950 overflow-hidden bg-pink-950">
			{/* Panel header */}
			<div
				className="px-5 py-3.5 border-b border-pink-900 flex items-center justify-between"
				style={{ background: "rgba(74,0,31,0.6)" }}
			>
				<div className="flex items-center gap-3">
					{/* Pink-themed dots */}
					<div className="flex gap-1.5">
						<span className="w-2.5 h-2.5 rounded-full bg-pink-800" />
						<span className="w-2.5 h-2.5 rounded-full bg-pink-700" />
						<span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
					</div>
					<div className="flex items-center gap-2">
						<span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
						<h2 className="font-mono text-sm text-pink-300">
							somnia_reactivity<span className="text-pink-500">.subscribe()</span>
						</h2>
					</div>
				</div>
				<span className="text-[11px] text-pink-800 font-mono">
					{isConnecting ? "—" : `${events.length} events`}
				</span>
			</div>

			{/* Event stream */}
			<div className="overflow-y-auto max-h-64 scrollbar-thin">
				{isConnecting ? (
					<>
						<EventSkeletonRow wide />
						<EventSkeletonRow />
						<EventSkeletonRow wide />
						<EventSkeletonRow />
						<EventSkeletonRow wide />
					</>
				) : events.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-10 gap-2">
						<p className="font-mono text-xs text-pink-900">
							▸ listening for on-chain events via Somnia Reactivity SDK…
						</p>
						<p className="font-mono text-xs text-pink-950/80">
							events will stream here in real-time
						</p>
					</div>
				) : (
					events.map((ev, i) => <EventRow key={`${ev.timestamp}-${i}`} ev={ev} />)
				)}
			</div>
		</div>
	);
};

export default EventLog;
