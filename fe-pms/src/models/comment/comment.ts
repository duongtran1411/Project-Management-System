export interface Comment{
    content: string
    task: string
    author: {
        name:string
        avatar:string
    }
    mentions: string[]
    attachments: {
        filename: string
        url: string
    }
}