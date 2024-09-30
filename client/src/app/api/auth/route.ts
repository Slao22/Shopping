export const dynamic = 'force-static'
 
export async function POST(request: Request) {
    const res = await request.json()
    const sessionToken = res.payload?.data?.token
    if(!sessionToken){
        return Response.json(
            {
                message:'No Token'
            },
            {
                status:400
            }
        )
    }

  return Response.json( res.payload ,{
    status:200,
    headers: { 'Set-Cookie': `sessionToken=${sessionToken}; Path=/; HttpOnly` },
  })
}