export interface TokenPayload{
    userId: string,
    fullName:string,
    email:string,
    role: string,
    avatar: string,
    exp: number,
    iat: number
}