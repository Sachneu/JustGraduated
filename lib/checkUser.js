// lib/checkUser.js

import { currentUser } from "@clerk/nextjs/server";

export const checkUser = async () => {
  const user = await currentUser();

  if (!user) {
    throw new Error("User is not authenticated");
  }

  return user;
};
