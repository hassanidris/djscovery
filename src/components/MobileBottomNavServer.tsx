import { getNavUser } from "@/lib/auth/getNavUser";
import NavMobileBottom from "@/components/navbar/NavMobileBottom";

const MobileBottomNavServer = async () => {
  const { navRole, username, djSlug, avatarSrc, initials } = await getNavUser();
  return (
    <NavMobileBottom
      navRole={navRole}
      username={username}
      djSlug={djSlug}
      avatarSrc={avatarSrc}
      initials={initials}
    />
  );
};

export default MobileBottomNavServer;
