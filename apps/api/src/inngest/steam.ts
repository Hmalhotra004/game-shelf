import { inngest } from "@/inngest/client";

export const steamSync = inngest.createFunction(
  { id: "steam-sync", triggers: [{ event: "steam/sync" }] },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  },
);
