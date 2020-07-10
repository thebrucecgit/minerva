import React, { useState } from "react";
import { loader } from "graphql.macro";
import { useQuery, useMutation } from "@apollo/react-hooks";
import ClassSection from "./components/ClassSection";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import Loader from "../../../../components/Loader";
import Error from "../../../../components/Error";

import Modal from "../../../../components/Modal";
import useModal from "../../hooks/useModal";
import styles from "./styles.module.scss";
import general from "../../class.module.scss";

const GET_CLASSES = loader("./graphql/GetClasses.gql");
const CREATE_CLASS = loader("./graphql/CreateClass.gql");

let newClassToastId = null;

const Classes = ({ currentUser }) => {
  const history = useHistory();

  const { data, error, loading } = useQuery(GET_CLASSES);
  const [createClassReq] = useMutation(CREATE_CLASS);

  const [inputs, setInputs] = useState({});
  const [openNewClass, newClassBinds] = useModal(false);

  const onInputChange = (e) => {
    e.persist();
    setInputs((st) => ({
      ...st,
      [e.target.name]: e.target.value,
    }));
  };

  const createClass = async (e) => {
    e.preventDefault();
    try {
      newClassToastId = toast("Creating new class...", { autoClose: false });
      const { data } = await createClassReq({ variables: inputs });
      console.log(data);
      history.replace(`/dashboard/classes/${data.createClass._id}`);
      toast.update(newClassToastId, {
        render: "Successfully created class",
        type: toast.TYPE.SUCCESS,
        autoClose: 2000,
      });
    } catch (e) {
      console.error(e);
      toast.update(newClassToastId, {
        render: e.message,
        type: toast.TYPE.ERROR,
        autoClose: 5000,
      });
    }
  };

  if (error) return <Error error={error} />;
  if (loading) return <Loader />;

  const classes = data.getClasses;

  return (
    <div className={styles.Classes}>
      <h1>Classes</h1>
      <div className={styles.classes_grid}>
        {classes.length ? (
          classes.map((classInfo, ind) => (
            <ClassSection classInfo={classInfo} key={ind} />
          ))
        ) : (
          <p>You are not part of any class.</p>
        )}
      </div>

      {currentUser.user.userType === "TUTOR" && (
        <button className="btn" onClick={openNewClass}>
          New Class
        </button>
      )}

      <Modal {...newClassBinds}>
        <div className={general.padding}>
          <h2>New Class</h2>
          <form onSubmit={createClass}>
            <label htmlFor="name">Give it a name: </label>
            <input
              type="text"
              name="name"
              id="name"
              value={inputs.name ?? ""}
              onChange={onInputChange}
            />
            <button className="btn">Create Class</button>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default Classes;
