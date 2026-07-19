import http,{type IncomingMessage ,type ServerResponse}from "node:http"

const PORT = 3000


// http.createServer create a low level server
//callback is going to run for every incoming http req

// req- request object
//methods - get,post ,put,options , delete
//headers - actual metadata sent by the client
// req body - data post/put

const server = http.createServer((req:IncomingMessage,res:ServerResponse)=>{
    const methods = req.method

    //get >  reading data 
    //post > create data
    //put > replace the data
    //path >  update partial data
    //delete > delete the data 

    const url = req.url;
    // in which part the client is actually requeesting

    const userAgent = req.headers["user-agent"]

    res.statusCode = 200

    res.setHeader("content-type","text/plains")


    res.end(`Basic http node server ${methods} : ${url} : ${userAgent}`)

})


server.listen(PORT,()=>{
    console.log(`server is now running on port ${PORT}`)
})