
import { Db, MongoClient } from "mongodb";

export const connectDB = async (): Promise<Db> => {
  const usr = "Mateo";
  const pwd = "hG28d7HHpi4MK2C";
  const dbName: string = "puestos_trabajo";
  const mongouri: string = `mongodb+srv://${usr}:${pwd}@ClusterMateo.xarym.mongodb.net/${dbName}?retryWrites=true&w=majority`;

  const client = new MongoClient(mongouri);

  try {
    await client.connect();
    console.info("MongoDB connected");

    return client.db(dbName);
  } catch (e) {
    throw e;
  }
};