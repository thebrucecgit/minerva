import { GoogleLogin } from "@react-oauth/google";
import StatusSymbol from "../StatusSymbol";

import { SignupHeader, SignupContent, ErrorText } from "../../styles";

const SignIn = ({
  sectionStatus,
  sectionClosed,
  errors,
  onNext,
  onGoogleSignIn,
}) => {
  return (
    <section>
      <SignupHeader>
        <h3>Sign Up</h3>
        <StatusSymbol state={sectionStatus} />
      </SignupHeader>
      <SignupContent closed={sectionClosed}>
        <p>Select your method:</p>

        <ErrorText>{errors.signIn}</ErrorText>

        <button className="btn" onClick={onNext}>
          Sign up with email
        </button>

        <GoogleLogin onSuccess={onGoogleSignIn} text="signup_with" />
      </SignupContent>
    </section>
  );
};

export default SignIn;
