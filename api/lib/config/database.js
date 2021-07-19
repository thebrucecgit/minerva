import mongoose from "mongoose";

const { DB_URI, TEST_URI, NODE_ENV } = process.env;

export async function connect(uri) {
  await mongoose.connect(uri ?? (NODE_ENV === "test" ? TEST_URI : DB_URI), {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
  });
  if (process.env.NODE_ENV !== "test") console.log("Database is connected");
  return mongoose.connection.db;
}

export async function disconnect() {
  await mongoose.connection.close();
}
