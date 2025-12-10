import { CreateUserParams, SignInParams } from "@/type";
import {
  Account,
  Avatars,
  Client,
  ID,
  Query,
  TablesDB,
} from "react-native-appwrite";
export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
  platform: process.env.EXPO_PUBLIC_APPWRITE_PLATFORM!,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
  bucketId: process.env.EXPO_PUBLIC_APPWRITE_BUCKET_ID!,
  userTable: process.env.EXPO_PUBLIC_APPWRITE_USER_TABLE!,
};

export const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint!)
  .setProject(appwriteConfig.projectId!)
  .setPlatform(appwriteConfig.platform!);

export const account = new Account(client);
export const tablesDB = new TablesDB(client);
const avatars = new Avatars(client);

export const createUser = async ({
  name,
  username,
  email,
  password,
}: CreateUserParams) => {
  try {
    const result = await tablesDB.listRows({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.userTable,
      queries: [Query.equal("username", username)],
    });

    if (result.rows.length > 0) {
      throw new Error(
        "Este nome de usuário já está em uso. Por favor, escolha outro."
      );
    }

    const userId = ID.unique();

    const newAccount = await account.create({
      userId,
      email,
      password,
      name,
    });

    if (!newAccount) throw new Error();

    await signIn({ email, password });

    const avatarUrl = avatars.getInitialsURL(name);

    return await tablesDB.createRow({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.userTable,
      rowId: ID.unique(),
      data: {
        name,
        username,
        email,
        accountId: newAccount.$id,
        avatar: avatarUrl,
        isPro: false,
      },
    });
  } catch (error) {
    throw new Error(error as string);
  }
};

export const signIn = async ({ email, password }: SignInParams) => {
  try {
    const session = await account.createEmailPasswordSession({
      email,
      password,
    });
  } catch (error) {
    throw new Error(error as string);
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();

    if (!currentAccount) throw new Error();

    const currentUser = await tablesDB.listRows({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.userTable,
      queries: [Query.equal("accountId", currentAccount.$id)],
    });

    if (!currentUser) throw new Error();

    return currentUser.rows[0];
  } catch (error) {
    throw new Error(error as string);
  }
};
