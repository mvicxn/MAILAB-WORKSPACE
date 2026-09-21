import { EntrarView } from "@/components/EntrarView";
import { garantirSocios } from "@/lib/socios";

export default async function EntrarPage() {
  await garantirSocios();
  return <EntrarView />;
}
