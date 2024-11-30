const catchAsync = require("../utils/catchAsync");
const appError = require("../utils/appError");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// Google Token Verification
const verifyGoogleToken = async (idToken) => {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
    });

    const payload = ticket.getPayload();
    return {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
    };
  } catch (err) {
    return new appError("Error During Google verification ", 500);
  }
};

// Facebook Token Verification
const verifyFacebookToken = async (accessToken) => {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`
    );
    return {
      id: response.data.id,
      name: response.data.name,
      email: response.data.email,
      picture: response.data.picture.data.url,
    };
  } catch (err) {
    return new appError("Error During Facebook verification ", 500);
  }
};

// Apple Token Verification (simplified example, use Apple JWT verification in production)
const verifyAppleToken = async (token) => {
  try {
    const decodedToken = jwt.decode(token, { complete: true });
    const { data: appleKeys } = await axios.get(
      "https://appleid.apple.com/auth/keys"
    );
    const key = appleKeys.keys.find((k) => k.kid === decodedToken.header.kid);

    if (!key) return next(new appError("Invalid Apple token", 400));

    jwt.verify(socialToken, key, { algorithms: ["RS256"] });
    email = decodedToken.payload.email;
    return {
      email,
    };
  } catch (err) {
    return new appError("During Apple verification ", 500);
  }
};

// LinkedIn Token Verification
const verifyLinkedInToken = async (accessToken) => {
  try {
    const profileResponse = await axios.get("https://api.linkedin.com/v2/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const emailResponse = await axios.get(
      "https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return {
      id: profileResponse.data.id,
      name: `${profileResponse.data.localizedFirstName} ${profileResponse.data.localizedLastName}`,
      email: emailResponse.data.elements[0]["handle~"].emailAddress,
    };
  } catch (err) {
    return new appError("Error During Linkedin verification ", 500);
  }
};

// Microsoft Teams Token Verification
const verifyMicrosoftToken = async (accessToken) => {
  try {
    const response = await axios.get("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return {
      id: response.data.id,
      name: response.data.displayName,
      email: response.data.mail || response.data.userPrincipalName,
    };
  } catch (err) {
    return new appError("Error During Teams verification ", 500);
  }
};

module.exports = {
  verifyFacebookToken,
  verifyAppleToken,
  verifyGoogleToken,
  verifyLinkedInToken,
  verifyMicrosoftToken,
};
