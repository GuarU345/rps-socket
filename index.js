import express from "express";

const app = express()
const PORT = 1234

app.use("/",(req,res) =>{
    res.json("hello hello")
})

app.listen(PORT,() => {
    console.log(`server listening on port ${PORT}`)
})