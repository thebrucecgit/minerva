import React from "react";
import algoliasearch from "algoliasearch/lite";
import {
  InstantSearch,
  Configure,
  SortBy,
  MenuSelect,
  connectToggleRefinement,
} from "react-instantsearch-dom";
import styled from "styled-components";

// import SearchBox from "./components/SearchBox";
import InfiniteHits from "./components/InfiniteHits";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import geometryImg from "media/geometry.png";

import "instantsearch.css/themes/reset.css";
import "./styles.scss";

const { REACT_APP_ALGOLIA_APPID, REACT_APP_ALGOLIA_INDEX_NAME } = process.env;

const Header = styled.h1`
  color: #0d1b2a;
`;

const Selections = styled.div`
  background-image: url(${geometryImg});
  display: flex;
  flex-wrap: wrap;
  column-gap: 1.5rem;
  padding: 1.5rem;
  box-shadow: 0 0 10px rgba(29, 107, 255, 0.1);
  > span {
    min-width: 200px;
    flex-basis: 200px;
    flex-grow: 1;
  }
  select {
    background-color: white;
  }
`;

const SideRefinements = styled.div`
  display: flex;
  flex-wrap: wrap;
  column-gap: 1.5rem;
  margin: 1rem 1.5rem;
  > span {
    margin: 0 0 0 auto;
  }
`;

const StyledSortBy = styled(SortBy)`
  display: inline-block;
  width: 200px;
`;

const ToggleRefinement = connectToggleRefinement(
  ({ currentRefinement, label, refine, attribute }) => {
    return (
      <div className="checkbox">
        <input
          type="checkbox"
          name={attribute}
          id={attribute}
          checked={currentRefinement}
          onChange={() => refine(!currentRefinement)}
          noValidate
        />
        <label htmlFor={attribute}>{label}</label>
      </div>
    );
  }
);

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
          <Header>
            <FontAwesomeIcon icon={faSearch} /> Tutor Search
          </Header>
          <Configure hitsPerPage={12} />
          {/* <SearchBox autoFocus /> */}
          <Selections>
            <span>
              Curricula <MenuSelect attribute="curricula" />
            </span>
            <span>
              Subjects <MenuSelect attribute="academics" />
            </span>
            <span>
              Locations <MenuSelect attribute="location" />
            </span>
          </Selections>

          <SideRefinements>
            <ToggleRefinement
              attribute="school"
              label="Only show tutors at my school"
              value={currentUser.user.school}
              defaultRefinement={false}
            />
            <ToggleRefinement
              attribute="online"
              label="Only show tutors that can be online"
              value={true}
              defaultRefinement={false}
            />
            <span>
              Sort by:{" "}
              <StyledSortBy
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
            </span>
          </SideRefinements>

          <InfiniteHits currentUser={currentUser} />
        </div>
      </InstantSearch>
    </div>
  );
};

export default Search;
