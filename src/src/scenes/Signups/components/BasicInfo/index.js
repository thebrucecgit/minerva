import { Image, Transformation } from "cloudinary-react";

import StatusSymbol from "../StatusSymbol";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { SignupHeader, SignupContent, ErrorText } from "scenes/Signups/styles";

const BasicInfo = ({
  sectionStatus,
  sectionClosed,
  strategy,
  errors,
  info,
  uploadImage,
  defaultApply,
  onChange,
  onBack,
  onNext,
}) => {
  return (
    <section>
      <SignupHeader>
        <h3>Basic Info</h3>
        <StatusSymbol state={sectionStatus} />
      </SignupHeader>
      <SignupContent closed={sectionClosed}>
        <button className="btn" onClick={onBack} data-test="basic-info-back">
          Back <FontAwesomeIcon icon={faChevronLeft} />
        </button>

        <div>
          <label htmlFor="name">Full Name:</label>
          <ErrorText>{errors.name}</ErrorText>
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

        <div>
          <label htmlFor="email">Email:</label>
          <ErrorText>{errors.email}</ErrorText>
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
          <div>
            <label htmlFor="password">Password:</label>
            <ErrorText>{errors.password}</ErrorText>
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

        {defaultApply === "tutor" && (
          <div>
            <label htmlFor="pfp">Picture:</label>
            {info.pfp?.type &&
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
              {info.pfp?.type ? "Change" : "Upload"}
            </button>
          </div>
        )}

        <button className="btn" onClick={onNext} data-test="basic-info-next">
          Next <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </SignupContent>
    </section>
  );
};

export default BasicInfo;
