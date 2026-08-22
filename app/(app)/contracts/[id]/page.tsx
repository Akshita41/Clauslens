import { notFound } from "next/navigation";
import { ContractWorkspace } from "@/components/contract/workspace";
import { contracts } from "@/lib/mock-data";

export async function generateMetadata(props: PageProps<"/contracts/[id]">) {
  const { id } = await props.params;
  const contract = contracts.find((c) => c.id === id);
  return { title: contract?.title ?? "Contract" };
}

export default async function ContractPage(props: PageProps<"/contracts/[id]">) {
  const { id } = await props.params;
  const contract = contracts.find((c) => c.id === id);
  if (!contract) notFound();

  return <ContractWorkspace contract={contract} />;
}
