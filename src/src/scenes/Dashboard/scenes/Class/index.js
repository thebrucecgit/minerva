import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";

import EditButton from "../../components/EditButton";
import Column from "./components/Column";
import Content from "./components/Content";

import styles from "../../class.module.scss";

const GET_CLASS = gql`
  query GetClass($id: ID!) {
    getClass(id: $id) {
      _id
      name
      sessions {
        _id
        time
      }
      tutees {
        _id
        name
      }
      tutors {
        _id
        name
        pfp
      }
      description
      location {
        address
        coords {
          lat
          lng
        }
      }
      pricePerTutee
      tags
      date
      image
    }
  }
`;

const UPDATE_CLASS = gql`
  mutation UpdateClass(
    $id: ID!
    $name: String!
    $location: LocationIn
    $description: String
    $tutors: [ID!]
  ) {
    updateClass(
      id: $id
      name: $name
      description: $description
      tutors: $tutors
      location: $location
    ) {
      _id
      name
      description
      location {
        address
        coords {
          lat
          lng
        }
      }
      tutors {
        _id
        name
        pfp
      }
    }
  }
`;

let toastId = null;

const Class = ({ currentUser }) => {
  const { id } = useParams();

  const [classInfo, setClassInfo] = useState({
    description: { ops: [] },
  });

  const [disabled, setDisabled] = useState({
    name: true,
    description: true,
    tutors: true,
    date: true,
    sessions: true,
    location: true,
  });

  const { loading, error, data } = useQuery(GET_CLASS, {
    variables: { id },
  });

  const [updateClass] = useMutation(UPDATE_CLASS);

  useEffect(() => {
    if (data) {
      setClassInfo((st) => ({
        ...st,
        ...data.getClass,
        description: JSON.parse(data.getClass.description),
      }));
    }
  }, [data]);

  const saveInfo = async () => {
    try {
      toastId = toast("Updating class...", { autoClose: false });
      const info = await updateClass({
        variables: {
          description: JSON.stringify(classInfo.description),
          name: classInfo.name,
          location: classInfo.location,
          tutors: classInfo.tutors.map((tutor) => tutor._id),
          id,
        },
      });
      setClassInfo((st) => ({
        ...st,
        ...info.updateClass,
      }));
      toast.update(toastId, {
        render: "Successfully updated",
        type: toast.TYPE.SUCCESS,
        autoClose: 5000,
      });
    } catch (e) {
      toast.update(toastId, {
        render: e.message,
        type: toast.TYPE.ERROR,
        autoClose: 5000,
      });
    }
  };

  const onInfoChange = (e) => {
    e.persist();
    setClassInfo((st) => ({
      ...st,
      [e.target.name]: e.target.value,
    }));
  };

  const toggleDisabled = async (name) => {
    if (!disabled[name]) saveInfo();
    setDisabled((st) => {
      // if saving
      return {
        ...st,
        [name]: !st[name],
      };
    });
  };

  const Edit = EditButton({ currentUser, disabled, toggleDisabled });

  if (error) return error.message;
  if (loading || !classInfo.name) return null;

  return (
    <div className={styles.Class}>
      <Content
        Edit={Edit}
        disabled={disabled}
        classInfo={classInfo}
        setClassInfo={setClassInfo}
        onInfoChange={onInfoChange}
      />
      <Column
        Edit={Edit}
        disabled={disabled}
        classInfo={classInfo}
        setClassInfo={setClassInfo}
      />
    </div>
  );
};

export default Class;
