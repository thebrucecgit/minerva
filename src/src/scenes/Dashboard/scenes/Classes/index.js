import React, { useState } from "react";
import { loader } from "graphql.macro";
import { useQuery, useMutation } from "@apollo/react-hooks";
import ClassSection from "./components/ClassSection";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import Loader from "../../../../components/Loader";

import Modal from "../../../../components/Modal";
import useModal from "../../hooks/useModal";
import styles from "./styles.module.scss";

const GET_CLASSES = loader("./graphql/GetClasses.gql");
const NEW_CLASS = loader("./graphql/NewClass.gql");

let newClassToastId = null;

const Classes = () => {
  const history = useHistory();

  const { data, error, loading } = useQuery(GET_CLASSES);
  const [createClassReq] = useMutation(NEW_CLASS);

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
      history.replace(`/dashboard/class/${data._id}`);
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

  if (error) return <p className="error">{error.message}</p>;
  if (loading) return <Loader />;

  const classes = data.getClasses;

  return (
    <div className={styles.Classes}>
      <h1>Classes</h1>
      <div className={styles.classes_grid}>
        {classes.map((classInfo, ind) => (
          <ClassSection classInfo={classInfo} key={ind} />
        ))}
      </div>
      <button className="btn" onClick={openNewClass}>
        New Class
      </button>
      <Modal {...newClassBinds}>
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
      </Modal>
    </div>
  );
};

export default Classes;
