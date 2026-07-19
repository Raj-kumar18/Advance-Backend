import http,{type IncomingMessage ,type ServerResponse}from "node:http"

const PORT = 3000

const server = http.createServer((req:IncomingMessage,res:ServerResponse)=>{
    const method = req.method ?? "GET"


    const requestUrl = new URL(req.url ?? "/",`http://${req.headers.host}`)
    const pathName = requestUrl.pathname 

    if(method === "GET" && pathName === "/health"){
        res.statusCode = 200
        res.end("server is healthy")
        return
    }

      if(method === "GET" && pathName === "/users"){
        res.statusCode = 200
        res.end(" List of user")
        return
    }
       if(method === "POST" && pathName === "/user"){
        res.statusCode = 200
        res.end("user created successfullt !")
        return
    }

    res.statusCode=404
    res.end("Route not foun")
})

server.listen(PORT,()=>{
    console.log(`server is now running on port ${PORT}`)
})