export type AgentType = "analyst" | "buyer";
export type AgentStatus = "active" | "idle" | "scanning";

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  address: string;
  capabilities: string[];
  price_per_signal: number;
  accuracy_score: number;
  signals_count: number;
  revenue_usdc: number;
  xalgo_staked: number;
  xalgo_yield: number;
  status: AgentStatus;
  created_at: string;
}

export interface Signal {
  id: string;
  title: string;
  category: string;
  content: string;
  content_hash?: string;
  price_usdc: number;
  embargo_until?: string;
  analyst_address: string;
  analyst_name?: string;
  purchases: number;
  accuracy_score: number;
  direction?: string;
  confidence?: number;
  time_horizon?: string;
  alpha_arcade_market_id?: string;
  created_at: string;
}

export interface Purchase {
  id: string;
  signal_id: string;
  buyer_address: string;
  tx_id?: string;
  amount_usdc: number;
  created_at: string;
}

export interface AgentEvent {
  id: string;
  event_type: string;
  message: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface CreateSignalInput {
  title: string;
  category: string;
  content: string;
  price_usdc: number;
  embargo_minutes?: number;
  analyst_address: string;
  analyst_name?: string;
  direction?: string;
  confidence?: number;
  time_horizon?: string;
  alpha_arcade_market_id?: string;
}

export interface MarketplaceFilters {
  category?: string;
  minAccuracy?: number;
  maxPrice?: number;
}
