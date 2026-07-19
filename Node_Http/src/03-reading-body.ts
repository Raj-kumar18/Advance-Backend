import http, { type IncomingMessage, type ServerResponse } from "node:http"

const PORT = 3000

type CreateUserBody ={
    name?:string,
    email?:string
}

const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
    const method = req.method ?? "GET"

    const requestUrl = new URL(req.url ?? "/", `http:${req.headers.host}`)
    const pathName = requestUrl.pathname

    res.setHeader("conent-type", "text/plain")

    if (method === "POST" && pathName === "/user") {
        const chunks:Buffer[]=[]

        //data event is going to tun everytime node receives a new body chunk
        req.on("data",(chunk:Buffer)=>{
          chunks.push(chunk)  
        })

        req.on("end",()=>{
            const rawBody = Buffer.concat(chunks).toString("utf-8")

            if(!rawBody){
                res.statusCode =404
                res.end("req body is required")
                return
            }

            const body = JSON.parse(rawBody) as CreateUserBody

            if(!body.name || !body.email){
                res.statusCode =400
                res.end("both name and email is required")
                return
            }

        })

        req.on("error",()=>{
            res.statusCode = 500
            res.end("Failed to read request body")
        })
        return
    } 

})

server.listen(PORT,()=>{
    console.log(`server is now running on port ${PORT}`)
})