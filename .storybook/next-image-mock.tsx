import React from "react";

export const Image = ({ src, alt, ...props }: any) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={src as string} alt={alt} {...props} />
);

export default Image;
