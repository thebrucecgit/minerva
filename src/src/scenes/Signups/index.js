import { useState, useEffect, useCallback, createRef } from "react";
import { Link, useHistory } from "react-router-dom";
import useCloudinary from "../../hooks/useCloudinary";

import ReCAPTCHA from "react-google-recaptcha";
import { GoogleOAuthProvider } from "@react-oauth/google";

import SignIn from "./components/SignIn";
import BasicInfo from "./components/BasicInfo";
import AdditionalInfo from "./components/AdditionalInfo";
import Verification from "./components/Verification";
import Confirmation from "./components/Confirmation";

import useVerification from "./hooks/useVerification";
import set from "utilities/set";

import styles from "./styles.module.scss";
import "./tagify.scss";
import "@yaireo/tagify/dist/tagify.css";

import { ReactComponent as TuteeImg } from "./media/undraw_mathematics.svg";
import { ReactComponent as TutorImg } from "./media/undraw_teaching.svg";

const {
  NODE_ENV,
  REACT_APP_TEST_CAPTCHA_SITE_KEY,
  REACT_APP_CAPTCHA_SITE_KEY,
} = process.env;

const recaptchaRef = createRef();

const sections = {
  "Sign In": true,
  "Basic Info": true,
  "Additional Info": true,
  Verification: true,
  Confirmation: true,
};

function Signups({ authService }) {
  const history = useHistory();

  const defaultApply =
    history.location.pathname === "/signup/tutors" ? "tutor" : "tutee";

  const [info, setInfo] = useState({});

  const [sectionStatus, setSectionStatus] = useState([
    null,
    null,
    null,
    null,
    null,
  ]);

  const [strategy, setStrategy] = useState("local");

  const [sectionClosed, setSectionClosed] = useState({
    ...sections,
    "Sign In": false,
  });

  // Save form to localstorage
  useEffect(() => {
    const infoStore = Object.assign({}, info);
    // Don't store files
    delete infoStore.academicRecords;
    // Don't save password
    delete infoStore.password;
    localStorage.setItem("signup", JSON.stringify(infoStore));
  }, [info]);

  // On input change
  const onChange = ({ target }) => {
    const value = target.type === "checkbox" ? target.checked : target.value;
    setInfo((st) => set(st, target.name, value));
  };

  const [errors, setErrors] = useState({});
  const validate = useVerification(info, strategy, setErrors, defaultApply);

  const onBack = (section) => {
    const sectionsArr = Object.keys(sections);
    const sectionInd = sectionsArr.indexOf(section);
    const newSection = sectionsArr[sectionInd - 1];
    setSectionClosed({ ...sections, [newSection]: false });
  };

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
    [validate]
  );

  // Saves info on tags changing
  const onTagsChange = useCallback((e, name, select) => {
    setInfo((st) =>
      set(
        st,
        name,
        select
          ? e.detail.tagify.value?.[0]?.value
          : e.detail.tagify.value.map((t) => t.value)
      )
    );
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

  const onGoogleSignedIn = useCallback(
    (userInfo) => {
      const userData = authService.currentUser ?? userInfo;
      if (!userData) return;

      const { user } = userData;
      switch (user.registrationStatus) {
        case "COMPLETE": {
          history.replace("/dashboard");
          break;
        }
        case "EMAIL_NOT_CONFIRMED": {
          history.replace("/signup/confirm");
          break;
        }
        default:
        case "GOOGLE_SIGNED_IN": {
          if (strategy === "google") break;
          setInfo((st) => ({
            ...st,
            name: user.name,
            email: user.email,
            pfp: user.pfp,
          }));
          onNext("Sign In");
          setStrategy("google");
          break;
        }
      }
    },
    [authService.currentUser, history, onNext, strategy]
  );

  const [submissionPending, setSubmissionPending] = useState(false);

  useEffect(onGoogleSignedIn, [onGoogleSignedIn]);

  // Authentication with Google strategy
  const onGoogleSignIn = async ({ credential }) => {
    try {
      const userInfo = await authService.login(credential);
      onGoogleSignedIn(userInfo);
    } catch (e) {
      setErrors((errors) => ({
        ...errors,
        signIn: e.message,
      }));
      console.error(e);
    }
  };

  // After form is completed
  const onSubmit = (e) => {
    if (submissionPending || !validate("Confirmation")) return;
    setSubmissionPending(true);
    recaptchaRef.current.execute();
  };

  const onCaptchaComplete = async (token) => {
    try {
      recaptchaRef.current.reset();
      const request = {
        ...info,
        applyTutor: defaultApply === "tutor",
        token,
      };
      if (request.tutor) request.tutor.price = parseInt(request.tutor.price);

      const { user } = await authService.register(request);

      localStorage.removeItem("signup");

      if (user.registrationStatus === "COMPLETE") history.replace("/dashboard");
      else history.replace("/signup/confirm");
    } catch (e) {
      console.error(e);
      setSubmissionPending(false);
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
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <div className={styles.Signups}>
        <div className={styles.main}>
          <form onSubmit={formDoNothing}>
            <SignIn
              sectionStatus={sectionStatus[0]}
              sectionClosed={sectionClosed["Sign In"]}
              errors={errors}
              onNext={() => onNext("Sign In")}
              onGoogleSignIn={onGoogleSignIn}
            />
            <BasicInfo
              sectionStatus={sectionStatus[1]}
              sectionClosed={sectionClosed["Basic Info"]}
              strategy={strategy}
              info={info}
              errors={errors}
              uploadImage={uploadImage}
              defaultApply={defaultApply}
              onChange={onChange}
              onBack={() => onBack("Basic Info")}
              onNext={() => onNext("Basic Info")}
            />
            <AdditionalInfo
              sectionStatus={sectionStatus[2]}
              sectionClosed={sectionClosed["Additional Info"]}
              info={info}
              errors={errors}
              onChange={onChange}
              onTagsChange={onTagsChange}
              defaultApply={defaultApply}
              setInfo={setInfo}
              onBack={() => onBack("Additional Info")}
              onNext={() => onNext("Additional Info")}
            />
            <Verification
              sectionStatus={sectionStatus[3]}
              sectionClosed={sectionClosed["Verification"]}
              info={info}
              errors={errors}
              onChange={onChange}
              onBack={() => onBack("Verification")}
              onNext={() => onNext("Verification")}
              defaultApply={defaultApply}
            />
            <Confirmation
              sectionStatus={sectionStatus[4]}
              sectionClosed={sectionClosed["Confirmation"]}
              info={info}
              errors={errors}
              onBack={() => onBack("Confirmation")}
              onChange={onChange}
              onSubmit={onSubmit}
              submissionPending={submissionPending}
            />
          </form>
          <p>
            <Link to="/">Return Home</Link>
          </p>
        </div>
        <div className={styles.panel}>
          {defaultApply === "tutor" ? (
            <>
              <h2>Share your passion and expertise.</h2>
              <p>Sign up as a tutor now. </p>
              <p>
                <Link to="/signup">
                  Click here to sign up as a student instead.
                </Link>
              </p>
              <TutorImg width="600px" />
            </>
          ) : (
            <>
              <h2>Today is another chance to get better.</h2>
              <p>Sign up as a student now.</p>
              <p>
                <Link to="/signup/tutors">
                  Click here to sign up as a tutor instead.
                </Link>
              </p>
              <TuteeImg width="600px" />
            </>
          )}
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
    </GoogleOAuthProvider>
  );
}

export default Signups;
