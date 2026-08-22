import { notFound } from "next/navigation";
import { ContractWorkspace } from "@/components/contract/workspace";
import {
  contracts as demoContracts,
  clauses as demoClauses,
  extractions as demoExtractions,
} from "@/lib/mock-data";
import { getContract, listClauses, listExtractions } from "@/lib/supabase/queries";

/**
 * Two sources for now: the worked example, which is fixtures, and real uploads,
 * whose clauses and extractions come from Postgres.
 */
async function load(id: string) {
  const example = demoContracts.find((c) => c.id === id);
  if (example) {
    return {
      contract: example,
      clauses: demoClauses,
      extractions: demoExtractions,
      demo: true,
    };
  }

  const contract = await getContract(id);
  if (!contract) return null;

  const [clauses, extractions] = await Promise.all([
    listClauses(id),
    listExtractions(id),
  ]);

  return { contract, clauses, extractions, demo: false };
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
      extractions={found.extractions}
      demo={found.demo}
    />
  );
}
