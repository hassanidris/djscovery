import { getNavUser } from "@/lib/auth/getNavUser";
import NavDesktop from "@/components/navbar/NavDesktop";
import NavMobileTop from "@/components/navbar/NavMobileTop";

const Navbar = async () => {
  const navData = await getNavUser();
  return (
    <>
      <NavDesktop {...navData} />
      <NavMobileTop {...navData} />
    </>
  );
};

export default Navbar;
