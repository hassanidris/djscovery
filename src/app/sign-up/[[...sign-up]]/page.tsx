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
            afterSignUpUrl="/"
            signInUrl="/sign-in"
            // socialButtons={[
            //   { provider: "facebook", text: "Sign up with Google" },
            // ]}
          />
          {/* <SignUp
            afterSignUpUrl="/complete-profile" // You can redirect DJs to complete more profile details
            appearance={{
              elements: {
                roleField: {
                  label: "Are you a DJ or a Fan?",
                  options: [
                    { label: "DJ", value: "dj" },
                    { label: "Fan", value: "fan" },
                  ],
                },
              },
            }}
          /> */}
        </div>
      </div>
      <Footer />
    </>
  );
}
