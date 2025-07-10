export interface Permission {
    permissionSelect:PermissionSelect
    allPermission: Permissions
}

export interface PermissionSelect{
    permissionIds: {
        _id: string
        code:string
    }[]
}

export interface Permissions {
    _id: string
    code: string
}

