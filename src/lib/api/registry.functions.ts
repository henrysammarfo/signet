import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { registerAgent, getAgentByAddress } from "../db";

const registerSchema = z.object({
  name: z.string().min(1).max(64),
  type: z.enum(["analyst", "buyer"]),
  address: z.string().min(10),
  capabilities: z.array(z.string()).optional(),
  price_per_signal: z.number().min(0).optional(),
});

export const registerAgentOnPlatform = createServerFn({ method: "POST" })
  .inputValidator(registerSchema)
  .handler(async ({ data }) => {
    const agent = await registerAgent(data);
    return {
      id: agent.id,
      name: agent.name,
      type: agent.type,
      address: agent.address,
      status: agent.status,
    };
  });

export const lookupAgent = createServerFn({ method: "GET" })
  .inputValidator(z.object({ address: z.string().min(10) }))
  .handler(async ({ data }) => {
    const agent = await getAgentByAddress(data.address);
    if (!agent) return null;
    return {
      id: agent.id,
      name: agent.name,
      type: agent.type,
      address: agent.address,
      accuracy: agent.accuracy_score,
      signals: agent.signals_count,
      revenue: agent.revenue_usdc,
      status: agent.status,
    };
  });
