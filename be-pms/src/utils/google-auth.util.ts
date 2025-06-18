import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export interface GoogleUser {
  email: string;
  name: string;
  picture?: string;
}

export async function verifyGoogleIdToken(
  idToken: string
): Promise<GoogleUser> {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new Error("GOOGLE_CLIENT_ID is not configured");
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.name) {
      throw new Error("Invalid Google token payload");
    }

    return {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };
  } catch (error) {
    console.error("Google token verification error:", error);
    if (error instanceof Error && error.message.includes("Wrong recipient")) {
      const decodedToken = JSON.parse(
        Buffer.from(idToken.split(".")[1], "base64").toString()
      );
      throw new Error(
        `Client ID mismatch. Token audience: ${decodedToken.aud}, Environment Client ID: ${process.env.GOOGLE_CLIENT_ID}`
      );
    }
    throw new Error(
      "Failed to verify Google token: " + (error as Error).message
    );
  }
}
