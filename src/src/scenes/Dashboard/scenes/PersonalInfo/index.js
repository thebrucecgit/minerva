import React, { useState, useEffect, useCallback } from "react";
import { loader } from "graphql.macro";
import { useMutation, useQuery } from "@apollo/client";
import { toast } from "react-toastify";
import Error from "../../../../components/Error";
import Loader from "../../../../components/Loader";
import selections from "../../../../config/whitelist.json";
import TagsSelect from "@yaireo/tagify/dist/react.tagify";
import Tags from "../../components/Tags";
import { Image, Transformation } from "cloudinary-react";
import classNames from "classnames";

import styles from "./styles.module.scss";
import "@yaireo/tagify/dist/tagify.css";
import useCloudinary from "../../../../hooks/useCloudinary";

const GET_USER = loader("./graphql/GetUser.gql");
const UPDATE_USER = loader("./graphql/UpdateUser.gql");

function PersonalInfo({ currentUser }) {
  const { data, loading, error } = useQuery(GET_USER);

  const [updateUserAPI] = useMutation(UPDATE_USER);

  const [user, setUser] = useState({});
  const [updates, setUpdates] = useState({});
  const [update, setUpdate] = useState(false);

  const imageUploadCallback = useCallback((result) => {
    const { public_id } = result.info;
    setUpdates((st) => ({
      ...st,
      pfp: {
        type: "CLOUDINARY",
        cloudinaryPublicId: public_id,
        url: `https://res.cloudinary.com/${process.env.REACT_APP_CLOUDINARY_CLOUDNAME}/image/upload/c_crop,g_custom/w_500/${public_id}`,
      },
    }));
  }, []);
  const uploadImage = useCloudinary(imageUploadCallback);

  useEffect(() => {
    if (data) setUser(data.getUser);
  }, [data]);

  const handleSaveUpdate = useCallback(
    async (e) => {
      let toastId;
      try {
        toastId = toast("Updating user...", { autoClose: false });
        const { data } = await updateUserAPI({
          variables: {
            ...updates,
            id: currentUser.user._id,
          },
        });
        setUser((st) => ({
          ...st,
          ...data.updateUser,
        }));
        toast.update(toastId, {
          render: "Successfully updated user",
          type: toast.TYPE.SUCCESS,
          autoClose: 3000,
        });
        setUpdate(false);
        setUpdates({});
      } catch (e) {
        console.error(e);
        toast.update(toastId, {
          render: e.message,
          type: toast.TYPE.ERROR,
          autoClose: 5000,
        });
      }
    },
    [updateUserAPI, updates, currentUser]
  );

  const handleCancelUpdate = (e) => {
    setUpdate(false);
    setUpdates({});
  };

  const handleChangeUpdate = (e) => {
    setUpdate(true);
    setUpdates(user);
  };

  const onChange = (e) => {
    setUpdates((st) => ({
      ...st,
      [e.target.name]: e.target.value,
    }));
  };

  const onTagsChange = useCallback((e, name) => {
    setUpdates((st) => ({
      ...st,
      [name]: e.detail.tagify.value.map((tag) => tag.value),
    }));
  }, []);

  if (error) return <Error error={error} />;
  if (loading) return <Loader />;

  return (
    <div className={classNames("container", styles.PersonalInfo)}>
      <h1>Personal Information</h1>
      <div>
        <label htmlFor="name">Name: </label>
        {update ? (
          <input
            type="text"
            value={updates.name}
            name="name"
            onChange={onChange}
          />
        ) : (
          <p>{user.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="email">Email: </label>
        {update && "Your email can't be changed. "}
        <p>{user.email}</p>
      </div>

      <div>
        <label htmlFor="pfp">Picture:</label>
        {update
          ? updates.pfp &&
            (updates.pfp.cloudinaryPublicId ? (
              <Image
                publicId={updates.pfp.cloudinaryPublicId}
                alt="user uploaded profile pic"
              >
                <Transformation width="200" crop="scale" />
              </Image>
            ) : (
              <img src={updates.pfp.url} alt="google account profile pic" />
            ))
          : user.pfp &&
            (user.pfp.cloudinaryPublicId ? (
              <Image
                publicId={user.pfp.cloudinaryPublicId}
                alt="user uploaded profile pic"
              >
                <Transformation width="200" crop="scale" />
              </Image>
            ) : (
              <img src={user.pfp.url} alt="google account profile pic" />
            ))}

        {update && (
          <button className="btn" onClick={uploadImage}>
            {user.pfp ? "Change" : "Upload"}
          </button>
        )}
      </div>

      <div>
        <label htmlFor="yearGroup">Year: </label>
        {update ? (
          <select
            name="yearGroup"
            id="yearGroup"
            value={updates.yearGroup ?? ""}
            onChange={onChange}
            noValidate
          >
            <option value="">--SELECT--</option>
            {selections.year.map((year) => (
              <option value={year} key={year}>
                Year {year}
              </option>
            ))}
          </select>
        ) : (
          <p>Year {user.yearGroup}</p>
        )}
      </div>

      <div>
        <label htmlFor="biography">Biography: </label>
        {update ? (
          <textarea
            value={updates.biography}
            name="biography"
            onChange={onChange}
          ></textarea>
        ) : (
          <p>{user.biography}</p>
        )}
      </div>

      <div>
        <label htmlFor="academics">Academic subjects: </label>
        {update ? (
          <TagsSelect
            settings={{
              enforceWhitelist: true,
              placeholder: "eg. English",
              whitelist: selections.academic,
            }}
            onChange={(e) => onTagsChange(e, "academics")}
            defaultValue={updates.academics}
            name="academic"
          />
        ) : (
          <Tags tags={user.academics} />
        )}
      </div>

      <div>
        <label htmlFor="extras">Extra-curriculars: </label>
        {update ? (
          <TagsSelect
            settings={{
              enforceWhitelist: true,
              placeholder: "eg. Coding",
              whitelist: selections.extras,
            }}
            onChange={(e) => onTagsChange(e, "extras")}
            defaultValue={updates.extra}
            name="extras"
          />
        ) : (
          <Tags tags={user.extras} />
        )}
      </div>

      {update ? (
        <>
          <button className="btn" onClick={handleSaveUpdate}>
            Save
          </button>
          <button className="btn danger" onClick={handleCancelUpdate}>
            Cancel
          </button>
        </>
      ) : (
        <button className="btn" onClick={handleChangeUpdate}>
          Update
        </button>
      )}
    </div>
  );
}

export default PersonalInfo;
