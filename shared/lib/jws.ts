import { JWTPayload, jwtVerify, SignJWT } from "jose";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export const signJWT = async <T extends JWTPayload>(
  data: T,
  modify: (jwt: SignJWT) => SignJWT = (jwt) => jwt
) => {
  const signDefault = new SignJWT(data)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("15m");
  return modify(signDefault).sign(JWT_SECRET);
};

export const verifyJWT = async <T extends JWTPayload>(token: string): Promise<T | null> => {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as T;
  } catch (e) {
    console.error("JWT verification failed", e);
    return null;
  }
};
