import AddPost from "@/components/feed/AddPost";
import Feed from "@/components/feed/Feed";
import Stories from "@/components/feed/Stories";
import Hero from "@/components/Hero";
import LeftMenu from "@/components/leftMenu/LeftMenu";
import RightMenu from "@/components/rightMenu/RightMenu";
const Homepage = () => {
  return (
    <>
      <Hero />
      <div className=" px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
        <div className="flex gap-6 py-6">
          <div className="hidden xl:block w-[20%]">
            <LeftMenu type="home" />
          </div>
          <div className="w-full lg:w-[70%] xl:w-[50%]">
            <div className="flex flex-col gap-6">
              {/* <Stories /> */}
              <AddPost />
              <Feed />
            </div>
          </div>
          <div className="hidden lg:block w-[30%]">
            <RightMenu />
          </div>
        </div>
      </div>
    </>
  );
};

export default Homepage;
