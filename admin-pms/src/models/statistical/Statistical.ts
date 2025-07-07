export interface Statistical{
    totalProjects:number
    totalTasks: number
    totalUsers: number
    projectStatusStats: {
        count:number
        status:string
        percentage:string
    }[]
    taskStatusStats: {
        count:number
        status:string
        percentage:string
    }[]
}