import { ID } from "react-native-appwrite";
import { account, avatars, databases } from "./appwrite";
import { APPWRITE_CONFIG } from "@/constants/app";
import { handleError } from "@/utils/error";
import { UserInfoToUI, UserRecord } from "@/types/user";
import { getCurrentUserInfo } from "./user";

export const registerUsingEmail = async (
  name: string,
  email: string,
  password: string
) => {
  try {
    if (!name || !email || !password) {
      return handleError("please, provide all required data!", 400);
    }
    const newAccount = await account.create(ID.unique(), email, password, name);
    await credentialsLogin(newAccount.email, newAccount.password as string);
    const avatarURL = avatars.getInitials(newAccount.name);
    const newUser = (await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.usersCollectionId,
      ID.unique(),
      {
        email: newAccount.email,
        username: newAccount.name,
        avatar: avatarURL,
        accountId: newAccount.$id,
      }
    )) as UserRecord;

    return {
      $id: newUser.$id,
      $updatedAt: newUser.$updatedAt,
      $createdAt: newUser.$createdAt,
      username: newUser.username,
      email: newUser.email,
      avatar: newUser.avatar,
    } as UserInfoToUI;
  } catch (error) {
    return handleError((error as Error).message);
  }
};

export const credentialsLogin = async (email: string, password: string) => {
  try {
    return await account
      .createEmailPasswordSession(email, password)
      .then(async (data) => {
        const currentUser = await getCurrentUserInfo({ returnToUI: true });
        return currentUser;
      });
  } catch (error) {
    return handleError((error as Error).message);
  }
};

export const logout = async () => {
  try {
    await account.deleteSession("current");
  } catch (error) {
    return handleError((error as Error).message);
  }
};
