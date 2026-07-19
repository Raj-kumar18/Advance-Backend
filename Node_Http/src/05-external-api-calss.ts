//web scrapping

const API_URL = "https://jsonplaceholder.typicode.com/users/1"

type PlaceHolderUser = {
    id:number,
    name:string,
    email:string,
    company:{
        name:string,
    }
}


type PublicUser ={
    id:number,
    name:string,
    email:string,
    company:string
}



function transformUser(rawdata:PlaceHolderUser):PublicUser{
    return {
        id:rawdata.id,
        name:rawdata.name,
        email:rawdata.email,
        company:rawdata.company.name
    }
}




async function fetchExistingUser():Promise<void>{
    //AbortController lets us cancel an inprogress fetch request

    const controller = new AbortController()

    const timer = setTimeout(()=>{
        controller.abort()
    },5000)

    try{
        const response = await fetch(API_URL,{
            method:"GET",
            signal:controller.signal
        })

        if(!response.ok){
            console.log(`upstream api failed with http ${response.status}`)
            return
        }

        const rawUser = (await response.json()) as PlaceHolderUser

        const user = transformUser(rawUser)
        console.log(user)
    }catch(error){
        if(error instanceof Error && error.name === "AbortError "){
            console.error("request failed because upstream api took so long")
            return
        }

        const message = error instanceof Error ? error.message :"unknown"
        console.log("External api failed",message)
    }finally{
        clearTimeout(timer)
    }

}

fetchExistingUser()