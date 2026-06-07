import { getNavUser } from "@/lib/auth/getNavUser";
import NavMobileBottom from "@/components/navbar/NavMobileBottom";

const MobileBottomNavServer = async () => {
  const { navRole, username } = await getNavUser();
  return <NavMobileBottom navRole={navRole} username={username} />;
};

export default MobileBottomNavServer;
