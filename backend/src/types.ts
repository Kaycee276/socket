export type BlockSummary = {
	number: string;
	hash: string;
	txCount: number;
	timestamp: number;
	gasUsed: string;
};

export type TxSummary = {
	hash: string;
	from: string;
	to: string | null;
	value: string;
	blockNumber: number;
};

export type ReactivityEvent = {
	emitter?: string; // contract address that emitted the event
	topics: string[];
	data: string;
	timestamp: number;
};

export type ContractEvent = {
	contract: string;
	topics: string[];
	data: string;
	timestamp: number;
};
