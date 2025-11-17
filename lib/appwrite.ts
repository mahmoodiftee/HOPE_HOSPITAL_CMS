import { Client, Databases, Storage } from 'appwrite';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

export const databases = new Databases(client);
export const storage = new Storage(client);

// Database IDs (set these in your Appwrite console)
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
export const DOCTORS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_DOCTORS_COLLECTION_ID!;
export const TIME_SLOTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_TIME_SLOTS_COLLECTION_ID!;
export const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!;

export { ID } from 'appwrite';