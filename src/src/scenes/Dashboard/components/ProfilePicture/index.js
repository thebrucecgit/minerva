import React from "react";
import { Image, Transformation } from "cloudinary-react";

const ProfilePicture = ({
  pfp,
  alt = "user profile pic",
  width = "400",
  transformations = [],
}) => {
  if (!pfp) return null;

  if (pfp.type === "CLOUDINARY") {
    return (
      <Image publicId={pfp.cloudinaryPublicId} alt={alt}>
        <Transformation width={width} crop="scale" />
        {transformations.map((t) => t)}
      </Image>
    );
  } else {
    return <img src={pfp.url} alt={alt} />;
  }
};

export default ProfilePicture;
