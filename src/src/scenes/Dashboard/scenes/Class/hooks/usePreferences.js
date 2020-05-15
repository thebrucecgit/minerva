const usePreferences = ({ setUpdate, closeModal }) => {
  const onChange = (e) => {
    e.persist();

    const { target } = e;
    setUpdate((st) => {
      const newState = { ...st };
      if (!st.preferences) newState.preferences = {};
      newState.preferences[target.name] =
        target.type === "checkbox" ? target.checked : target.value;

      return newState;
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    closeModal("preferences");
  };

  return { onChange, onSubmit };
};

export default usePreferences;
