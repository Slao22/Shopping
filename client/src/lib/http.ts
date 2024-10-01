import envConfig from "@/config";
import { normalizePath } from "@/lib/utils";
import { LoginResType } from "@/schemaValidations/auth.schema";
import { redirect } from "next/navigation";
import { normalize } from "path";
import { any, string } from "zod";

type CustomOptions = Omit<RequestInit ,'method'> & {
    baseUrl?:string|undefined
}

const AUTHENTICATION_ERROR_STATUS = 401
const ENTITY_ERROR_STATUS = 422
type EntityErrorPayLoad =  {
    message: string,
    errors :{
        field:string
        message:string
    }[]
}


export class HttpError extends Error{
    status:number
    payload:{
        message:string
        [key:string]:any
    }
    constructor({status,payload}:{status:number; payload:any}){
        super('Http Error')
        this.status= status
        this.payload = payload
    }
}

export class EntityError extends HttpError {
    status : 422
    payload:EntityErrorPayLoad

    constructor({status,payload}:{status:422; payload:EntityErrorPayLoad}){
        super ({status,payload})
        this.status = status
        this.payload = payload
    }
}

class SessionToken{
    private token =''
    private _expiresAt= new Date().toISOString()
    get value(){
        return this.token
    }

    set value(token : string){
        if(typeof window ==='undefined'){
            throw new Error ('cannot set token on server side')
        }
        this.token = token
    }

    get expiresAt(){
        return this._expiresAt
    }

    set expiresAt(expiresAt:string){
        if(typeof window ==='undefined'){
            throw new Error ('cannot set token on server side')
        }
         this._expiresAt = expiresAt
        }
}

export const clientSessionToken = new SessionToken()
let clientLogoutRequest: null | Promise<any> = null

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
        if(res.status === ENTITY_ERROR_STATUS){
            throw new HttpError(data as {
                status:422,
                payload : EntityErrorPayLoad
            })
        }else if(res.status === AUTHENTICATION_ERROR_STATUS){
            if(typeof window !=='undefined'){
              if(!clientLogoutRequest){
                clientLogoutRequest = fetch('/api/auth/logout',{
                    method: 'POST',
                    body: JSON.stringify({force: true}),
                    headers:{
                        ...baseHeaders
                    }
                })
                await clientLogoutRequest
                clientSessionToken.value =''
                clientSessionToken.expiresAt = new Date().toISOString()
                clientLogoutRequest = null
                location.href = '/login'
            }
            else{
                const sessionToken = (options?.headers as any).Authorization.split('Bearer ')[1]
                redirect(`logout?sessionToken= ${sessionToken}`)
            }
        }
    }
        else{
            throw new HttpError(data)
        }
    }
    //dam bao logic chi chay client
    if(typeof window !== 'undefined'){
        if((['auth/login', 'auth/register'].some(item => item === normalizePath(url)))){
            clientSessionToken.value = (payload as LoginResType).data.token
            clientSessionToken.expiresAt = (payload as LoginResType).data.expiresAt
        }else if ('auth/logout' === normalize(url)){
            clientSessionToken.value = ''
            clientSessionToken.expiresAt = new Date().toISOString()
        }
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