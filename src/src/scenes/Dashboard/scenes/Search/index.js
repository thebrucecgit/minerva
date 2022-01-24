import React from "react";
import algoliasearch from "algoliasearch/lite";
import {
  InstantSearch,
  Stats,
  Configure,
  PoweredBy,
} from "react-instantsearch-dom";

import SearchBox from "./components/SearchBox";
import InfiniteHits from "./components/InfiniteHits";
import RefinementList from "./components/RefinementList";
import Menu from "./components/Menu";

import "instantsearch.css/themes/reset.css";
import "./styles.scss";

const { REACT_APP_ALGOLIA_APPID, REACT_APP_ALGOLIA_INDEX_NAME } = process.env;

const Search = ({ currentUser }) => {
  const searchClient = algoliasearch(
    REACT_APP_ALGOLIA_APPID,
    currentUser.algoliaKey
  );

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
          </div>
          <div>
            <Configure hitsPerPage={9} />
            <SearchBox autoFocus />
            <PoweredBy />
            <Stats />
            <InfiniteHits currentUser={currentUser} />
          </div>
        </div>
      </InstantSearch>
    </div>
  );
};

export default Search;
