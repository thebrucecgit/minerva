import { Link } from "react-router-dom";
import logo from "../../media/logo.png";
import styled from "styled-components";

const StyledNavbar = styled.nav`
  position: relative;
  display: flex;
  padding: 10px 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  a {
    display: flex;
    align-items: flex-end;
    img {
      height: 2.3em;
      margin-right: 0.5em;
    }
    h1 {
      color: #000;
      font-size: 2em;
      font-weight: 400;
      margin: 0;
    }
  }
`;

function Navbar() {
  return (
    <StyledNavbar>
      <Link to="/">
        <img src={logo} alt="Minerva Logo" />
      </Link>
    </StyledNavbar>
  );
}

export default Navbar;
