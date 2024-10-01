import { toast } from "@/hooks/use-toast"
import { EntityError } from "@/lib/http"
import { clsx, type ClassValue } from "clsx"
import { UseFormSetError } from "react-hook-form"
import { twMerge } from "tailwind-merge"
import jwt from "jsonwebtoken"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const handleErrorApi = ({error, setError, duration} : {
  error:any 
  setError?:UseFormSetError<any>
  duration?:number
}) =>{
  if(error instanceof EntityError && setError){
    error.payload.errors.forEach(item=>{
      setError(item.field, {
        type: 'server',
        message: error.message
      })
    })
  }else{
    toast({
      title: 'Error',
      description: error?.payload.message ?? "Undefined Error",
      variant:'destructive',
      duration: duration ?? 5000
    })
  }
}

// xoa di ki tu dau tien của path
export const normalizePath = (path:string) =>{
  return path.startsWith('/')? path.slice(1) : path
}

export const decodeJWT = <Payload = any>(token: string) =>{
  return jwt.decode(token) as Payload
}