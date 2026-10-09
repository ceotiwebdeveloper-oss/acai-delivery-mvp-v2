import CustomerAccountForm from "./CustomerAccountForm";

export const instant = false;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CustomerAccountPage({ params }: PageProps) {
  const { slug } = await params;
  return <CustomerAccountForm slug={slug} />;
}
