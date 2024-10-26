import { Client, Account, ID } from 'appwrite';

const client = new Client();
client
  // .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('671ca097001528396fb8');

const account = new Account(client, ['account']);

export { client, account, ID };