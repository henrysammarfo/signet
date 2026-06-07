import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getServerConfig } from "../config.server";
import { getAgentByAddress, getAgentStatus, getLeaderboard, getTreasuryRows } from "../db";

export const getLeaderboardData = createServerFn({ method: "GET" }).handler(async () => {
  const agents = await getLeaderboard();
  return agents.map((a, i) => ({
    id: a.id,
    rank: i + 1,
    name: a.name,
    acc: a.accuracy_score,
    signals: a.signals_count,
    revenue: a.revenue_usdc,
    xalgoYield: a.xalgo_yield,
    address: a.address,
  }));
});

export const getAgentStatusData = createServerFn({ method: "GET" }).handler(async () => {
  const { agents, events } = await getAgentStatus();
  const analyst = agents.find((a) => a.type === "analyst");
  const buyer = agents.find((a) => a.type === "buyer");

  return {
    analyst: analyst
      ? {
          status: analyst.status,
          accuracy: analyst.accuracy_score,
          signalsPublished: analyst.signals_count,
          revenue: analyst.revenue_usdc,
          address: analyst.address,
        }
      : null,
    buyer: buyer
      ? {
          status: buyer.status,
          budgetRemaining: 50,
          signalsPurchasedToday: 0,
          address: buyer.address,
        }
      : null,
    events: events.map((e) => ({
      id: e.id,
      type: e.event_type,
      message: e.message,
      created_at: e.created_at,
    })),
  };
});

export const getTreasuryData = createServerFn({ method: "GET" }).handler(async () => {
  return getTreasuryRows();
});

export const getAgentProfile = createServerFn({ method: "GET" })
  .inputValidator(z.object({ address: z.string().min(10) }))
  .handler(async ({ data }) => {
    const agent = await getAgentByAddress(data.address);
    if (!agent) return null;
    return {
      id: agent.id,
      name: agent.name,
      accuracy: agent.accuracy_score,
      signals: agent.signals_count,
      revenue: agent.revenue_usdc,
      xalgoStaked: agent.xalgo_staked,
      address: agent.address,
    };
  });

export const getAgentsConfig = createServerFn({ method: "GET" }).handler(async () => {
  const config = getServerConfig();
  return {
    analystAddress: config.analystAddress,
    buyerAddress: config.buyerAddress,
    x402ServerUrl: config.x402ServerUrl,
  };
});
