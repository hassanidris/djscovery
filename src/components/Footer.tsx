import React from "react";

const Footer = () => {
  return (
    <div className=" h-10 w-full  px-5 md:px-8 lg:px-16 xl:px-32 2xl:px-64 text-gray-200 text-sm flex justify-center items-center">
      Copyright &copy; {new Date().getFullYear()} Djscovery. All rights
      reserved.
    </div>
  );
};

export default Footer;
