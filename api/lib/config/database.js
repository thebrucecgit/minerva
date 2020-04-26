import mongoose from "mongoose";

const { DB_URI } = process.env;

mongoose.connect(
  DB_URI,
  {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) throw err;
    else console.log("Database is connected");
  }
);

export default mongoose;
