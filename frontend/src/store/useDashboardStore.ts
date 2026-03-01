import { create } from "zustand";
import type { BlockSummary, TxSummary, ReactivityEvent, Stats } from "../types";

type DashboardState = {
	// Connection
	connected: boolean;

	// UI
	darkMode: boolean;

	// Live chain data
	stats: Stats;
	blocks: BlockSummary[];
	txs: TxSummary[];
	events: ReactivityEvent[];

	// Contract tracker — just an address list; filtering happens in the component
	watchedContracts: string[];
	contractError: string | null;

	// Actions
	setConnected: (connected: boolean) => void;
	toggleDarkMode: () => void;
	setStats: (stats: Stats) => void;
	addBlock: (block: BlockSummary) => void;
	addTxBatch: (txs: TxSummary[]) => void;
	addEvent: (event: ReactivityEvent) => void;
	initHistory: (data: {
		blocks: BlockSummary[];
		txs: TxSummary[];
		events: ReactivityEvent[];
		watchedContracts: string[];
	}) => void;
	setWatchedContracts: (contracts: string[]) => void;
	setContractError: (msg: string | null) => void;
};

const savedDark = localStorage.getItem("darkMode") === "true";

export const useDashboardStore = create<DashboardState>((set) => ({
	connected: false,
	darkMode: savedDark,
	stats: { blockNumber: "—", tps: 0, gasPrice: "—" },
	blocks: [],
	txs: [],
	events: [],
	watchedContracts: [],
	contractError: null,

	setConnected: (connected) => set({ connected }),

	toggleDarkMode: () =>
		set((state) => {
			const next = !state.darkMode;
			localStorage.setItem("darkMode", String(next));
			return { darkMode: next };
		}),

	setStats: (stats) => set({ stats }),

	addBlock: (block) =>
		set((state) => ({ blocks: [block, ...state.blocks].slice(0, 30) })),

	addTxBatch: (newTxs) =>
		set((state) => ({ txs: [...newTxs, ...state.txs].slice(0, 50) })),

	addEvent: (event) =>
		set((state) => ({ events: [event, ...state.events].slice(0, 100) })),

	initHistory: ({ blocks, txs, events, watchedContracts }) =>
		set({ blocks, txs, events, watchedContracts }),

	setWatchedContracts: (watchedContracts) => set({ watchedContracts }),

	setContractError: (contractError) => set({ contractError }),
}));
