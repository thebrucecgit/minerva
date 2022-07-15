import styled, { keyframes } from "styled-components";

const cubeGridScaleDisplay = keyframes`
  0%,
  70%,
  100% {
    transform: scale3D(1, 1, 1);
  }
  35% {
    transform: scale3D(0, 0, 1);
  }
`;

const delayedDisplay = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const CubeWrapper = styled.div`
  margin: 4rem;
  width: 100%;
  height: 100%;

  display: flex;
  justify-content: center;
  align-items: center;
  animation: ${delayedDisplay} ${(props) => (props.instant ? "0" : "500ms")}
    steps(1);
`;

const SkCubeGrid = styled.div`
  width: 90px;
  height: 90px;

  > div {
    width: 33%;
    height: 33%;
    background-color: #333;
    float: left;
    animation: ${cubeGridScaleDisplay} 1.3s infinite ease-in-out;
  }

  .skCube1 {
    animation-delay: 0.2s;
  }
  .skCube2 {
    animation-delay: 0.3s;
  }
  .skCube3 {
    animation-delay: 0.4s;
  }
  .skCube4 {
    animation-delay: 0.1s;
  }
  .skCube5 {
    animation-delay: 0.2s;
  }
  .skCube6 {
    animation-delay: 0.3s;
  }
  .skCube7 {
    animation-delay: 0s;
  }
  .skCube8 {
    animation-delay: 0.1s;
  }
  .skCube9 {
    animation-delay: 0.2s;
  }
`;

export default function Loader({ instant = false }) {
  return (
    <CubeWrapper instant={instant}>
      <SkCubeGrid>
        {[...Array(9)].map((_, i) => (
          <div className={`skCube${i + 1}`} key={i}></div>
        ))}
      </SkCubeGrid>
    </CubeWrapper>
  );
}
