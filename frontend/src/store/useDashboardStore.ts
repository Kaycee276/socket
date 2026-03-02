import { create } from "zustand";
import type { BlockSummary, TxSummary, ReactivityEvent, Stats } from "../types";

export type ConnectionStatus = "connecting" | "connected" | "disconnected";

type DashboardState = {
	// Connection
	connectionStatus: ConnectionStatus;

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
	setConnectionStatus: (status: ConnectionStatus) => void;
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

const LS_CONTRACTS_KEY = "watchedContracts";

function loadContractsFromStorage(): string[] {
	try {
		const raw = localStorage.getItem(LS_CONTRACTS_KEY);
		return raw ? (JSON.parse(raw) as string[]) : [];
	} catch {
		return [];
	}
}

function saveContractsToStorage(contracts: string[]): void {
	localStorage.setItem(LS_CONTRACTS_KEY, JSON.stringify(contracts));
}

export const useDashboardStore = create<DashboardState>((set) => ({
	connectionStatus: "connecting",
	darkMode: savedDark,
	stats: { blockNumber: "—", tps: 0, gasPrice: "—" },
	blocks: [],
	txs: [],
	events: [],
	watchedContracts: loadContractsFromStorage(),
	contractError: null,

	setConnectionStatus: (connectionStatus) => set({ connectionStatus }),

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

	initHistory: ({ blocks, txs, events, watchedContracts }) => {
		// Merge server list with localStorage so nothing is lost on server restart
		const stored = loadContractsFromStorage();
		const merged = [
			...new Set([...stored, ...watchedContracts].map((c) => c.toLowerCase())),
		];
		saveContractsToStorage(merged);
		set({ blocks, txs, events, watchedContracts: merged });
	},

	setWatchedContracts: (contracts) => {
		const unique = [...new Set(contracts.map((c) => c.toLowerCase()))];
		saveContractsToStorage(unique);
		set({ watchedContracts: unique });
	},

	setContractError: (contractError) => set({ contractError }),
}));
