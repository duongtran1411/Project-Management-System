export interface TokenPayload{
    userId: string,
    fullname:string,
    email:string,
    role: string,
    avatar: string,
    exp: number,
    iat: number
}