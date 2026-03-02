import { useEffect } from "react";
import { useSocketSync } from "./hooks/useSocketSync";
import { useDashboardStore } from "./store/useDashboardStore";
import StatsBar from "./components/StatsBar";
import BlockFeed from "./components/BlockFeed";
import TxFeed from "./components/TxFeed";
import EventLog from "./components/EventLog";
import ContractTracker from "./components/ContractTracker";

const App = () => {
	useSocketSync();

	const connectionStatus = useDashboardStore((s) => s.connectionStatus);
	const darkMode = useDashboardStore((s) => s.darkMode);
	const toggleDarkMode = useDashboardStore((s) => s.toggleDarkMode);

	// Apply / remove .dark on <html> whenever the store value changes
	useEffect(() => {
		document.documentElement.classList.toggle("dark", darkMode);
	}, [darkMode]);

	return (
		<div className="min-h-screen bg-(--color-surface) dark:bg-gray-950 transition-colors">
			{/* ── Header ── */}
			<header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10 transition-colors">
				<div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-9 h-9 rounded-xl bg-linear-to-br from-pink-400 to-pink-600 flex items-center justify-center shadow-sm">
							<span className="text-white font-mono font-bold text-base leading-none">
								S
							</span>
						</div>
						<div>
							<h1 className="text-base font-bold text-gray-900 dark:text-gray-100 leading-tight">
								SomniaWatch
							</h1>
							<p className="text-[11px] text-gray-400 dark:text-gray-500 leading-tight">
								Real-time on-chain explorer
							</p>
						</div>
					</div>

					<div className="flex items-center gap-3">
						<span className="hidden sm:inline-flex items-center gap-1.5 bg-pink-50 dark:bg-pink-950/50 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-900 rounded-full px-3 py-1 text-xs font-semibold">
							<span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
							Somnia Testnet · 50312
						</span>

						{connectionStatus === "connecting" && (
							<span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800">
								<span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
								Connecting…
							</span>
						)}
						{connectionStatus === "connected" && (
							<span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900">
								<span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
								Live
							</span>
						)}
						{connectionStatus === "disconnected" && (
							<span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900">
								<span className="w-1.5 h-1.5 rounded-full bg-red-400" />
								Disconnected · retrying
							</span>
						)}

						{/* Dark mode toggle */}
						<button
							onClick={toggleDarkMode}
							title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
							className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors text-sm"
						>
							{darkMode ? "☀" : "☽"}
						</button>
					</div>
				</div>
			</header>

			{/* ── Content ── */}
			<main className="max-w-7xl mx-auto px-6 py-6 space-y-5">
				<StatsBar />

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
					<BlockFeed />
					<TxFeed />
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
					<EventLog />
					<ContractTracker />
				</div>
			</main>
		</div>
	);
};

export default App;
