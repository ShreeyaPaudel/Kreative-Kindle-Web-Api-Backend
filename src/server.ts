import "dotenv/config";
import mongoose from "mongoose";
import app from "./app";

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
