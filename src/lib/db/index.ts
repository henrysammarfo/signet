import type {
  Agent,
  AgentEvent,
  CreateSignalInput,
  MarketplaceFilters,
  Purchase,
  Signal,
} from "../../../shared/db/types.ts";

export type {
  Agent,
  AgentEvent,
  CreateSignalInput,
  MarketplaceFilters,
  Purchase,
  Signal,
};

export {
  createSignal,
  ensureDefaultAgents,
  getAgentByAddress,
  getAgentStatus,
  getLeaderboard,
  getSignal,
  getTreasuryRows,
  listMarketplace,
  logEvent,
  recordPurchase,
  registerAgent,
  updateSignalAccuracy,
  updateSignalAlphaMarket,
  updateAgentXAlgoStake,
} from "../../../shared/db/client.ts";
