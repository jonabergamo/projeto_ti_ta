export type Session = {
  token: string;
  user: {
    email: string;
    firstName: string;
    id: string;
    isStaff: false;
    lastName: string;
    username: string;
    base64Image: string;
    dateJoined: string;
  };
};
