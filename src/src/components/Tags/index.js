import styled from "styled-components";

const StyledTags = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin: 5px 0;
`;

const StyledTag = styled.div`
  margin-right: 10px;
  margin-bottom: 5px;
  padding: 5px 12px;
  border-radius: 3px;
  background: #ff8686;
  color: #000;
  font-size: 0.8rem;
  p {
    margin: 0;
  }
`;

const Tags = ({ tags = [], color = "#a9e4f5" }) => {
  return (
    <StyledTags>
      {tags.map((tag, i) => (
        <StyledTag key={i} style={{ backgroundColor: color }}>
          <p>{tag}</p>
        </StyledTag>
      ))}
    </StyledTags>
  );
};

export default Tags;
