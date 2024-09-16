import Footer from "@/components/Footer";
import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="h-[calc(100vh-136px)] flex flex-col items-center justify-center">
      <SignIn />
    </div>
  );
}
