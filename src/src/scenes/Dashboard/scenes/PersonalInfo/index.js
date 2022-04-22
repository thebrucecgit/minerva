import React, { useState, useEffect, useCallback } from "react";
import { loader } from "graphql.macro";
import { useMutation, useQuery } from "@apollo/client";
import { toast } from "react-toastify";
import FileManager from "components/FileManager";
import Error from "components/Error";
import Loader from "components/Loader";
import selections from "config/whitelist.json";
import TagsSelect from "@yaireo/tagify/dist/react.tagify";
import LazyTagsSelect from "components/LazyTagsSelect";
import Tags from "components/Tags";
import { Image, Transformation } from "cloudinary-react";
import classNames from "classnames";
import set from "utilities/set";

import styles from "./styles.module.scss";
import "@yaireo/tagify/dist/tagify.css";
import useCloudinary from "hooks/useCloudinary";
import useFileManager from "hooks/useFileManager";

const GET_USER = loader("./graphql/GetUser.gql");
const UPDATE_USER = loader("./graphql/UpdateUser.gql");

const baseTagifySettings = {
  dropdown: {
    enabled: 0,
    classname: "tagifyDropdown",
    maxItems: 1000,
  },
};

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
            tutor: updates.tutor
              ? {
                  ...updates.tutor,
                  price: parseInt(updates.tutor.price),
                }
              : {},
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
    setUpdates({
      ...user,
      tutor: {
        ...user.tutor,
        type: undefined,
        status: undefined,
      },
      applyTutor:
        typeof user.tutor?.status === "string" && user.tutor.status !== "NONE",
    });
    setUpdate(true);
  };

  const onChange = (e) => {
    setUpdates((st) =>
      set(
        st,
        e.target.name,
        e.target.type === "checkbox" ? e.target.checked : e.target.value
      )
    );
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

  const onTagsChange = useCallback((e, name, select) => {
    setUpdates((st) =>
      set(
        st,
        name,
        select
          ? e.detail.tagify.value?.[0]?.value
          : e.detail.tagify.value.map((t) => t.value)
      )
    );
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
            {Object.keys(selections.year).map((year) => (
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
          <LazyTagsSelect
            settings={{
              ...baseTagifySettings,
              enforceWhitelist: true,
              placeholder: "eg. Burnside High School",
              mode: "select",
            }}
            onChange={(e) => onTagsChange(e, "school", true)}
            value={updates.school ?? ""}
            name="school"
            getWhitelist={async () => {
              const { default: schools } = await import("config/schools.json");
              return schools.map((school) => school.name);
            }}
          />
        ) : (
          <p>{user.school}</p>
        )}
      </div>

      <div>
        <label htmlFor="biography">Biography: </label>
        {update ? (
          <>
            <p>Feel free to be creative, but we recommend the following: </p>
            <ul>
              <li>Your qualifications</li>
              <li>What you're currently studying (if you're in Uni)</li>
              <li>
                Clear up any ambiguity in the curricula or subjects you teach.
              </li>
            </ul>
            <p>
              Eg.{" "}
              <em>
                I'm a third-year Economics student at the University of Auckland
                with 2 years of tutoring experience from high school. I achieved
                outstanding scholarships in physics, chemistry, and English, and
                would like to help you do the same! Both online and in-person
                options work for me. I look forward to meeting you.
              </em>
            </p>
            <textarea
              value={updates.biography}
              name="biography"
              onChange={onChange}
            ></textarea>
          </>
        ) : (
          <p>{user.biography}</p>
        )}
      </div>

      <hr />

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
              Minerva moderator.
            </p>
          )}

          <div>
            <div className="checkbox">
              <input
                type="checkbox"
                name="tutor.online"
                id="online"
                checked={
                  (update ? updates.tutor?.online : user.tutor?.online) ?? false
                }
                onChange={onChange}
                noValidate
                disabled={!update}
              />
              <label htmlFor="online">
                I am willing to tutor online (virtually)
              </label>
            </div>
          </div>

          <div data-test="location">
            <label htmlFor="tutor.location">Select your location:</label>
            {update ? (
              <TagsSelect
                settings={{
                  ...baseTagifySettings,
                  enforceWhitelist: true,
                  placeholder: "eg. Wellington",
                  whitelist: selections.location,
                  mode: "select",
                }}
                onChange={(e) => onTagsChange(e, "tutor.location", true)}
                defaultValue={updates.tutor?.location ?? ""}
                name="tutor.location"
              />
            ) : (
              <p>{user.tutor?.location}</p>
            )}
          </div>

          <div>
            <label htmlFor="tutor.price">Price per hour:</label>
            {update ? (
              <input
                type="number"
                value={updates.tutor.price ?? ""}
                name="tutor.price"
                onChange={onChange}
              />
            ) : (
              <p>${user.tutor.price}</p>
            )}
          </div>

          <div>
            <label htmlFor="tutor.academicsTutoring">
              Add academic subjects that you want to{" "}
              <strong>tutor others in</strong>:
            </label>
            {update ? (
              <TagsSelect
                settings={{
                  ...baseTagifySettings,
                  placeholder: "eg. English",
                  whitelist: selections.academic,
                  enforceWhitelist: true,
                }}
                onChange={(e) => onTagsChange(e, "tutor.academicsTutoring")}
                defaultValue={updates.tutor.academicsTutoring}
                name="tutor.academicsTutoring"
              />
            ) : (
              <Tags tags={user.tutor.academicsTutoring} />
            )}
          </div>

          <div>
            <label htmlFor="tutor.curricula">
              Add curricula that you want to <strong>tutor others in</strong>:
            </label>
            {update ? (
              <TagsSelect
                settings={{
                  ...baseTagifySettings,
                  placeholder: "eg. English",
                  whitelist: selections.curricula,
                  enforceWhitelist: true,
                }}
                onChange={(e) => onTagsChange(e, "tutor.curricula")}
                defaultValue={updates.tutor.curricula}
                name="tutor.curricula"
              />
            ) : (
              <Tags tags={user.tutor.curricula} />
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
