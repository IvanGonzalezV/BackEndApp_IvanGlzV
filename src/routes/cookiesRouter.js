import { Router } from "express";

const router = Router()

router.post("/setCookies", (req, res)=>{

    const correo =  req.body.correo ? req.body.correo : "undefined"

    res.cookie("user", correo, {maxAge:10000}).redirect("/")

})

router.get("/getCookies", (req, res)=>{

    res.send(req.cookies)

})

export default router