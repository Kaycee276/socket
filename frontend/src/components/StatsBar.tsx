import { useDashboardStore } from "../store/useDashboardStore";

type CardProps = {
	label: string;
	value: string;
	sub?: string;
	accent?: boolean;
};

const StatCard = ({ label, value, sub, accent }: CardProps) => (
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
		<p className={`text-2xl font-bold font-mono tabular-nums ${accent ? "text-pink-500" : "text-gray-900 dark:text-gray-100"}`}>
			{value}
		</p>
		{sub && <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">{sub}</p>}
	</div>
);

const StatsBar = () => {
	const { blockNumber, tps, gasPrice } = useDashboardStore((s) => s.stats);
	const txCount = useDashboardStore((s) => s.txs.length);

	const formattedBlock = blockNumber === "—" ? "—" : parseInt(blockNumber).toLocaleString();
	const formattedGas = gasPrice === "—" ? "—" : `${parseFloat(gasPrice).toFixed(2)} Gwei`;

	return (
		<div className="flex flex-wrap gap-4">
			<StatCard label="Block Height" value={formattedBlock} accent />
			<StatCard label="Transactions / sec" value={tps.toFixed(1)} sub="rolling 10-block avg" />
			<StatCard label="Gas Price" value={formattedGas} />
			<StatCard label="Session Txs" value={txCount.toLocaleString()} sub="tracked this session" />
		</div>
	);
};

export default StatsBar;
