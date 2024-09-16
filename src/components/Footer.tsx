import React from "react";

const Footer = () => {
  return (
    <div className="w-full bg-white px-5 md:px-8 lg:px-16 xl:px-32 2xl:px-64 text-gray-500 text-sm">
      Copyright &copy; {new Date().getFullYear()} Djscovery. All rights
      reserved.
    </div>
  );
};

export default Footer;
