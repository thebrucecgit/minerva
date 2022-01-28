import React, { useState, useEffect, useCallback } from "react";
import { loader } from "graphql.macro";
import { useMutation, useQuery } from "@apollo/client";
import { toast } from "react-toastify";
import FileManager from "components/FileManager";
import Error from "components/Error";
import Loader from "components/Loader";
import selections from "config/whitelist.json";
import TagsSelect from "@yaireo/tagify/dist/react.tagify";
import Tags from "components/Tags";
import { Image, Transformation } from "cloudinary-react";
import classNames from "classnames";

import styles from "./styles.module.scss";
import "@yaireo/tagify/dist/tagify.css";
import useCloudinary from "hooks/useCloudinary";
import useFileManager from "hooks/useFileManager";

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
            academicRecords: updates.tutor?.academicRecords,
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
    setUpdates({
      ...user,
      applyTutor:
        typeof user.tutor?.status === "string" && user.tutor.status !== "NONE",
    });
    setUpdate(true);
  };

  const onChange = (e) => {
    setUpdates((st) => ({
      ...st,
      [e.target.name]:
        e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));
  };

  const setFiles = (func) => {
    setUpdates((st) => ({
      ...st,
      tutor: {
        ...st.tutor,
        academicRecords: func(st.tutor.academicRecords ?? []),
      },
    }));
  };

  const { processing, fileManagerProps } = useFileManager({
    edit: update,
    setFiles,
    files: update
      ? updates.tutor?.academicRecords
      : user.tutor?.academicRecords,
  });

  const onTagsChange = useCallback((e, name) => {
    setUpdates((st) => ({
      ...st,
      [name]: e.detail.tagify.value.map((tag) => tag.value),
    }));
  }, []);

  const userApplyTutor =
    typeof user.tutor?.status === "string" && user.tutor.status !== "NONE";

  if (error) return <Error error={error} />;
  if (loading) return <Loader />;

  return (
    <div className={classNames("container", styles.PersonalInfo)}>
      <h1>Personal Information</h1>
      {update ? (
        <>
          <button
            className="btn"
            onClick={handleSaveUpdate}
            disabled={processing}
          >
            Save
          </button>
          <button className="btn danger" onClick={handleCancelUpdate}>
            Cancel
          </button>
        </>
      ) : (
        <button className="btn" onClick={handleChangeUpdate}>
          Edit
        </button>
      )}
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
                {year}
              </option>
            ))}
          </select>
        ) : (
          <p>{user.yearGroup}</p>
        )}
      </div>

      <div>
        <label htmlFor="school">School: </label>
        {update ? (
          <select
            name="school"
            id="school"
            value={updates.school ?? ""}
            onChange={onChange}
            noValidate
          >
            <option value="">--SELECT--</option>
            {selections.school.map((school, ind) => (
              <option value={school} key={ind}>
                {school}
              </option>
            ))}
          </select>
        ) : (
          <p>{user.school}</p>
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
        <div className="checkbox">
          <input
            type="checkbox"
            name="applyTutor"
            id="applyTutor"
            checked={update ? updates.applyTutor : userApplyTutor}
            onChange={onChange}
            disabled={!update}
            noValidate
          />
          <label htmlFor="applyTutor">I would like to tutor others</label>
        </div>
      </div>

      {((update && updates.applyTutor) || (!update && userApplyTutor)) && (
        <>
          {user.tutor.status === "COMPLETE" && (
            <p>
              Deselecting the above checkbox will mean you'll need to reapply to
              be a tutor
            </p>
          )}
          <div>
            <p>Application status: {user.tutor.status}</p>
            {user.tutor.status === "COMPLETE" && (
              <p>
                You may need to logout and log back in for all changes to take
                effect.
              </p>
            )}

            {update && (
              <p>
                Note that your application to be a tutor will be reviewed by an
                Academe moderator.
              </p>
            )}

            <label htmlFor="academicsTutoring">
              Academic subjects to tutor:
            </label>
            {update ? (
              <TagsSelect
                settings={{
                  placeholder: "eg. English",
                  whitelist: selections.academic,
                }}
                onChange={(e) => onTagsChange(e, "academicsTutoring")}
                defaultValue={updates.academicsTutoring}
                name="academicsTutoring"
              />
            ) : (
              <Tags tags={user.academicsTutoring} />
            )}
          </div>

          <div>
            <label>
              Please link to a copy of your latest school grades or other
              evidence of abilities relevant to the subjects you wish to tutor
            </label>
            <FileManager
              accept=".pdf, .doc, .docx"
              maxSize={10 * 1000 * 1024} // 10 MB
              maxFiles={5}
              {...fileManagerProps}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default PersonalInfo;
