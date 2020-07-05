import React from "react";
import { connectInfiniteHits } from "react-instantsearch-dom";
import Hit from "./Hit";

const InfiniteHits = connectInfiniteHits(
  ({ hits, hasPrevious, refinePrevious, hasMore, refineNext }) => (
    <div>
      {hasPrevious && <button onClick={refinePrevious}>Show previous</button>}
      <ul className="ais-InfiniteHits-list">
        {hits.map((hit) => (
          <Hit key={hit.objectID} hit={hit} />
        ))}
      </ul>
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
