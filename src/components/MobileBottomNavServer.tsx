import { getNavUser } from "@/lib/auth/getNavUser";
import NavMobileBottom from "@/components/navbar/NavMobileBottom";

const MobileBottomNavServer = async () => {
  const { navRole, username, djSlug } = await getNavUser();
  return (
    <NavMobileBottom navRole={navRole} username={username} djSlug={djSlug} />
  );
};

export default MobileBottomNavServer;
