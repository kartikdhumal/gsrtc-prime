import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp: number;
  iat: number;
  id: string;
  role: string;
}

export function isTokenValid(token: string | null): boolean {
  if (!token) return false;

  try {
    const decoded: DecodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    return false;
  }
}
