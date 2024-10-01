import authApiRequets from "@/apiRequest/auth"
import { HttpError } from "@/lib/http"
import { cookies } from "next/headers"
 
export async function POST(request: Request) {
    const res = await request.json()
    const force = res.force as boolean | undefined
    if(force){
        return Response.json({
            message: 'Buoc dang xuat thanh cong',
        },{
            status:200,
            headers: { 'Set-Cookie': `sessionToken=; Path=/; HttpOnly; Max-age=0` },
        })
    }
    const cookieStore = cookies();
    const sessionToken = cookieStore.get("sessionToken");
    if(!sessionToken){
        return Response.json(
            {
                message:'No Token'
            },
            {
                status:401
            }
        )
    }

    try {
        const result = await authApiRequets.logoutFromNextServerToServer(sessionToken.value)
        return Response.json( result.payload ,{
            status:200,
            headers: { 'Set-Cookie': `sessionToken=; Path=/; HttpOnly; Max-age=0` },
          })
    } catch (error) {
        if(error instanceof HttpError){
            return Response.json(error.payload,{
                status: error.status
            })
        }else{
            return Response.json(
                {
                    message: 'Unknow Error'
                },{
                    status : 500
                }
            )
        }
    }
}