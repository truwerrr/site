declare module "authenticator" {
  export function generateKey(): string;
  export function generateToken(secret: string): string;
  export function verifyToken(secret: string, token: string): boolean;
}
