import React from "react";
import classNames from "classnames";

import StatusSymbol from "../StatusSymbol";

import styles from "../../styles.module.scss";

const BasicInfo = ({
  sectionStatus,
  sectionClosed,
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
              value={info.name}
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
              value={info.email}
              onChange={onChange}
              disabled={true}
              noValidate
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="password">Password:</label>
            {errors.password && (
              <p className={styles.invalid}>{errors.password}</p>
            )}
            <input
              type="password"
              id="password"
              name="password"
              value={info.password}
              onChange={onChange}
              noValidate
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="pfp">Picture:</label>
            {info.pfp && (
              <>
                <img
                  src={`https://res.cloudinary.com/brucec/image/upload/c_crop,g_custom/w_200/${info.pfp.file}`}
                  alt="user uploaded pfp"
                />
                <p>Image {info.pfp.name}</p>
              </>
            )}
            <button onClick={uploadImage}>
              {info.pfp ? "Change" : "Upload"}
            </button>
          </div>
          <button onClick={onNext}>Next</button>
        </div>
      </div>
    </section>
  );
};

export default BasicInfo;
