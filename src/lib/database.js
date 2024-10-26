import { client } from './appwrite';

const database = client.database;

const saveUserData = async (userId, data) => {
  try {
    const response = await database.createDocument(
      '[671ca0f6001d7f5b3042]',
      ID.unique(),
      {
        userId,
        ...data,
      }
    );
    console.log(response);
  } catch (error) {
    console.error(error);
  }
};

const getUserData = async (userId) => {
  try {
    const response = await database.listDocuments(
      '[671ca0f6001d7f5b3042]',
      {
        filters: [
          {
            property: 'userId',
            value: userId,
          },
        ],
      }
    );
    console.log(response);
  } catch (error) {
    console.error(error);
  }
};

export { saveUserData, getUserData };