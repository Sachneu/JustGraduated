// components/UserInfo.js
import { useEffect, useState } from "react";
import { fetchUserData } from "../lib/api";  // Import from the lib folder

const UserInfo = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const userData = await fetchUserData();  // Use the client-side function from lib
      setUser(userData);
    };

    getUser();
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <h2>{user.name}</h2>
      <img src={user.imageUrl} alt={user.name} />
      <p>Email: {user.email}</p>
    </div>
  );
};

export default UserInfo;
