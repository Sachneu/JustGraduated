// lib/api.js
export const fetchUserData = async () => {
    const res = await fetch("/api/user");  // Call to a server-side API route
    const data = await res.json();
    return data;
  };
  