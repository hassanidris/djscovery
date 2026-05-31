import AddPost from "@/components/feed/AddPost";
import Feed from "@/components/feed/Feed";
import LeftMenu from "@/components/leftMenu/LeftMenu";
import RightMenu from "@/components/rightMenu/RightMenu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";

const CommunityPage = () => {
  return (
    <div className="px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
      {/* Page Header */}
      <div className="py-6 border-b border-gray-800 flex items-center gap-3">
        <FontAwesomeIcon icon={faUsers} className="text-h_purple w-6 h-6" />
        <div>
          <h1 className="text-2xl font-bold text-h_white">Community</h1>
          <p className="text-gray-400 text-sm">
            Share posts and connect with the DJ community feel at home
          </p>
        </div>
      </div>

      {/* 3-column layout */}
      <div className="flex gap-6 py-6">
        {/* Left */}
        <div className="hidden xl:block w-[20%]">
          <LeftMenu type="home" />
        </div>

        {/* Center — Feed */}
        <div className="w-full lg:w-[70%] xl:w-[50%]">
          <div className="flex flex-col gap-6">
            <AddPost />
            <Feed />
          </div>
        </div>

        {/* Right */}
        <div className="hidden lg:block w-[30%]">
          <RightMenu />
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
