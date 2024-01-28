
export interface Message {
  _id: string;
  senderID: string;
  content: string;
  date: string;
  convId: string
}

export interface Conversation {
  _id: string;
  members: string[];
  messages: string[];
}

export interface User {
  _id: string;
  username: string;
  password: string;
  email: string;
  contacts: string[];
  conversations: string[];
}
