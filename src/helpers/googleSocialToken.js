exports.getUserTokenInfo = async (accessToken) => {
  try {
    const response = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const userInfo = response.data;
    console.log("User Info:", userInfo);
    return userInfo.email;
  } catch (error) {
    console.error(
      "Error fetching user info:",
      error.response?.data || error.message
    );
  }
};
