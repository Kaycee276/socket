import { SDK } from "@somnia-chain/reactivity";
import {
	createPublicClient,
	createWalletClient,
	http,
	webSocket,
} from "viem";
import { somniaTestnet as _somniaTestnet } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

// Extend the built-in chain definition to include the WS RPC URL.
// The Reactivity SDK internally calls webSocket() using the chain's WS URL,
// but viem's somniaTestnet only ships with an HTTP URL.
const somniaTestnet = {
	..._somniaTestnet,
	rpcUrls: {
		..._somniaTestnet.rpcUrls,
		default: {
			http: ["https://dream-rpc.somnia.network"],
			webSocket: ["wss://dream-rpc.somnia.network/ws"],
		},
	},
} as typeof _somniaTestnet;

// HTTP client — used for watchBlocks and gas price polling
export const publicClient = createPublicClient({
	chain: somniaTestnet,
	transport: http("https://dream-rpc.somnia.network"),
});

// WebSocket client — required by the Somnia Reactivity SDK
const wsPublicClient = createPublicClient({
	chain: somniaTestnet,
	transport: webSocket("wss://dream-rpc.somnia.network/ws"),
});

// Somnia Reactivity SDK — only initialised when a private key is provided
export let sdk: SDK | null = null;

const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}` | undefined;

if (PRIVATE_KEY) {
	sdk = new SDK({
		public: wsPublicClient,
		wallet: createWalletClient({
			account: privateKeyToAccount(PRIVATE_KEY),
			chain: somniaTestnet,
			transport: http("https://dream-rpc.somnia.network"),
		}),
	});
}
