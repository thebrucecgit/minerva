import React, { useState, useEffect, useCallback, createRef } from "react";
import { Link, useHistory } from "react-router-dom";

import ReCAPTCHA from "react-google-recaptcha";
import useScript from "../../services/hooks/useScript";

import SignIn from "./components/SignIn";
import BasicInfo from "./components/BasicInfo";
import AdditionalInfo from "./components/AdditionalInfo";
import Verification from "./components/Verification";
import Confirmation from "./components/Confirmation";

import uploadWidgetSettings from "./uploadWidgetSettings";
import regex from "./regex";

import styles from "./styles.module.scss";
import "./tagify.scss";

import { ReactComponent as TutorImg } from "./media/undraw_teaching.svg";
import { ReactComponent as TuteeImg } from "./media/undraw_mathematics.svg";

const recaptchaRef = createRef();

function Signups({ authService }) {
  const history = useHistory();

  const userType = history.location.pathname === "/signup" ? "tutee" : "tutor";

  const savedSignup = localStorage.getItem("signup");

  const [info, setInfo] = useState(
    // If there is saved info, use saved
    (savedSignup && JSON.parse(savedSignup)) || {}
  );

  const [errors, setErrors] = useState({});

  const [sectionStatus, setSectionStatus] = useState([
    null,
    null,
    null,
    null,
    null,
  ]);

  const sections = {
    "Sign In": true,
    "Basic Info": true,
    "Additional Info": true,
    Verification: true,
    Confirmation: true,
  };

  const [sectionClosed, setSectionClosed] = useState({
    ...sections,
    "Sign In": false,
  });

  const [uploadFile, setUploadFile] = useState();

  // Save form to localstorage
  useEffect(() => {
    const infoStore = Object.assign({}, info);
    // Don't save password
    delete infoStore.password;
    localStorage.setItem("signup", JSON.stringify(infoStore));
  }, [info]);

  // On input change
  const onChange = (e) => {
    e.persist();
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setInfo((st) => ({ ...st, [e.target.name]: value }));
  };

  // Authentication with Google strategy
  const onGoogleSignIn = async ({ tokenId }) => {
    try {
      const userInfo = await authService.login(tokenId);
      if (userInfo.registered) return history.replace("/dashboard");
      else
        setInfo((st) => ({
          ...st,
          name: userInfo.name,
          email: userInfo.email,
          pfp: {
            file: userInfo.picture,
            name: "Google Account Picture",
          },
        }));
    } catch (e) {
      console.error(e);
    }
  };

  const onGoogleFailed = (err) => {
    setErrors((st) => ({
      ...st,
      signIn: err,
    }));
  };

  const validate = (section) => {
    const newErrors = {};

    switch (section) {
      case "Basic Info": {
        if (!info.name || info.name.length <= 2)
          newErrors.name = "Name is too short";
        if (!info.email || !regex.email.test(info.email))
          newErrors.email = "Email is invalid";
        if (!info.password || !regex.password.test(info.password))
          newErrors.password =
            "Password needs to be minimum of eight characters with at least one letter and one number";
        break;
      }
      case "Additional Info": {
        if (!info.yearGroup)
          newErrors.yearGroup = "Please select your year group";
        if (!info.school) newErrors.school = "Please select your school";
        if (!info.academics || info.academics.length === 0)
          newErrors.academics = "Please enter at least one subject";
        break;
      }
      case "Verification": {
        if (!info.price) newErrors.price = "Please select a price";
        if (!info.biography)
          newErrors.biography = "Please write about yourself";
        if (!info.grades || !regex.url.test(info.grades))
          newErrors.grades = "Please enter a valid link";
        break;
      }
      case "Confirmation": {
        if (!info.agreement)
          newErrors.agreement = "You must agree to the terms";
        break;
      }
      default:
        break;
    }

    setErrors(newErrors);
    return Object.values(newErrors).length === 0;
  };

  // Moves onto nexxt strategy
  const onNext = (section) => {
    const validated = validate(section);

    const sectionsArr = Object.keys(sections);
    const sectionInd = sectionsArr.indexOf(section);

    setSectionStatus((st) => {
      const newState = [...st];
      newState[sectionInd] = validated;
      return newState;
    });

    if (validated) {
      const newSection = sectionsArr[sectionInd + 1];
      setSectionClosed({ ...sections, [newSection]: false });
    }
  };

  // const onDatalistChange = (e, name) => {
  //   setInfo((st) => ({
  //     ...st,
  //     [name]: e.detail.value,
  //   }));
  // };

  // const onDatalistBlur = (e, name) => {
  //   console.log(e);
  //   if (!selections[name].includes(info[name])) {
  //     setInfo((st) => ({
  //       ...st,
  //       [name]: "",
  //     }));
  //   }
  // };

  // Saves info on tags changing
  const onTagsChange = (e, name) => {
    setInfo((st) => ({
      ...st,
      [name]: e.detail.tagify.value.map((tag) => tag.value),
    }));
  };

  // For cloudinary upload widget
  const uploadCallback = useCallback(() => {
    const widget = window.cloudinary.createUploadWidget(
      uploadWidgetSettings,
      (err, result) => {
        if (err) console.error(err);
        if (result && result.event === "success") {
          const { path, original_filename } = result.info;
          setInfo((st) => ({
            ...st,
            pfp: { file: path, name: original_filename },
          }));
        }
      }
    );
    setUploadFile(widget);
  }, []);

  useScript("https://widget.cloudinary.com/v2.0/global/all.js", uploadCallback);

  // After form is completed
  const onSubmit = (e) => {
    const newErrors = validate("Confirmation");
    if (newErrors) return;
    recaptchaRef.current.execute();
  };

  const onCaptchaComplete = async (token) => {
    try {
      const userInfo = await authService.register({
        ...info,
        token,
      });
    } catch (e) {
      setErrors((st) => ({
        ...st,
        confirmation: e,
      }));
    }
  };

  // Prevent form submit
  const formDoNothing = (e) => {
    e.preventDefault();
  };

  return (
    <div className={styles.Signups}>
      <div className={styles.main}>
        <form onSubmit={formDoNothing}>
          <SignIn
            sectionStatus={sectionStatus[0]}
            sectionClosed={sectionClosed["Sign In"]}
            errors={errors}
            onNext={() => onNext("Sign In")}
            onGoogleSignIn={onGoogleSignIn}
            onGoogleFailed={onGoogleFailed}
          />
          <BasicInfo
            sectionStatus={sectionStatus[1]}
            sectionClosed={sectionClosed["Basic Info"]}
            info={info}
            errors={errors}
            uploadImage={uploadFile && uploadFile.open}
            onChange={onChange}
            onNext={() => onNext("Basic Info")}
          />
          <AdditionalInfo
            sectionStatus={sectionStatus[2]}
            sectionClosed={sectionClosed["Additional Info"]}
            info={info}
            errors={errors}
            onChange={onChange}
            userType={userType}
            onTagsChange={onTagsChange}
            onNext={() => onNext("Additional Info")}
          />
          <Verification
            sectionStatus={sectionStatus[3]}
            sectionClosed={sectionClosed["Verification"]}
            info={info}
            errors={errors}
            onChange={onChange}
            userType={userType}
            onNext={() => onNext("Verification")}
          />
          <Confirmation
            sectionStatus={sectionStatus[4]}
            sectionClosed={sectionClosed["Confirmation"]}
            info={info}
            errors={errors}
            onChange={onChange}
            onSubmit={onSubmit}
          />
        </form>
        <p>
          <Link to="/">Return Home</Link>
        </p>
      </div>
      <div className={styles.panel}>
        <h2>
          {userType === "tutor"
            ? "We only have what we give. "
            : "Today is another chance to get better"}
        </h2>
        <p>Sign up now.</p>
        {userType === "tutor" ? <TutorImg /> : <TuteeImg />}
      </div>
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={process.env.REACT_APP_CAPTCHA_SITE_KEY}
        size="invisible"
        onChange={onCaptchaComplete}
      />
    </div>
  );
}

export default Signups;
