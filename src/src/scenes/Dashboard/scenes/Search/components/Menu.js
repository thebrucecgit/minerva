import React from "react";
import classNames from "classnames";
import { connectMenu } from "react-instantsearch-dom";

const Menu = connectMenu(({ items, refine, attribute }) => {
  return (
    <form className="ais-Menu">
      <h3>{attribute.toUpperCase()}</h3>
      {items.map((item) => (
        <div
          key={item.value}
          className={classNames("selection", { selected: item.isRefined })}
          onClick={() => refine(item.value)}
        >
          {item.label} ({item.count})
        </div>
      ))}
    </form>
  );
});

export default Menu;
