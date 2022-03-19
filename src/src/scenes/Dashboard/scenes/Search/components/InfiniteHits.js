import React from "react";
import { connectInfiniteHits } from "react-instantsearch-dom";
import styled from "styled-components";
import Hit from "./Hit";
import mediaQuery from "styles/sizes";

const StyledHits = styled.ul`
  list-style-type: none;
  padding: 0 1.5rem;
  display: grid;
  grid-gap: 1.5rem;
  ${mediaQuery("sm")`
    grid-template-columns: repeat(2, 1fr);
  `}
  ${mediaQuery("lg")`
    grid-template-columns: repeat(3, 1fr);
  `}
`;

const InfiniteHits = connectInfiniteHits(
  ({ hits, hasPrevious, refinePrevious, hasMore, refineNext, currentUser }) => (
    <div>
      {hasPrevious && <button onClick={refinePrevious}>Show previous</button>}
      <StyledHits className="ais-InfiniteHits-list">
        {hits.map((hit) => (
          <Hit key={hit.objectID} hit={hit} currentUser={currentUser} />
        ))}
      </StyledHits>
      <button
        disabled={!hasMore}
        onClick={refineNext}
        className="btn ais-loadMore"
      >
        Show more
      </button>
    </div>
  )
);

export default InfiniteHits;
