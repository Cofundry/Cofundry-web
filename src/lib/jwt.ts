import jwt, { Secret, SignOptions } from 'jsonwebtoken';

const SECRET: Secret = process.env.JWT_SECRET ?? 'your-secret';

export function signToken(payload: string | object | Buffer, expiresIn: any = '1d'): string {
  const options: SignOptions = { expiresIn }; // Ensure correct shape
  return jwt.sign(payload, SECRET, options); // Now types will match
}

export function verifyToken(token: string): string | jwt.JwtPayload | null {
  try {
    return jwt.verify(token, SECRET);
  } catch (err) {
    return null;
  }
}
