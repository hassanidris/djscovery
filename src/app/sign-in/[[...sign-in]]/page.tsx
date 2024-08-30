import Footer from "@/components/Footer";
import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className=" mt-48 flex flex-col items-center justify-center my-4">
      <SignIn />
      <div className=" mt-36">
        <Footer />
      </div>
    </div>
  );
}
