export interface Comment{
    content: string
    task: string
    author: string
    mentions: string[]
    attachments: {
        filename: string
        url: string
    }
}