import { MongoClient, ServerApiVersion } from "mongodb";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://localhost:27017/project-management-system";

const mongoClient = new MongoClient(MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export const connectDB = async () => {
  await mongoClient.connect();
};

export const getDB = () => {
  if (!mongoClient) throw new Error("Must connect to database ");
  return mongoClient.db();
};
