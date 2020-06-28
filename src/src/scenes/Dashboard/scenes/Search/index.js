import React, { useState } from "react";
import algoliasearch from "algoliasearch/lite";
import {
  InstantSearch,
  connectSearchBox,
  Highlight,
  Stats,
  connectInfiniteHits,
} from "react-instantsearch-dom";
import ProfilePicture from "../../components/ProfilePicture";
import Tags from "../../components/Tags";

import "instantsearch.css/themes/reset.css";
import "./styles.scss";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
const {
  REACT_APP_ALGOLIA_APPID,
  REACT_APP_ALGOLIA_API_KEY,
  REACT_APP_ALGOLIA_INDEX_NAME,
} = process.env;
const searchClient = algoliasearch(
  REACT_APP_ALGOLIA_APPID,
  REACT_APP_ALGOLIA_API_KEY
);

const SearchBox = connectSearchBox(({ isSearchStalled, refine }) => {
  const [searchValue, setSearchValue] = useState("");

  const handleChange = (e) => {
    setSearchValue(e.currentTarget.value);
    refine(e.currentTarget.value);
  };

  const search = (e) => {
    e.preventDefault();
    refine(searchValue);
  };

  return (
    <form
      noValidate
      onSubmit={search}
      role="search"
      className="ais-SearchBox-form"
    >
      <input
        type="search"
        value={searchValue}
        onChange={handleChange}
        className="ais-SearchBox-input"
      />
      <button className="btn small secondary">
        <FontAwesomeIcon icon={faSearch} />
      </button>
      {isSearchStalled && "My search is stalled"}
    </form>
  );
});

const Hit = ({ hit }) => {
  return (
    <div className="card">
      <ProfilePicture pfp={hit.pfp} alt={hit.name} />
      <div className="body">
        <h3>
          <Highlight hit={hit} attribute="name" tagName="mark" />
        </h3>
        <p className="details">
          <Highlight hit={hit} attribute="school" tagName="mark" /> · Year{" "}
          {hit.yearGroup}
        </p>
        <Tags tags={hit.academics} />
        <Tags tags={hit.extras} />
        <div className="bio">
          <Highlight hit={hit} attribute="biography" tagName="mark" />
        </div>
      </div>
    </div>
  );
};

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

const Search = () => {
  return (
    <div className="container">
      <InstantSearch
        searchClient={searchClient}
        indexName={REACT_APP_ALGOLIA_INDEX_NAME}
      >
        <SearchBox autoFocus />
        <Stats />
        <InfiniteHits hitComponent={Hit} />
      </InstantSearch>
    </div>
  );
};

export default Search;
