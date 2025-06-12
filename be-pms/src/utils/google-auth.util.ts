import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client();

export interface GoogleUser {
  email: string;
  name: string;
  picture?: string;
}

export async function verifyGoogleIdToken(
  idToken: string
): Promise<GoogleUser> {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload || !payload.email || !payload.name) {
    throw new Error("Invalid Google token");
  }
  return {
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
  };
}
