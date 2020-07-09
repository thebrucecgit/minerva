import React from "react";
import { connectRefinementList } from "react-instantsearch-dom";

const RefinementList = connectRefinementList(({ items, refine, attribute }) => {
  return (
    <form>
      <h3>{attribute.toUpperCase()}</h3>
      {items.map((item) => (
        <div className="field checkbox" key={item.label}>
          <input
            type="checkbox"
            name={item.label}
            id={item.label}
            checked={item.isRefined}
            onChange={() => {
              refine(item.value);
            }}
          />
          <label htmlFor={item.label}>
            {item.label} ({item.count})
          </label>
        </div>
      ))}
    </form>
  );
});

export default RefinementList;
