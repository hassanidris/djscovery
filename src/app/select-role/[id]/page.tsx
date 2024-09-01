"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";

export default function SelectRolePage() {
  const [role, setRole] = useState<string | null>(null);
  const { user } = useUser();
  const router = useRouter();

  const handleSubmit = async () => {
    if (!role || !user) return;

    try {
      // Make an API call to store the user's role in the database
      const response = await fetch("/api/save-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          role,
        }),
      });

      if (response.ok) {
        // Redirect to home page after saving the role
        router.push("/");
      } else {
        console.error("Failed to save role");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <>
      <div className="h-[calc(100vh-96px)] flex items-center justify-center">
        <div className=" bg-white/5 border border-white/60 p-10 space-y-8 rounded-lg">
          <h1 className="text-2xl font-bold mb-6 text-white">
            Select Your Role
          </h1>
          <div className="mb-4 text-lg flex justify-center items-center gap-8">
            <label className="flex items-center">
              <input
                type="radio"
                name="role"
                value="fan"
                checked={role === "fan"}
                onChange={(e) => setRole(e.target.value)}
                className="mr-2 text-xl"
              />
              <span className="text-white text-xl">Fan</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="role"
                value="dj"
                checked={role === "dj"}
                onChange={(e) => setRole(e.target.value)}
                className="mr-2"
              />
              <span className="text-white text-xl">DJ</span>
            </label>
          </div>
          <button
            onClick={handleSubmit}
            className="w-full bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 transition-colors duration-300"
          >
            Continue
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}
