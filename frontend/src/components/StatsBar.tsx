import { useDashboardStore } from "../store/useDashboardStore";

type CardProps = {
	label: string;
	value: string;
	sub?: string;
	accent?: boolean;
	loading?: boolean;
};

const StatCard = ({ label, value, sub, accent, loading }: CardProps) => (
	<div
		className={`bg-white dark:bg-gray-900 rounded-2xl p-5 flex-1 shadow-sm border transition-shadow hover:shadow-md ${
			accent
				? "border-pink-200 dark:border-pink-900 border-l-[3px] border-l-pink-500"
				: "border-gray-100 dark:border-gray-800"
		}`}
	>
		<p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
			{label}
		</p>
		{loading ? (
			<>
				<div className="h-7 w-28 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />
				{sub && <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 animate-pulse rounded mt-2" />}
			</>
		) : (
			<>
				<p className={`text-2xl font-bold font-mono tabular-nums ${accent ? "text-pink-500" : "text-gray-900 dark:text-gray-100"}`}>
					{value}
				</p>
				{sub && <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">{sub}</p>}
			</>
		)}
	</div>
);

const StatsBar = () => {
	const { blockNumber, tps, gasPrice } = useDashboardStore((s) => s.stats);
	const txCount = useDashboardStore((s) => s.txs.length);
	const connectionStatus = useDashboardStore((s) => s.connectionStatus);

	const loading = connectionStatus === "connecting";
	const formattedBlock = blockNumber === "—" ? "—" : parseInt(blockNumber).toLocaleString();
	const formattedGas = gasPrice === "—" ? "—" : `${parseFloat(gasPrice).toFixed(2)} Gwei`;

	return (
		<div className="flex flex-wrap gap-4">
			<StatCard label="Block Height" value={formattedBlock} accent loading={loading} />
			<StatCard label="Transactions / sec" value={tps.toFixed(1)} sub="rolling 10-block avg" loading={loading} />
			<StatCard label="Gas Price" value={formattedGas} loading={loading} />
			<StatCard label="Session Txs" value={txCount.toLocaleString()} sub="tracked this session" loading={loading} />
		</div>
	);
};

export default StatsBar;
