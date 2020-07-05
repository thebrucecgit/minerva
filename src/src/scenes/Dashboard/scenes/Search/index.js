import React from "react";
import algoliasearch from "algoliasearch/lite";
import { InstantSearch, Stats, Configure } from "react-instantsearch-dom";

import SearchBox from "./components/SearchBox";
import InfiniteHits from "./components/InfiniteHits";
import RefinementList from "./components/RefinementList";
import Menu from "./components/Menu";

import "instantsearch.css/themes/reset.css";
import "./styles.scss";

const {
  REACT_APP_ALGOLIA_APPID,
  REACT_APP_ALGOLIA_API_KEY,
  REACT_APP_ALGOLIA_INDEX_NAME,
} = process.env;
const searchClient = algoliasearch(
  REACT_APP_ALGOLIA_APPID,
  REACT_APP_ALGOLIA_API_KEY
);

const Search = () => {
  return (
    <div className="container">
      <InstantSearch
        searchClient={searchClient}
        indexName={REACT_APP_ALGOLIA_INDEX_NAME}
      >
        <div className="ais-SearchPage">
          <div className="ais-Refinements">
            <Menu attribute="school" />
            <RefinementList attribute="academics" />
            <RefinementList attribute="extras" />
          </div>
          <div>
            <Configure hitsPerPage={3} />
            <SearchBox autoFocus />
            <Stats />
            <InfiniteHits />
          </div>
        </div>
      </InstantSearch>
    </div>
  );
};

export default Search;
