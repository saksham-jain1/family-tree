// src/lib/fetcher.js

/**
 * A fetcher function for useSWR that includes the Firebase Auth token.
 * @param {string} url - The API endpoint to fetch.
 * @param {object} user - The Firebase user object from useAuth.
 */
export const fetcher = async ([url, user]) => {
  if (!user) {
    throw new Error("User not authenticated");
  }

  const token = await user.getIdToken();

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }

  const data = await res.json();
  return data.tree ? data.tree.treeData : null;
};