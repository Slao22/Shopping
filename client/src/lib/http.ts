import envConfig from "@/config";
import { LoginResType } from "@/schemaValidations/auth.schema";

type CustomOptions = Omit<RequestInit ,'method'> & {
    baseUrl?:string|undefined
}
class HttpError extends Error{
    status:number
    payload:any
    constructor({status,payload}:{status:number; payload:any}){
        super('Http Error')
        this.status= status
        this.payload = payload
    }
}

class SessionToken{
    private token =''
    get value(){
        return this.token
    }

    set value(token : string){
        if(typeof window ==='undefined'){
            throw new Error ('cannot set token on server side')
        }
        this.token = token
    }
}

export const clientSessionToken = new SessionToken()

const request = async <Respone> (method:'GET' | 'POST'|'PUT'|'DELETE' , url:string, options?: CustomOptions | undefined) =>{
    const body = options?.body ? JSON.stringify(options.body) : undefined
    const baseHeaders = {
        'Content-Type' : 'application/json',
        Authorization : clientSessionToken.value ? `Bearer ${clientSessionToken.value}` : ""
    }
    // neu khong truyen baseurl (hoac baseurl = undefined) thi lay tu envConfig
    // neu truyen baseurl thi lay gia tri truyen vao, truyen vao '' thi dong nghia voi viec chung ta goi api den nextjs server
    const baseUrl = options?.baseUrl === undefined ? envConfig.NEXT_PUBLIC_API_ENDPOINT : options.baseUrl

    const fullUrl = url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`

    const res = await fetch(fullUrl,{
        ...options,
        headers:{
            ...baseHeaders,
            ...options?.headers
        },
        body,
        method
    })

    const payload : Respone = await res.json()
    const data ={
        status: res.status,
        payload
    }

    if(!res.ok){
        throw new HttpError(data)
    }

    if((['/auth/login', '/auth/register'].includes(url))){
        clientSessionToken.value = (payload as LoginResType).data.token
    }else if ('/auth/logout'.includes(url)){
        clientSessionToken.value = ''
    }
    return data
}

const http = {
    get<Respone>(url: string, options?: Omit<CustomOptions,'body'> | undefined){
        return request<Respone>('GET',url,options)
    },
    post<Respone>(url: string, body:any, options?: Omit<CustomOptions,'body'> | undefined){
        return request<Respone>('POST',url,{...options,body})
    },
    put<Respone>(url: string, body:any, options?: Omit<CustomOptions,'body'> | undefined){
        return request<Respone>('PUT',url,{...options,body})
    },
    delete<Respone>(url: string, body:any, options?: Omit<CustomOptions,'body'> | undefined){
        return request<Respone>('DELETE',url,{...options,body})
    },
}

export default http