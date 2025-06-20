export interface TokenPayload{
    userId: string,
    email:string,
    role: string,
    avatar: string,
    exp: number,
    iat: number
}