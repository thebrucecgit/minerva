import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenAlt, faSave, faTimes } from "@fortawesome/free-solid-svg-icons";

const StyledEdit = styled.div`
  display: flex;
  justify-content: flex-end;
  margin: 10px 1.5rem;

  button {
    margin: 0 0 0 10px;
  }
`;

const EditButton = ({
  disabled,
  startEdit,
  saveInfo,
  cancelEdit,
  editEnabled,
}) => {
  return ({ type, editEnabled: enabledOverride }) => {
    const onCancel = () => {
      if (Array.isArray(type)) type.forEach((t) => cancelEdit(t));
      cancelEdit(type);
    };
    const onEdit = () => {
      if (Array.isArray(type)) type.forEach((t) => startEdit(t));
      startEdit(type);
    };
    const onSave = () => {
      saveInfo(type);
    };

    if (enabledOverride ?? editEnabled)
      return (
        <StyledEdit>
          {(Array.isArray(type) ? disabled[type[0]] : disabled[type]) ? (
            <button className="btn small" onClick={onEdit}>
              <FontAwesomeIcon icon={faPenAlt} />
            </button>
          ) : (
            <>
              <button className="btn small" onClick={onCancel}>
                <FontAwesomeIcon icon={faTimes} size="lg" />
              </button>
              <button className="btn small" onClick={onSave}>
                <FontAwesomeIcon icon={faSave} />
              </button>
            </>
          )}
        </StyledEdit>
      );
    return null;
  };
};

export default EditButton;
