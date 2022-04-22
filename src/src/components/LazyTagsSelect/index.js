import { useEffect, useState } from "react";
import TagsSelect from "@yaireo/tagify/dist/react.tagify";

// adds a prop `getWhitelist` to TagsSelect

// I spent way too long on this. There could be a better way to do this.

export default function LazyTagsSelect({ getWhitelist, ...props }) {
  const [whitelist, setWhitelist] = useState(null);

  useEffect(() => {
    if (whitelist) return;
    (async () => {
      setWhitelist(await getWhitelist());
    })();
  }, [whitelist, getWhitelist]);

  return <TagsSelect {...props} whitelist={whitelist ?? [props.value]} />;
}
