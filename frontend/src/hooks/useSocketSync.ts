import { useEffect } from "react";
import { socket } from "../socket";
import { useDashboardStore } from "../store/useDashboardStore";
import type { BlockSummary, TxSummary, ReactivityEvent, Stats } from "../types";

export function useSocketSync() {
	const setConnected = useDashboardStore((s) => s.setConnected);
	const setStats = useDashboardStore((s) => s.setStats);
	const addBlock = useDashboardStore((s) => s.addBlock);
	const addTxBatch = useDashboardStore((s) => s.addTxBatch);
	const addEvent = useDashboardStore((s) => s.addEvent);
	const initHistory = useDashboardStore((s) => s.initHistory);
	const setWatchedContracts = useDashboardStore((s) => s.setWatchedContracts);
	const setContractError = useDashboardStore((s) => s.setContractError);

	useEffect(() => {
		socket.on("connect", () => setConnected(true));
		socket.on("disconnect", () => setConnected(false));
		socket.on(
			"init",
			(data: {
				blocks: BlockSummary[];
				txs: TxSummary[];
				events: ReactivityEvent[];
				watchedContracts: string[];
			}) => initHistory(data),
		);
		socket.on("stats", (data: Stats) => setStats(data));
		socket.on("block:new", (block: BlockSummary) => addBlock(block));
		socket.on("tx:batch", (txs: TxSummary[]) => addTxBatch(txs));
		socket.on("reactivity:event", (event: ReactivityEvent) => addEvent(event));
		socket.on("contract:watching", (contracts: string[]) =>
			setWatchedContracts(contracts),
		);
		socket.on("contract:error", (msg: string) => setContractError(msg));

		if (socket.connected) {
			socket.emit("request-init");
			setConnected(true);
		} else {
			socket.connect();
		}

		return () => {
			socket.off("connect");
			socket.off("disconnect");
			socket.off("init");
			socket.off("stats");
			socket.off("block:new");
			socket.off("tx:batch");
			socket.off("reactivity:event");
			socket.off("contract:watching");
			socket.off("contract:error");
		};
	}, []);
}
