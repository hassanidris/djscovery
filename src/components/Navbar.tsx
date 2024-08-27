import Link from "next/link";
import Image from "next/image";
import {
  ClerkLoaded,
  ClerkLoading,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

const Navbar = () => {
  return (
    <div className="fixed top-0 z-50 py-8 w-full bg-black/80">
      <div className=" flex items-center justify-between py-1 w-full px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
        {/* LEFT */}
        <div className="md:hidden lg:block w-[10%]">
          <Link href="/" className="font-bold text-xl text-blue-600">
            <Image src="/logo.svg" alt="" width={100} height={100} />
          </Link>
        </div>
        {/* CENTER */}
        <div className="hidden md:flex w-[50%] text-sm items-center justify-between">
          {/* LINKS */}
          <div className="flex gap-6 text-white">
            <Link href="/" className="flex items-center gap-2">
              <span>Browse Djs</span>
            </Link>
          </div>
          <div className="hidden xl:flex p-2 bg-[#272727] items-center justify-between rounded-full ring-1 ring-white/50 w-3/4 focus:ring-purple-600">
            <input
              type="text"
              placeholder="search for DJ..."
              className="bg-[#272727] outline-none text-white"
            />
            <Image
              src="/search.png"
              alt=""
              width={14}
              height={14}
              className=" text-gray-500"
            />
          </div>
        </div>
        {/* RIGHT */}
        <div className="w-[30%] flex items-center gap-4 xl:gap-8 justify-end">
          <ClerkLoading>
            <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white" />
          </ClerkLoading>
          <ClerkLoaded>
            <SignedIn>
              <div className="cursor-pointer">
                <Image src="/people.png" alt="" width={24} height={24} />
              </div>
              <div className="cursor-pointer">
                <Image src="/messages.png" alt="" width={20} height={20} />
              </div>
              <div className="cursor-pointer">
                <Image src="/notifications.png" alt="" width={20} height={20} />
              </div>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <div className="flex items-center gap-2 text-sm text-white">
                <Image src="/login.png" alt="" width={20} height={20} />
                <Link href="/sign-in">Login/Register</Link>
              </div>
            </SignedOut>
          </ClerkLoaded>
          {/* <MobileMenu /> */}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
