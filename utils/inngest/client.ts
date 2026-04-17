import { Inngest } from "inngest";

// Création du client Inngest
export const inngest = new Inngest({ id: "mon-application-saas" });

// Définition d'une tâche asynchrone d'exemple
export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    // Cette étape permet à Inngest de gérer la fiabilité
    await step.sleep("wait-a-moment", "1s");
    return { event, body: "Hello, World! Action effectuée en arrière-plan." };
  }
);
