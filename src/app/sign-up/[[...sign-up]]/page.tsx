import Footer from "@/components/Footer";
import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className=" mt-48 flex flex-col items-center justify-center my-4">
      <SignUp />
      <div className=" mt-36">
        <Footer />
      </div>
    </div>
  );
}
