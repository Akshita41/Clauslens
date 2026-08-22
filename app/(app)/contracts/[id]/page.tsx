import { notFound } from "next/navigation";
import { ContractWorkspace } from "@/components/contract/workspace";
import { contracts as demoContracts, clauses as demoClauses } from "@/lib/mock-data";
import { getContract, listClauses } from "@/lib/supabase/queries";

/**
 * Two sources for now: the worked example, which is fixtures, and real uploads,
 * whose clauses come from Postgres. They collapse into one source once the
 * extraction stage lands.
 */
async function load(id: string) {
  const example = demoContracts.find((c) => c.id === id);
  if (example) {
    return { contract: example, clauses: demoClauses, demo: true };
  }

  const contract = await getContract(id);
  if (!contract) return null;

  return { contract, clauses: await listClauses(id), demo: false };
}

export async function generateMetadata(props: PageProps<"/contracts/[id]">) {
  const { id } = await props.params;
  const found = await load(id);
  return { title: found?.contract.title ?? "Contract" };
}

export default async function ContractPage(props: PageProps<"/contracts/[id]">) {
  const { id } = await props.params;
  const found = await load(id);
  if (!found) notFound();

  return (
    <ContractWorkspace
      contract={found.contract}
      clauses={found.clauses}
      demo={found.demo}
    />
  );
}
