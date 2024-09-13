import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import React from "react";
import { auth } from "@clerk/nextjs/server";
import { User } from "@prisma/client";
import AddSocialMedia from "./AddSocialMedia";
import {
  IconDefinition,
  faFacebook,
  faInstagram,
  faTiktok,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";

const SocialMediaList = ({ user }: { user: User }) => {
  const { userId: currentUserId } = auth();

  // const [links, setLinks] = useState([
  //   { platform: "Instagram", url: "#", icon: faInstagram },
  //   { platform: "Twitter", url: "#", icon: faXTwitter },
  //   { platform: "Facebook", url: "#", icon: faFacebook },
  //   { platform: "TikTok", url: "#", icon: faTiktok },
  // ]);

  // const updateLinks = (
  //   newLinks: React.SetStateAction<
  //     { platform: string; url: string; icon: IconDefinition }[]
  //   >
  // ) => {
  //   setLinks(newLinks);
  // };

  return (
    <div className="">
      <h6 className="text-white mb-3 font-bold flex gap-4 justify-items-end">
        Social Media{" "}
        {currentUserId && (
          <AddSocialMedia
          // links={links} updateLinks={updateLinks}
          />
        )}
      </h6>
      <div className="social_links flex flex-wrap ">
        <Link href="#" className="mb-1">
          <FontAwesomeIcon
            icon={faFacebook}
            className="h-6 w-6 bg-black hover:text-[#523c90] hover:bg-white/90 p-1 rounded-lg"
          />
        </Link>
      </div>
    </div>
  );
};

export default SocialMediaList;
