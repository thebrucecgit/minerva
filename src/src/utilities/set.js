import lodashSet from "lodash/set";

// the same as lodash set
// except this returns a copy of the object after update is applied

export default function set(object, ...rest) {
  const newObject = { ...object };
  lodashSet(newObject, ...rest);
  return newObject;
}
