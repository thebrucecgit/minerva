import React from "react";
import { Highlight } from "react-instantsearch-dom";
import { Link } from "react-router-dom";
import ProfilePicture from "../../../components/ProfilePicture";
import Tags from "../../../../../components/Tags";
import DMButton from "../../../components/DMButton";

const Hit = ({ hit, currentUser }) => {
  return (
    <div className="card square">
      <Link to={`/dashboard/tutors/${hit.objectID}`}>
        <ProfilePicture pfp={hit.pfp} alt={hit.name} />
      </Link>
      <div className="body">
        <Link to={`/dashboard/tutors/${hit.objectID}`}>
          <h3>
            <Highlight hit={hit} attribute="name" tagName="mark" />
          </h3>
        </Link>
        <p className="details">
          <Highlight hit={hit} attribute="school" tagName="mark" /> · Year{" "}
          {hit.yearGroup}
        </p>
        <Tags tags={hit.academics} />
        <Tags tags={hit.extras} />
        <div className="bio">
          <Highlight hit={hit} attribute="biography" tagName="mark" />
        </div>
        {hit.objectID !== currentUser.user._id && (
          <DMButton id={hit.objectID} expanded />
        )}
      </div>
    </div>
  );
};

export default Hit;
