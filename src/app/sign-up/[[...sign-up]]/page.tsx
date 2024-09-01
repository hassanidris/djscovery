// import Footer from "@/components/Footer";
// import { SignUp } from "@clerk/nextjs";

// export default function Page() {
//   return (
//     <div className=" mt-48 flex flex-col items-center justify-center my-4">
//       <SignUp />
//       <div className=" mt-36">
//         <Footer />
//       </div>
//     </div>
//   );
// }

"use client";

import Footer from "@/components/Footer";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  socialButtons: {
    provider: "string";
    text: "string";
  }
  [];

  return (
    <>
      <div className="h-[calc(100vh-96px)] flex items-center justify-center pt-24">
        <div>
          <h1 className="text-2xl font-bold mb-6 text-white">Sign Up</h1>
          <SignUp
            path="/sign-up"
            routing="path"
            appearance={{
              elements: {
                card: "shadow-none",
                socialButtonsIconButton: "bg-white text-white",
              },
            }}
            afterSignUpUrl="/select-role"
            signInUrl="/sign-in"
            // socialButtons={[
            //   { provider: "facebook", text: "Sign up with Google" },
            // ]}
          />
        </div>
      </div>
      <Footer />
    </>
  );
}
