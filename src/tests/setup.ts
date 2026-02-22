import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

beforeAll(async () => {
  const MONGO_URI = process.env.MONGO_URI_TEST || process.env.MONGO_URI;

  if (!MONGO_URI) {
    throw new Error("Test Mongo URI not found");
  }

  await mongoose.connect(MONGO_URI);
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});