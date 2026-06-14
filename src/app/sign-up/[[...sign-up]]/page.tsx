import SignUpForm from "./SignUpForm";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; role?: string }>;
}) {
  const { error, role } = await searchParams;
  const defaultRole =
    role === "dj" ? "dj" : role === "organiser" ? "organiser" : undefined;

  return (
    <div className="flex min-h-[calc(100vh-96px)] items-center justify-center px-4">
      <SignUpForm error={error} defaultRole={defaultRole} />
    </div>
  );
}
