import { APPWRITE_CONFIG } from "@/constants/app";
import {
  Client,
  Account,
  Storage,
  Databases,
  Avatars,
} from "react-native-appwrite";

const client = new Client();
client
  .setEndpoint(APPWRITE_CONFIG.endPoint)
  .setProject(APPWRITE_CONFIG.projectId)
  .setPlatform(APPWRITE_CONFIG.platform);

export const account = new Account(client);
export const storage = new Storage(client);
export const databases = new Databases(client);
export const avatars = new Avatars(client);
