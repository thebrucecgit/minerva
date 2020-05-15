import React from "react";

import styles from "../../class.module.scss";

const Autocomplete = ({
  autocomplete,
  onAutocompleteChange,
  suggestions,
  selectSuggestion,
  userInfo,
  addUser,
  userType,
}) => {
  const id = `add${userType}`;

  return (
    <>
      <label htmlFor={id}>Add {userType}: </label>
      <div className={styles.autocomplete}>
        <input
          type="text"
          name={id}
          id={id}
          placeholder="Enter name or email"
          value={autocomplete}
          onChange={onAutocompleteChange}
        />
        <div className={styles.suggestions}>
          {suggestions.map((user) => (
            <div
              className={styles.suggestion}
              onClick={selectSuggestion}
              data-id={user._id}
              key={user._id}
            >
              <div className={styles.userName}>{user.name}</div>
              {user.email}
            </div>
          ))}
        </div>
      </div>
      <button className="btn" disabled={!userInfo} onClick={addUser}>
        Add
      </button>
    </>
  );
};

export default Autocomplete;
