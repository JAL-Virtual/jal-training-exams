import { MongoClient, Db } from 'mongodb';

// Check if DATABASE_URL is provided
if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL not found in environment variables. Database operations will fail.');
}

const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/jal-training-system';
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferMaxEntries: 0,
  bufferCommands: false,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;

export async function getDatabase(): Promise<Db> {
  try {
    const client = await clientPromise;
    return client.db('jal-training-system');
  } catch (error) {
    console.error('Failed to connect to database:', error);
    throw new Error('Database connection failed');
  }
}
