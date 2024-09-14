import Link from "next/link";
import Image from "next/image";
import {
  ClerkLoaded,
  ClerkLoading,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightToBracket, faSearch } from "@fortawesome/free-solid-svg-icons";
import ViewProfileBtn from "./ViewProfileBtn";

const Navbar = async () => {
  return (
    <>
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
            // LINKS
            <div className="flex gap-6 text-white">
              <Link href="/" className="flex items-center gap-2">
                <span>Browse Djs</span>
              </Link>
            </div>
            <div className="hidden xl:flex p-2 bg-[#272727] items-center justify-between rounded-full ring-1 ring-white/50 w-3/4 focus:ring-purple-600">
              <input
                type="text"
                placeholder="search for DJ..."
                className="bg-[#272727] outline-none text-white w-full"
              />
              <button>
                <FontAwesomeIcon
                  icon={faSearch}
                  className=" h-6 w-6 text-white bg-gray-500 rounded-full p-1"
                />
              </button>
              {/* <Image
              src="/search.png"
              alt=""
              width={14}
              height={14}
              className=" text-gray-500"
            /> */}
            </div>
          </div>

          {/* RIGHT */}
          <div className="w-[30%] flex items-center gap-4 xl:gap-8 justify-end">
            <ClerkLoading>
              <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white" />
            </ClerkLoading>
            <ClerkLoaded>
              <SignedIn>
                {/* <ViewProfileBtn /> */}
                <UserButton />
              </SignedIn>
              <SignedOut>
                <div className="flex items-center gap-2 text-sm text-white">
                  <Link
                    href="/sign-in"
                    className=" flex gap-2 border border-black py-1 px-2 rounded-md  butn primary_border_butn text-white ms-4"
                  >
                    <FontAwesomeIcon
                      icon={faRightToBracket}
                      className=" h-5 w-5"
                    />
                    <span>Login/Register</span>
                  </Link>
                </div>
              </SignedOut>
            </ClerkLoaded>
            {/* <MobileMenu /> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
