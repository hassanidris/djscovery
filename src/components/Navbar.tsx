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
import {
  faBell,
  faCirclePlus,
  faCommentDots,
  faHouse,
  faRightToBracket,
  faUserGroup,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
// import ViewProfileBtn from "./ViewProfileBtn";

const Navbar = async () => {
  return (
    <>
      <div className="h-24 flex items-center justify-between">
        {/* LEFT */}
        <div className="md:hidden lg:block w-[20%]">
          <Link href="/" className="font-bold text-xl text-blue-600">
            <Image src="/logo.svg" alt="" width={100} height={100} />
          </Link>
        </div>
        {/* CENTER */}
        <div className="hidden md:flex w-[50%] text-sm items-center justify-between">
          {/* LINKS */}
          <div className="flex gap-6 text-h_white">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-400 hover:text-h_white "
            >
              <FontAwesomeIcon icon={faHouse} className=" h-4 w-4" />
              {/* <Image
                src="/home.png"
                alt="Homepage"
                width={16}
                height={16}
                className="w-4 h-4"
              /> */}
              <span>Homepage</span>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-400 hover:text-h_white"
            >
              <FontAwesomeIcon icon={faUserGroup} className=" h-4 w-4" />
              {/* <Image
                src="/friends.png"
                alt="Friends"
                width={16}
                height={16}
                className="w-4 h-4"
              /> */}
              <span>Friends</span>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-400 hover:text-h_white "
            >
              <FontAwesomeIcon icon={faCirclePlus} className=" h-4 w-4" />
              {/* <Image
                src="/stories.png"
                alt="Stories"
                width={16}
                height={16}
                className="w-4 h-4"
              /> */}
              <span>Stories</span>
            </Link>
          </div>
          <div className="hidden xl:flex p-2 bg-slate-100 items-center rounded-xl">
            <input
              type="text"
              placeholder="search..."
              className="bg-transparent outline-none"
            />
            <Image src="/search.png" alt="" width={14} height={14} />
          </div>
        </div>

        {/* RIGHT */}
        <div className="w-[30%] flex items-center gap-4 xl:gap-8 justify-end">
          <ClerkLoading>
            <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white" />
          </ClerkLoading>
          <ClerkLoaded>
            <SignedIn>
              <div className="cursor-pointer text-gray-400 hover:text-h_white">
                <FontAwesomeIcon icon={faUsers} className=" h-6 w-6" />
              </div>
              <div className="cursor-pointer text-gray-400 hover:text-h_white">
                <FontAwesomeIcon icon={faCommentDots} className=" h-6 w-6" />
              </div>
              <div className="cursor-pointer text-gray-400 hover:text-h_white">
                <FontAwesomeIcon icon={faBell} className=" h-6 w-6" />
              </div>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <div className="flex items-center gap-2 text-sm">
                {/* <Image src="/login.png" alt="" width={20} height={20} /> */}
                <Link
                  href="/sign-in"
                  className=" flex justify-center items-center gap-2  ring-1 ring-h_purple text-h_purple rounded-md py-1.5 px-4 hover:text-h_white hover:bg-h_purple"
                >
                  <FontAwesomeIcon
                    icon={faRightToBracket}
                    className=" h-4 w-4"
                  />
                  Login/Register
                </Link>
              </div>
            </SignedOut>
          </ClerkLoaded>
          {/* <MobileMenu /> */}
        </div>
      </div>
    </>
  );
};

export default Navbar;
