import "dotenv/config";
import mongoose from "mongoose";

jest.setTimeout(30000);

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI as string);
});

afterAll(async () => {
  await mongoose.disconnect();
});