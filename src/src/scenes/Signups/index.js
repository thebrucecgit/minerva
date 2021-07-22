import React, { useState, useEffect, useCallback, createRef } from "react";
import { Link, useHistory } from "react-router-dom";
import useCloudinary from "../../hooks/useCloudinary";

import ReCAPTCHA from "react-google-recaptcha";

import SignIn from "./components/SignIn";
import BasicInfo from "./components/BasicInfo";
import AdditionalInfo from "./components/AdditionalInfo";
import Verification from "./components/Verification";
import Confirmation from "./components/Confirmation";

import regex from "./regex";

import styles from "./styles.module.scss";
import "./tagify.scss";
import "@yaireo/tagify/dist/tagify.css";

import { ReactComponent as TutorImg } from "./media/undraw_teaching.svg";
import { ReactComponent as TuteeImg } from "./media/undraw_mathematics.svg";

const {
  NODE_ENV,
  REACT_APP_TEST_CAPTCHA_SITE_KEY,
  REACT_APP_CAPTCHA_SITE_KEY,
} = process.env;

const recaptchaRef = createRef();

function Signups({ authService }) {
  const history = useHistory();

  const userType = history.location.pathname === "/signup" ? "TUTEE" : "TUTOR";

  const [info, setInfo] = useState(() => {
    // If there is saved info, use saved
    try {
      const saved = localStorage.getItem("signup");
      if (saved) return JSON.parse(saved);
      else return {};
    } catch (e) {
      console.error(e);
      return {};
    }
  });

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

  const [strategy, setStrategy] = useState("local");

  const [sectionClosed, setSectionClosed] = useState({
    ...sections,
    "Sign In": false,
  });

  // Save form to localstorage
  useEffect(() => {
    const infoStore = Object.assign({}, info);
    // Don't save password
    delete infoStore.password;
    localStorage.setItem("signup", JSON.stringify(infoStore));
  }, [info]);

  // On input change
  const onChange = ({ target }) => {
    const value = target.type === "checkbox" ? target.checked : target.value;
    setInfo((st) => ({ ...st, [target.name]: value }));
  };

  const validate = useCallback(
    (section) => {
      const newErrors = {};

      switch (section) {
        case "Basic Info": {
          if (!info.name || info.name.length <= 2)
            newErrors.name = "Name is too short";
          if (!info.email || !regex.email.test(info.email))
            newErrors.email = "Email is invalid";
          if (
            strategy === "local" &&
            (!info.password || !regex.password.test(info.password))
          )
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
    },
    [info, strategy]
  );

  // Moves onto next strategy
  const onNext = useCallback(
    (section) => {
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
    },
    // eslint-disable-next-line
    [validate]
  );

  // Saves info on tags changing
  const onTagsChange = useCallback((e, name) => {
    setInfo((st) => ({
      ...st,
      [name]: e.detail.tagify.value.map((tag) => tag.value),
    }));
  }, []);

  const cloudinaryCallback = useCallback((result) => {
    const { public_id } = result.info;
    setInfo((st) => ({
      ...st,
      pfp: {
        type: "CLOUDINARY",
        cloudinaryPublicId: public_id,
        url: `https://res.cloudinary.com/${process.env.REACT_APP_CLOUDINARY_CLOUDNAME}/image/upload/c_crop,g_custom/w_500/${public_id}`,
      },
    }));
  }, []);
  const uploadImage = useCloudinary(cloudinaryCallback);

  const onGoogleSignedIn = (userInfo) => {
    const userData = authService.currentUser || userInfo;
    if (!userData) return;

    const { user } = userData;
    switch (user.registrationStatus) {
      case "COMPLETE": {
        history.replace("/dashboard");
        break;
      }
      case "EMAIL_NOT_CONFIRMED": {
        history.replace("/confirm");
        break;
      }
      default:
      case "GOOGLE_SIGNED_IN": {
        setInfo((st) => ({
          ...st,
          name: user.name,
          email: user.email,
          pfp: {
            type: "URL",
            url: user.pfp,
          },
        }));

        onNext("Sign In");
        setStrategy("google");
      }
    }
  };

  useEffect(onGoogleSignedIn, [authService.currentUser, history, onNext]);

  // Authentication with Google strategy
  const onGoogleSignIn = async ({ tokenId }) => {
    try {
      const userInfo = await authService.login(tokenId);
      onGoogleSignedIn(userInfo);
    } catch (e) {
      console.error(e);
    }
  };

  const onGoogleFailed = (err) => {
    console.error(err);
    setErrors((st) => ({
      ...st,
      signIn: err.details,
    }));
  };

  // After form is completed
  const onSubmit = (e) => {
    const validated = validate("Confirmation");
    if (!validated) return;

    recaptchaRef.current.execute();
  };

  const onCaptchaComplete = async (token) => {
    try {
      const { user } = await authService.register({
        ...info,
        userType,
        yearGroup: parseInt(info.yearGroup),
        token,
      });

      localStorage.removeItem("signup");

      if (user.registrationStatus === "COMPLETE") history.replace("/dashboard");
      else history.replace("/signup/confirm");
    } catch (e) {
      console.error(e);
      setErrors((st) => ({
        ...st,
        confirmation: e.message,
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
            strategy={strategy}
            info={info}
            errors={errors}
            uploadImage={uploadImage}
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
          {userType === "TUTOR"
            ? "We only have what we give. "
            : "Today is another chance to get better"}
        </h2>
        <p>Sign up now.</p>
        {userType === "TUTOR" ? <TutorImg /> : <TuteeImg />}
      </div>
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={
          NODE_ENV === "development"
            ? REACT_APP_TEST_CAPTCHA_SITE_KEY
            : REACT_APP_CAPTCHA_SITE_KEY
        }
        size="invisible"
        onChange={onCaptchaComplete}
      />
    </div>
  );
}

export default Signups;
