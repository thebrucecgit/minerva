import React from "react";
import algoliasearch from "algoliasearch/lite";
import {
  InstantSearch,
  Stats,
  Configure,
  PoweredBy,
  SortBy,
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
            <RefinementList attribute="type" />
            <RefinementList attribute="academics" />
            <RefinementList attribute="curricula" />
            <SortBy
              defaultRefinement={REACT_APP_ALGOLIA_INDEX_NAME}
              items={[
                {
                  value: REACT_APP_ALGOLIA_INDEX_NAME,
                  label: "Default",
                },
                {
                  value: `${REACT_APP_ALGOLIA_INDEX_NAME}_price_desc`,
                  label: "Sort by highest price",
                },
                {
                  value: `${REACT_APP_ALGOLIA_INDEX_NAME}_price_asc`,
                  label: "Sort by lowest price",
                },
              ]}
            />
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
