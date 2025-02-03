import { Button } from "@/components/ui/button";
import { HydrateClient } from "@/trpc/server";

export default async function Home() {
  return (
    <HydrateClient>
      <main>
        <Button>Click me</Button>
      </main>
    </HydrateClient>
  );
}
