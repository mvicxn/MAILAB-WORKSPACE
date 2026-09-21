import { EntrarView } from "@/components/EntrarView";
import { garantirCarlosNoBanco } from "@/lib/contratar";
import { garantirSocios } from "@/lib/socios";

export default async function EntrarPage() {
  await garantirSocios();
  await garantirCarlosNoBanco();
  return <EntrarView />;
}
