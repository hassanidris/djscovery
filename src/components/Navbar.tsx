import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCirclePlus,
  faCommentDots,
  faHouse,
  faRightToBracket,
  faUserGroup,
  faUsers,
  faCompactDisc,
} from "@fortawesome/free-solid-svg-icons";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";

const Navbar = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
          <div className="flex gap-6 text-h_white">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-400 hover:text-h_white"
            >
              <FontAwesomeIcon icon={faHouse} className="h-4 w-4" />
              <span>Homepage</span>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-400 hover:text-h_white"
            >
              <FontAwesomeIcon icon={faUserGroup} className="h-4 w-4" />
              <span>Friends</span>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-400 hover:text-h_white"
            >
              <FontAwesomeIcon icon={faCirclePlus} className="h-4 w-4" />
              <span>Stories</span>
            </Link>
            <Link
              href="/directory"
              className="flex items-center gap-2 text-gray-400 hover:text-h_white"
            >
              <FontAwesomeIcon icon={faCompactDisc} className="h-4 w-4" />
              <span>Directory</span>
            </Link>
          </div>
          <div className="hidden xl:flex p-2 bg-transparent items-center rounded-xl ring-1 ring-gray-600">
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
          {user ? (
            <>
              <div className="cursor-pointer text-gray-400 hover:text-h_white">
                <FontAwesomeIcon icon={faUsers} className="h-6 w-6" />
              </div>
              <div className="cursor-pointer text-gray-400 hover:text-h_white">
                <FontAwesomeIcon icon={faCommentDots} className="h-6 w-6" />
              </div>
              <div className="cursor-pointer text-gray-400 hover:text-h_white">
                <FontAwesomeIcon icon={faBell} className="h-6 w-6" />
              </div>
              <form action={signOut}>
                <button className="text-gray-400 hover:text-h_white text-xs ring-1 ring-gray-600 rounded-md py-1.5 px-3">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <Link
                href="/sign-in"
                className="flex justify-center items-center gap-2 ring-1 ring-h_purple text-h_purple rounded-md py-1.5 px-4 hover:text-h_white hover:bg-h_purple"
              >
                <FontAwesomeIcon icon={faRightToBracket} className="h-4 w-4" />
                Login/Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
