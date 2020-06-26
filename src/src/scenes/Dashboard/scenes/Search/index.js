import React from "react";
import algoliasearch from "algoliasearch/lite";
import {
  InstantSearch,
  SearchBox,
  InfiniteHits,
  Highlight,
} from "react-instantsearch-dom";

const {
  REACT_APP_ALGOLIA_APPID,
  REACT_APP_ALGOLIA_API_KEY,
  REACT_APP_ALGOLIA_INDEX_NAME,
} = process.env;
const searchClient = algoliasearch(
  REACT_APP_ALGOLIA_APPID,
  REACT_APP_ALGOLIA_API_KEY
);

const Hit = ({ hit }) => {
  return (
    <div>
      <h2>
        <Highlight hit={hit} attribute="name" />
      </h2>
      <p>{JSON.stringify(hit._highlightResult)}</p>
    </div>
  );
};

const Search = () => {
  return (
    <InstantSearch
      searchClient={searchClient}
      indexName={REACT_APP_ALGOLIA_INDEX_NAME}
    >
      <SearchBox />
      <InfiniteHits hitComponent={Hit} />
    </InstantSearch>
  );
};

export default Search;
