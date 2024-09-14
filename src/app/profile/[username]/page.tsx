import Image from "next/image";
import LeftMenu from "@/components/leftMenu/LeftMenu";
import Feed from "@/components/feed/Feed";
import RightMenu from "@/components/rightMenu/RightMenu";
// import Events from "@/components/"

const ProfilePage = async ({ params }: { params: { username: string } }) => {
  const username = params.username;

  return (
    <div className=" flex gap-6 pt-6">
      <div className=" hidden xl:block w-[20%]">
        <LeftMenu type="profile" />
      </div>
      <div className=" w-full lg:w-[70%] xl:w-[50%]">
        <div className="flex flex-col gap-6">
          <div className=" flex flex-col items-center justify-center">
            <div className=" w-full h-64 relative">
              <Image
                src="https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt=""
                fill
                className=" rounded-md object-cover"
              />
              <Image
                src="https://images.pexels.com/photos/5899069/pexels-photo-5899069.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt=""
                width={128}
                height={128}
                className=" w-32 h-32 rounded-full absolute right-0 left-0 m-auto -bottom-16 ring-4 ring-white object-cover"
              />
            </div>
            <h1 className=" mt-20 mb-4 text-2xl font-medium">Elva Weaver</h1>
            <div className=" flex justify-center items-center gap-12 mb-4">
              <div className=" flex flex-col items-center">
                <span className=" font-medium">123</span>
                <span className=" text-sm">Posts</span>
              </div>
              <div className=" flex flex-col items-center">
                <span className=" font-medium">1.2k</span>
                <span className=" text-sm">Followers</span>
              </div>
              <div className=" flex flex-col items-center">
                <span className=" font-medium">1.3k</span>
                <span className=" text-sm">Following</span>
              </div>
            </div>
          </div>

          <Feed />
        </div>
      </div>
      <div className="hidden xl:block w-[30%]">
        <RightMenu userId="test" />
      </div>
    </div>
  );
};

export default ProfilePage;
