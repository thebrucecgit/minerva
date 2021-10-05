import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";

const Toggle = styled(FontAwesomeIcon)`
  position: fixed;
  z-index: 3;
  margin: 1rem;
  font-size: 2rem;
`;

export default function AppbarToggle({ toggleAppbar }) {
  return <Toggle icon={faBars} onClick={toggleAppbar} />;
}
