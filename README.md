# SomniaWatch

A real-time on-chain activity dashboard built on the **Somnia Testnet** using the **Somnia Reactivity SDK**. Every block, transaction, and smart contract event is pushed to the browser the instant it happens on-chain — no polling, no page refreshes.

Built for the **Somnia Reactivity Mini Hackathon** (Feb 25 – Mar 20, 2026).

---

## How Reactivity is Used

The core requirement of this hackathon is a meaningful integration of the Somnia Reactivity SDK. SomniaWatch uses it in two distinct ways:

### 1. Wildcard Off-Chain Subscription

On startup, the backend opens a persistent WebSocket subscription to the entire Somnia network:

```ts
await sdk.subscribe({
  ethCalls: [],
  onData: (data) => {
    // fires for every event emitted by any contract on Somnia
    io.emit("reactivity:event", {
      emitter: data.result.address,
      topics:  data.result.topics,
      data:    data.result.data,
      timestamp: Date.now(),
    });
  },
});
```

This single subscription captures **every on-chain event from every contract** in real time and streams it to all connected browsers via Socket.IO. It is the backbone of both the Reactivity Event Log and the Contract Tracker.

### 2. Contract Tracker (Filtered View)

Users can paste any contract address into the Contract Tracker panel. Because every event already includes the emitter address (`data.result.address` from the Ethereum log format), the frontend simply filters the live event stream by the watched addresses using `useMemo`. No additional SDK subscriptions are created — the same single WebSocket connection serves everything.

This demonstrates that the Reactivity SDK delivers **complete, emitter-tagged event data**, not just raw bytes, making it suitable as a universal event bus for reactive dApps.

---

## Features

| Feature | Description |
|---|---|
| **Live Blocks** | Every new block displayed in real time with block number, tx count, gas used, and age |
| **Transaction Feed** | Stream of recent transactions with sender, receiver, STT value, and explorer links |
| **Network Stats** | Live block height, TPS (10-block rolling average), gas price, and session tx count |
| **Reactivity Event Log** | Raw on-chain events from the Somnia Reactivity SDK shown in a terminal-style panel |
| **Contract Tracker** | Watch specific contracts — their events are filtered from the live stream and displayed separately |
| **Dark Mode** | Full dark/light toggle, persisted to `localStorage` |
| **History on Connect** | New browser tabs immediately receive the last 10 blocks, 20 transactions, and 20 events |
| **Auto-Reconnect** | Both the block watcher and the Reactivity subscription reconnect automatically on failure |

---

## Architecture

```
Somnia Blockchain (Chain ID 50312)
        │
        ├─── viem watchBlocks() ──────────────────────────────┐
        │    (HTTP polling, ~1 block/sec)                     │
        │                                                     ▼
        └─── Somnia Reactivity SDK subscribe() ──────── Backend (Node.js)
             (WebSocket push, event-driven)              ├── in-memory buffers
                                                         │   (blocks, txs, events)
                                                         │
                                                         └── Socket.IO
                                                                │
                                                         ┌──────┴──────┐
                                                      Browser A    Browser B
                                                      (Zustand)    (Zustand)
```

There are two independent data pipelines:

- **`viem.watchBlocks`** polls the HTTP RPC and fires on every new block. It extracts full transaction objects, tracks gas usage, and calculates TPS.
- **`sdk.subscribe()`** maintains a persistent WebSocket to Somnia's Reactivity infrastructure and receives push notifications for every contract event on the chain without polling.

Both pipelines write to in-memory buffers on the backend and emit Socket.IO events to all connected clients.

---

## Tech Stack

### Backend
| Package | Version | Purpose |
|---|---|---|
| `@somnia-chain/reactivity` | ^0.1.10 | Somnia Reactivity SDK — off-chain event subscriptions |
| `viem` | ^2.46.3 | Ethereum client — block watching, gas price, address utilities |
| `socket.io` | ^4.8.1 | Real-time WebSocket bridge to the frontend |
| `express` | ^4.21.2 | HTTP server and REST health endpoint |
| `dotenv` | ^16.5.0 | Environment variable loading |
| `tsx` | ^4.19.3 | TypeScript execution for development |

### Frontend
| Package | Version | Purpose |
|---|---|---|
| `react` | ^19.2.0 | UI framework |
| `zustand` | ^5.0.11 | Global state management |
| `socket.io-client` | ^4.8.3 | Real-time connection to the backend |
| `tailwindcss` | ^4.2.1 | Utility-first CSS with dark mode support |
| `vite` | ^7.3.1 | Build tool and dev server |

---

## Project Structure

```
socket/
├── backend/
│   ├── src/
│   │   ├── index.ts          # Entry point — Socket.IO handlers, server startup
│   │   ├── server.ts         # Express app + Socket.IO instance
│   │   ├── clients.ts        # viem HTTP/WS clients + Somnia Reactivity SDK init
│   │   ├── store.ts          # In-memory buffers (blocks, txs, events) + TPS calc
│   │   ├── routes.ts         # REST routes (GET /health)
│   │   ├── types.ts          # Shared TypeScript types
│   │   └── watchers/
│   │       ├── blocks.ts     # viem watchBlocks → emits block:new, stats, tx:batch
│   │       ├── reactivity.ts # SDK subscribe() → emits reactivity:event
│   │       └── contracts.ts  # Watched contract address registry
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── App.tsx                        # Root layout + dark mode class management
    │   ├── socket.ts                      # Socket.IO client singleton (autoConnect: false)
    │   ├── types.ts                       # Shared TypeScript types
    │   ├── store/
    │   │   └── useDashboardStore.ts       # Zustand store (all state + actions)
    │   ├── hooks/
    │   │   └── useSocketSync.ts           # Wires socket events → store actions
    │   └── components/
    │       ├── StatsBar.tsx               # Block height, TPS, gas price, tx count cards
    │       ├── BlockFeed.tsx              # Scrollable live block table
    │       ├── TxFeed.tsx                 # Scrollable live transaction table
    │       ├── EventLog.tsx               # Terminal-style Reactivity event stream
    │       └── ContractTracker.tsx        # Per-contract event filter panel
    └── package.json
```

---

## Getting Started

### Prerequisites

- Node.js v20 or higher
- An Ethereum wallet private key (for the Somnia Reactivity SDK)
- STT test tokens — get them from the [Somnia faucet](https://testnet.somnia.network) or the [Discord](https://discord.gg/somnia)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd socket

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Configure the backend

Copy the example env file and fill in your values:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=3001
CLIENT_URL=http://localhost:5173
PRIVATE_KEY=0xYourPrivateKeyHere
```

> **Note:** The private key is used to authenticate the Reactivity SDK subscription on the Somnia network. Use a dedicated wallet — do not use your main wallet. The key is never sent to the frontend.

### 3. Run the development servers

Open two terminals:

```bash
# Terminal 1 — Backend
cd backend
npm run dev
```

```bash
# Terminal 2 — Frontend
cd frontend
npm run dev
```

Then open **http://localhost:5173** in your browser.

You should see:
```
Server running on http://0.0.0.0:3001
[reactivity] subscribed, id: 0x...
[block] #320165037 | txs: 1 | tps: 0.3
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | Port the backend HTTP/Socket.IO server listens on |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origin (your frontend URL) |
| `PRIVATE_KEY` | — | Wallet private key for the Somnia Reactivity SDK |

### Frontend (`frontend/.env`)

| Variable | Default | Description |
|---|---|---|
| `VITE_BACKEND_URL` | auto-detected | Backend URL. Defaults to `http://<current hostname>:3001`, so it works on both localhost and local network without configuration |

---

## Socket.IO Event Reference

### Server → Client

| Event | Payload | Description |
|---|---|---|
| `init` | `{ blocks, txs, events, watchedContracts }` | Sent on connection — last 10 blocks, 20 txs, 20 events |
| `block:new` | `BlockSummary` | New block mined |
| `stats` | `{ blockNumber, tps, gasPrice }` | Network stats, emitted every block |
| `tx:batch` | `TxSummary[]` | Up to 10 transactions from the latest block |
| `reactivity:event` | `ReactivityEvent` | On-chain event from the Reactivity SDK |
| `contract:watching` | `string[]` | Updated list of watched contract addresses |
| `contract:error` | `string` | Error message from a failed contract:watch |

### Client → Server

| Event | Payload | Description |
|---|---|---|
| `request-init` | — | Re-request history (used on React StrictMode remounts) |
| `contract:watch` | `string` (address) | Start filtering events for a contract |
| `contract:unwatch` | `string` (address) | Stop filtering events for a contract |

---

## Network Details

| Property | Value |
|---|---|
| Network | Somnia Testnet (Shannon) |
| Chain ID | 50312 |
| HTTP RPC | `https://dream-rpc.somnia.network` |
| WebSocket RPC | `wss://dream-rpc.somnia.network/ws` |
| Explorer | https://shannon-explorer.somnia.network |
| Native Token | STT |
| Faucet | https://testnet.somnia.network |

---

## Key Design Decisions

**Why `autoConnect: false` on the socket client?**
The Socket.IO client is instantiated at module import time. With `autoConnect: true`, the server would emit `init` before React had registered the event listener, causing historical data to be lost. Setting `autoConnect: false` ensures all listeners are registered before the connection is opened.

**Why one Reactivity subscription instead of one per contract?**
Each call to `sdk.subscribe()` opens a new WebSocket connection to the Somnia RPC. Multiple concurrent connections are fragile and can hit server-side limits. Since the wildcard subscription already receives every on-chain event — and the raw Ethereum log format includes the emitter `address` — contract filtering is done client-side in a `useMemo` at zero extra cost.

**Why two viem clients (`publicClient` and `wsPublicClient`)?**
`watchBlocks` works over HTTP (polling) and is more stable for high-frequency block data. The Reactivity SDK internally calls `webSocket()` using the chain definition's WebSocket URL, so it requires a client configured with a WebSocket transport. The viem built-in `somniaTestnet` chain definition only includes an HTTP URL, so the chain is extended in `clients.ts` to add the WebSocket endpoint.

**Why is the Reactivity subscription retry loop synchronous?**
`sdk.subscribe()` can throw if the WebSocket connection drops. Wrapping it in an async retry loop that calls itself after 5 seconds means the subscription self-heals without crashing the Node process. A global `process.on("unhandledRejection")` handler provides a final safety net for any errors that escape the retry boundary.

---

## Somnia Reactivity SDK Reference

```ts
import { SDK } from "@somnia-chain/reactivity";

const sdk = new SDK({
  public: createPublicClient({              // Must use WebSocket transport
    chain: somniaTestnet,
    transport: webSocket("wss://dream-rpc.somnia.network/ws"),
  }),
  wallet: createWalletClient({             // HTTP transport is fine for wallet
    account: privateKeyToAccount(PRIVATE_KEY),
    chain: somniaTestnet,
    transport: http("https://dream-rpc.somnia.network"),
  }),
});

// Off-chain subscription — receives push notifications for all on-chain events
const result = await sdk.subscribe({
  ethCalls: [],                            // optional batched eth_call results
  onData: (data) => {
    data.result.address  // emitting contract
    data.result.topics   // [eventSig, ...indexed params]
    data.result.data     // ABI-encoded non-indexed params
  },
  onError: (err) => { /* handle */ },
  // eventContractSources: ["0x..."],      // filter to specific contracts
  // topicOverrides: ["0x..."],            // filter to specific event signatures
});

// Unsubscribe
await result.unsubscribe();
```

---

## License

MIT
