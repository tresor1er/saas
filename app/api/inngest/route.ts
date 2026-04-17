import { serve } from "inngest/next";
import { inngest, helloWorld } from "@/utils/inngest/client";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    helloWorld,
  ],
});
