import http, { type IncomingMessage, type ServerResponse } from "node:http"

const PORT = 3000

type User ={
    id:number,
    name:string,
    email:string
}

type ApiResponse<T>={
    success:boolean,
    mesaage:string,
    data?:T,
    error?:string
}

const users:User[]=[
    {
        id:1,
        name:"rak",
        email:"ak@.com"
    },
        {
        id:2,
        name:"hak",
        email:"hak@.com"
    },    {
        id:3,
        name:"pak",
        email:"pak@.com"
    },
]



function sendJson<T>(
    res:ServerResponse,
    statusCode:number,
    body:ApiResponse<T>
):void{
    res.statusCode = statusCode
    res.setHeader("Content-Type","application/json")

    res.end(JSON.stringify(body))

}

const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
    const method = req.method ?? "GET"
     const requestUrl = new URL(req.url ?? "/", `http:${req.headers.host}`)
    const pathName = requestUrl.pathname

    res.setHeader("conent-type", "text/plain")

    if(method === "GET" && pathName === "/"){
        sendJson(res,200,{
            success:true,
            mesaage:"server is running",
            data:{
                routes:["GET/users"]
            }
        })
    }

        if(method === "GET" && pathName === "/users"){
        sendJson(res,200,{
            success:true,
            mesaage:"users fetched successfully",
            data:users
        })
        return
    }

    sendJson<null>(res,404,{
        success:false,
        mesaage:"Route not found",
        error:`${method} ${pathName} is not exists `
    })
    return


})

server.listen(PORT,()=>{
    console.log(`server is now running on port ${PORT}`)
})