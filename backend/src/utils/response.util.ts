export function success(statusCode: number,message: string, data: any = null){
    return {
        statusCode,
        message,
        data
    }
}