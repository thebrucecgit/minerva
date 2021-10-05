const gold = "255, 218, 10";

const scrollbar = `
::-webkit-scrollbar {
  background: rgba(${gold}, 0.2);
  height: 4px;
  width: 8px;

  &:disabled {
    background: transparent;
  }
}

::-webkit-scrollbar-track {
  height: 20px;
  width: 20px;
}

::-webkit-scrollbar-thumb {
  background: rgba(${gold}, 0.6);
  border-radius: 20px;

  &:hover {
    background: rgba(${gold}, 0.75);
  }

  &:active {
    background: rgba(${gold}, 0.9);
  }
}
`;

export default scrollbar;
