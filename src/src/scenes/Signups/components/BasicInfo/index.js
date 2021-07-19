import React from "react";
import classNames from "classnames";
import { Image, Transformation } from "cloudinary-react";

import StatusSymbol from "../StatusSymbol";

import styles from "../../styles.module.scss";

const BasicInfo = ({
  sectionStatus,
  sectionClosed,
  strategy,
  errors,
  info,
  uploadImage,
  onChange,
  onNext,
}) => {
  return (
    <section>
      <div className={styles.header}>
        <h3>Basic Info</h3>
        <StatusSymbol state={sectionStatus} />
      </div>
      <div
        className={classNames(styles.body, {
          [styles.closed]: sectionClosed,
        })}
      >
        <div className={styles.content}>
          <div className={styles.field}>
            <label htmlFor="name">Name:</label>
            {errors.name && <p className={styles.invalid}>{errors.name}</p>}
            <input
              type="text"
              id="name"
              name="name"
              autoComplete="name"
              value={info.name ?? ""}
              onChange={onChange}
              noValidate
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="email"> Email:</label>
            {errors.email && <p className={styles.invalid}>{errors.email}</p>}
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              value={info.email ?? ""}
              onChange={onChange}
              disabled={strategy === "google"}
              noValidate
            />
          </div>
          {strategy === "local" && (
            <div className={styles.field}>
              <label htmlFor="password">Password:</label>
              {errors.password && (
                <p className={styles.invalid}>{errors.password}</p>
              )}
              <input
                type="password"
                id="password"
                name="password"
                autoComplete="new-password"
                value={info.password ?? ""}
                onChange={onChange}
                noValidate
              />
            </div>
          )}
          <div className={styles.field}>
            <label htmlFor="pfp">Picture:</label>
            {info.pfp &&
              (info.pfp.cloudinaryPublicId ? (
                <Image
                  publicId={info.pfp.cloudinaryPublicId}
                  alt="user uploaded profile pic"
                >
                  <Transformation width="200" crop="scale" />
                </Image>
              ) : (
                <img src={info.pfp.url} alt="google account profile pic" />
              ))}

            <button className="btn" onClick={uploadImage}>
              {info.pfp ? "Change" : "Upload"}
            </button>
          </div>
          <button className="btn" onClick={onNext} data-test="basic-info-next">
            Next
          </button>
        </div>
      </div>
    </section>
  );
};

export default BasicInfo;
