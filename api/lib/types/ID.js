import { nanoid } from "nanoid";
class ID extends String {
  constructor(value) {
    super(value ?? nanoid(11));
  }
  get _id() {
    return this;
  }
  isEqual(cmp) {
    return this.valueOf() === cmp.valueOf();
  }
}

export default ID;
