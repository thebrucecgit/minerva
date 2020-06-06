const usePreferences = ({ saveInfo, setUpdate, name }) => {
  const onChange = (e) => {
    e.persist();

    const { target } = e;
    setUpdate((st) => {
      const newState = { ...st };
      if (!st[name]) newState[name] = {};
      newState[name][target.name] =
        target.type === "checkbox" ? target.checked : target.value;

      return newState;
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    saveInfo(name, { resetUpdate: false });
  };

  return { onChange, onSubmit };
};

export default usePreferences;
