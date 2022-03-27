import React from "react";
import ProfilePicture from "../../components/ProfilePicture";
import { useParams } from "react-router-dom";
import Loader from "../../../../components/Loader";
import Error from "../../../../components/Error";
import { useQuery } from "@apollo/client";
import { loader } from "graphql.macro";
import DMButton from "../../components/DMButton";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faGraduationCap,
  faSchool,
  faMapMarker,
} from "@fortawesome/free-solid-svg-icons";

import Tags from "../../../../components/Tags";

import styled from "styled-components";
import mediaQuery from "styles/sizes";

const GET_USER = loader("./graphql/GetUser.gql");

const Header = styled.div`
  background: #161925;
  display: flex;
  margin-bottom: 4rem;
  flex-direction: column;

  ${mediaQuery("md")`
    flex-direction: row;
  `}

  img {
    margin-left: auto;
    ${mediaQuery("md")`
      align-self: flex-end;
      margin-right: -20px;
      margin-bottom: -20px;
    `}
    width: 100%;
    height: auto;
    max-width: 350px;
  }
`;

const Bar = styled.div`
  color: #fff;
  padding: 3rem;
  text-transform: uppercase;
  h1 {
    font-size: 6rem;
    margin: 0;
  }
`;

const Description = styled.p`
  font-size: 1.2rem;
`;

const UserInfo = styled.div`
  margin-bottom: 4rem;

  ${mediaQuery("md")`
    display: grid;
    grid-template-columns: 65% 35%;
    column-gap: 1rem;
  `}
`;

const Biography = styled.div`
  padding: 3rem;
  background-color: #f7f7f7;
  box-shadow: 20px 20px #23395b;
`;

const UserDetails = styled.div`
  padding: 3rem;
  h3 {
    margin-top: 0;
  }
`;

const Price = styled.h3`
  font-size: 2rem;
`;

const StyledTags = styled.div`
  display: flex;
  margin-bottom: 1rem;
  column-gap: 1rem;
`;

const User = ({ currentUser }) => {
  const { id } = useParams();

  const { data, error, loading } = useQuery(GET_USER, { variables: { id } });

  if (error) return <Error error={error} />;
  if (loading) return <Loader />;

  const user = data.getUser;

  return (
    <div className="container">
      <Header>
        <Bar>
          <h1>
            {user.name.split(" ").map((s, i) => (
              <div key={i}>{s}</div>
            ))}
          </h1>
          <Description>
            {user.yearGroup} at {user.school}
          </Description>
        </Bar>
        <ProfilePicture pfp={user.pfp} alt={user.name} width="350" />
      </Header>
      <UserInfo>
        <Biography>
          <p>{user.biography}</p>
        </Biography>

        <UserDetails>
          <Price>${user.tutor?.price} per hour</Price>

          {user.tutor?.academicsTutoring?.length > 0 && (
            <StyledTags>
              <FontAwesomeIcon icon={faGraduationCap} size="2x" fixedWidth />
              <Tags tags={user.tutor.academicsTutoring} />
            </StyledTags>
          )}

          {user.tutor?.curricula?.length > 0 && (
            <StyledTags>
              <FontAwesomeIcon icon={faSchool} size="2x" fixedWidth />
              <Tags color="#a6baf4" tags={user.tutor.curricula} />
            </StyledTags>
          )}

          {user.tutor?.online && (
            <p>
              <FontAwesomeIcon icon={faCheck} fixedWidth /> Can tutor online
            </p>
          )}
          {user.tutor?.location && (
            <p>
              <FontAwesomeIcon icon={faMapMarker} fixedWidth /> Can tutor in{" "}
              {user.tutor.location}
            </p>
          )}

          {currentUser.user._id !== user._id && (
            <DMButton id={user._id} expanded />
          )}
        </UserDetails>
      </UserInfo>
    </div>
  );
};

export default User;
