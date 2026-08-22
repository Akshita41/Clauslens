import { notFound } from "next/navigation";
import { ContractWorkspace } from "@/components/contract/workspace";
import { contracts as demoContracts } from "@/lib/mock-data";
import { getContract } from "@/lib/supabase/queries";

/**
 * Two sources for now: the worked example, which is fixtures, and real uploads,
 * which live in Postgres but have not been through a pipeline yet. Both
 * collapse into one source once Stage 2 lands.
 */
async function load(id: string) {
  const example = demoContracts.find((c) => c.id === id);
  if (example) return { contract: example, analysed: true };

  const contract = await getContract(id);
  return contract ? { contract, analysed: false } : null;
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
    <ContractWorkspace contract={found.contract} analysed={found.analysed} />
  );
}
