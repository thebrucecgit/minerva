import mongoose from "mongoose";

const { DB_URI } = process.env;

export async function connect(uri) {
  await mongoose.connect(uri ?? DB_URI, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
  });
  if (process.env.NODE_ENV != "test") console.log("Database is connected");
}

export async function disconnect() {
  await mongoose.connection.close();
}
