import React, { useState } from "react";
import { connectSearchBox } from "react-instantsearch-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

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

export default SearchBox;
