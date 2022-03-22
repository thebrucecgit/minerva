import React from "react";
import { Highlight } from "react-instantsearch-dom";
import { Link } from "react-router-dom";
import ProfilePicture from "../../../components/ProfilePicture";
import Tags from "../../../../../components/Tags";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignal } from "@fortawesome/free-solid-svg-icons";

const TutorCard = styled.div`
  img {
    object-fit: cover;
    width: 100%;
  }
  overflow: hidden;
  box-shadow: 0 0 10px rgba(29, 107, 255, 0.1);
  transition: all 200ms ease;
  &:hover {
    box-shadow: 0 0 10px rgba(29, 107, 255, 0.2);
    border-radius: 20px;
  }
`;

const TutorBody = styled.div`
  padding: 1rem;
  h3 {
    font-size: 1.3rem;
    margin: 0;
  }
`;

const TutorEdu = styled.div`
  margin: 1rem 0;
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
            <Highlight hit={hit} attribute="name" tagName="mark" /> · $
            {hit.price} {hit.online && <FontAwesomeIcon icon={faSignal} />}
          </h3>
        </Link>
        <TutorEdu>
          <em>
            {hit.online && "Online"}
            {hit.online && hit.location && " & "}
            {hit.location}
          </em>
        </TutorEdu>
        <TutorEdu>
          {hit.school === currentUser.user.school ? (
            <strong>
              <Highlight hit={hit} attribute="school" tagName="mark" />
            </strong>
          ) : (
            <Highlight hit={hit} attribute="school" tagName="mark" />
          )}
          , {hit.yearGroup}
        </TutorEdu>

        <p>
          {hit.biography?.slice(0, 120)}
          {hit.biography?.length > 120 && "..."}
        </p>
        <Tags tags={hit.academics} color="#a9e4f5" />
        <Tags tags={hit.curricula} color="#a6baf4" />
      </TutorBody>
    </TutorCard>
  );
};

export default Hit;
