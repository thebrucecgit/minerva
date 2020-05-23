const useEdits = ({ info, setUpdate, setDisabled }) => {
  const startEdit = (name) => {
    setUpdate((st) => ({
      ...st,
      [name]:
        typeof info[name] === "object"
          ? Array.isArray(info[name])
            ? [...info[name]]
            : { ...info[name] }
          : info[name],
    }));
    setDisabled((st) => ({
      ...st,
      [name]: false,
    }));
  };

  const cancelEdit = (name) => {
    setUpdate((st) => ({
      ...st,
      [name]: "",
    }));
    setDisabled((st) => ({
      ...st,
      [name]: true,
    }));
  };

  return [startEdit, cancelEdit];
};

export default useEdits;
