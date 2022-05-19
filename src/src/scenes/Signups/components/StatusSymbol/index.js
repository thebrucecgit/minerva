import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";

import { Status } from "../../styles";

const StatusSymbol = ({ state }) => {
  if (state === null) return null;
  return (
    <Status valid={state}>
      <FontAwesomeIcon icon={state ? faCheck : faTimes} />
    </Status>
  );
};

export default StatusSymbol;
