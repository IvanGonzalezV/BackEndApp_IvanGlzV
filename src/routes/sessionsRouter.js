import sessionsController from "../dao/controllers/sessionsController.js";
import userModel from "../dao/models/userModel.js"
import bcrypt from 'bcrypt';
import passport from "passport";
import express from "express";
import checkRole from '../middlewares/checkRole.js';
import bodyParser from 'body-parser';

const app = express();

app.use(bodyParser.json());

const router = express.Router()

router.post('/api/admin', checkRole(true), async (req, res) => {
    const { first_name, last_name, email, age, password, isAdmin } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await userModel.create({ first_name, last_name, email, age, password: hashedPassword, isAdmin });
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

router.post("/register", async (req, res)=> {

    console.log(req.body); //log de prueba

    try{
        req.session.failedRegister = false

        const { first_name, last_name, email, age, password, isAdmin } = req.body

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await userModel.create({ first_name, last_name, email, age, password: hashedPassword, isAdmin })

        console.log(user);  //log de prueba

        res.redirect("/login")
        
        delete user.password

        req.session.user = user        
        console.log(user)
        
    }catch(error){

        console.log(error); // log de prueba

        req.session.failedRegister = true

        return res.redirect("/register")
    }
})

router.post("/login", async (req, res)=> {
    try{
        req.session.failedLogin = false
        
        const { email, password } = req.body

        const user = await userModel.findOne({email:email})

        if(!user){
            req.session.failedLogin = true
            return res.redirect("/login")
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if(!validPassword){
            req.session.failedLogin = true
            return res.redirect("/login")
        }

        delete user.password

        req.session.user = user
        return res.redirect("/products")

    }catch(error){
        console.log(error)
        req.session.failedLogin = true
        return res.redirect("/login")   
    }
})

router.post("/logout", (req, res)=>{
    req.session.destroy(err =>{
        if(err){
            console.log("logout error")
            return res.redirect("/profile")
        }
        res.redirect("/")
    })
})

router.get("/auth/github", passport.authenticate('github', {scope: ['user:email']}), (req, res) => {
    res.send({
        status: 'success',
        message: 'succes'
    })
    });

    router.get("/auth/github/callback", passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
        req.session.user = req.user;
        res.redirect('/');
    });

    router.get('/current', async (req, res) => {
        try {
            const user = await userModel.findById(req.session.user._id);
            res.json(user);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

export default router