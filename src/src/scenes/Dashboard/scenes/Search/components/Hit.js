import React from "react";
import { Highlight } from "react-instantsearch-dom";
import { Link } from "react-router-dom";
import ProfilePicture from "../../../components/ProfilePicture";
import Tags from "../../../../../components/Tags";
import styled from "styled-components";

const TutorCard = styled.div`
  img {
    object-fit: cover;
    width: 100%;
  }
  border-radius: 5px;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const TutorBody = styled.div`
  padding: 1rem;
  h3 {
    margin: 0;
  }
`;

const Hit = ({ hit, currentUser }) => {
  return (
    <TutorCard>
      <Link to={`/dashboard/tutors/${hit.objectID}`}>
        <ProfilePicture pfp={hit.pfp} alt={hit.name} />
      </Link>
      <TutorBody>
        <Link to={`/dashboard/tutors/${hit.objectID}`}>
          <h3>
            <Highlight hit={hit} attribute="name" tagName="mark" /> ·{" "}
            {hit.price > 0 ? `$${hit.price}` : "Gratis"}
          </h3>
        </Link>
        <p className="details">
          <Highlight hit={hit} attribute="school" tagName="mark" /> ·{" "}
          {hit.yearGroup} · {hit.type}
        </p>
        <Tags tags={hit.academics} color="#a9e4f5" />
        <Tags tags={hit.curricula} color="#a6baf4" />
      </TutorBody>
    </TutorCard>
  );
};

export default Hit;
