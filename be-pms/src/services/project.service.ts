import { Epic, Task } from "../models";

export class ProjectService {
    async GetStatiscalTask(projectId: string) {
        const totalTask = await Task.countDocuments({ projectId });
        const taskProgress = await Task.countDocuments({ projectId, status: { $eq: 'IN_PROGRESS' } })
        const taskToDo = await Task.countDocuments({ projectId, status: { $eq: 'TO_DO' } })
        const taskDone = await Task.countDocuments({ projectId, status: { $eq: 'DONE' } })

        const percentProgress = (taskProgress / totalTask) * 100
        const percentToDo = (taskToDo / totalTask) * 100
        const percentDone = (taskDone / totalTask) * 100

        return {
            totalTask,
            taskProgress,
            taskToDo,
            taskDone,
            percentProgress,
            percentToDo,
            percentDone
        }

    }

    async GetStatisticalEpic(projectId: string) {


        const epicWithTask = await Task.aggregate([
            {
                $match: {
                    projectId: projectId
                }
            },
            {
                $lookup: {
                    from: 'epics',
                    localField: 'epic',
                    foreignField: '_id',
                    as: 'epicData',

                }
            },
            {
                $unwind: '$epicData'
            },
            {
                $group: {
                    _id: {
                        epic: '$epic',
                        epicName: '$epicData.name',
                        status: '$status'
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: {
                        epic: '$_id.epic',
                        epicname: '$_id.epicName'
                    },
                    total: { $sum: '$count' },
                    todo: {
                        $sum: {
                            $cond: [{ $eq: ['_id.status', 'TO_DO'] }, "$count", 0]
                        }
                    },
                    inprogress: {
                        $sum: {
                            $cond: [{ $eq: ['_id.status', 'IN_PROGRESS'] }, "$count", 0]
                        }
                    },
                    done: {
                        $sum: {
                            $cond: [{ $eq: ['_id.status', 'DONE'] }, "$count", 0]
                        }
                    }

                },
                $project: {
                    _id: 0,
                    epic: "$_id.epic",
                    epicName: "$_id.epicName",
                    total: 1,
                    todoPercent: {
                        $cond: [
                            { $eq: ["$total", 0] }, 0,
                            { $round: [{ $multiply: [{ $divide: ["$todo", "$total"] }, 100] }, 2] }
                        ]
                    },
                    inProgressPercent: {
                        $cond: [
                            { $eq: ["$total", 0] },
                            0,
                            { $round: [{ $multiply: [{ $divide: ["$inProgress", "$total"] }, 100] }, 2] }
                        ]
                    },
                    donePercent: {
                        $cond: [
                            { $eq: ["$total", 0] },
                            0,
                            { $round: [{ $multiply: [{ $divide: ["$done", "$total"] }, 100] }, 2] }
                        ]
                    }
                }
            }
        ])
        // lấy ra 1 mảng epic với các task (phần trăm)
        return { epicWithTask }
    }

    async getStatiscalPriority(projectId: string) {
        const taskPriority = await Task.aggregate([
            {
                $match: {
                    projectId: projectId
                }
            }, 
            {
                $group:{
                    _id: '$priority',
                    count: {$sum: 1}
                }
            },
            {
                $project:{
                    _id: 0,
                    priority: '$_id',
                    quantity: '$count'
                }
            }
        ])

        return {taskPriority}
    }
}

export default new ProjectService();