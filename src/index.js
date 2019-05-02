const express = require('express')
const sharp = require('sharp')
const app = express()
require('./db/mongoose')

const User = require('./models/users')
const Task = require('./models/tasks')
const auth = require('./middleware/auth.js')
const {welcomemail} = require('./emails/sendmail.js')
const port = process.env.PORT || 3000
//to USE the input json request and to automtically parse to access it as an object
//SO THAT req handler uses the parses object.

app.use(express.json())

//upload files
const multer = require('multer')
const upload = multer({
  //  dest: 'images',
    limits:{
        fileSize: 1000000
    },
    fileFilter(req,file,cb){
        if((!file.originalname.endsWith('jpg')) 
        && (!file.originalname.endsWith('jpeg')) 
        && (!file.originalname.endsWith('jpg'))){
            return cb(new Error('must be a image'))
        }
        cb(undefined, true)
    }
})
app.post('/upload',auth, upload.single('upload'),async(req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({height:500, width:500}).png().toBuffer()
    req.user.upload = buffer
    await req.user.save()
    res.send()    
},(err,req,res,next)=>{
    res.status(400).send({error:err.message})
})

app.delete('/users/delete/upload',auth, async(req,res)=>{
    try {
        req.user.upload = undefined
        await req.user.save()
        res.send()    
    } catch (error) {
        res.status(400).send(error)
    }
})

app.get('/users/:email/upload', async (req,res)=>{
    const user = await User.findOne({email:req.params.email})
    if(!user || !user.upload){
        throw new Error('No file found')
    }
    res.set('Content-Type','image/jpg')
    res.send(user.upload)
})
//endpoint for users
app.post('/users/login',async (req,res)=>{
    try {
        const user = await User.findByCredential(req.body.email,req.body.password)
        const token = await user.generatejwt()
//        res.send({user:user.onlyPublic(),token})
      
          res.send({user,token})
    } catch (error) {
        res.status(400).send()
    } 
   })

app.post('/users/logout',auth, async(req,res)=>{
try {
    req.user.tokens = req.user.tokens.filter((token)=>{
        token.token !== req.token
    })
    await req.user.save()
    res.send()
} catch (error) {
    res.status(500).send()
}
})

app.post('/users/logout/all', auth, async(req,res)=>{
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send()        
    }
})

app.post('/users', async(req,res)=>{
  //  const update = Object.keys(req.body)  
   
    const me = new User(req.body)
    try{
        console.log('test')
        await me.save()
        welcomemail(me.email, me.name)
        const token = await me.generatejwt()
        res.status(201).send({me,token})    
        
    }catch(e){
        res.status(400)
        res.send(e)
    }
 })

app.get('/users/me', auth, async(req,res)=>{
    res.send(req.user)
})

app.get('/users/:id',async(req,res)=>{
    const _id = req.params.id
     try {        
        const user= await User.findById(_id)
        if (!user){
            return res.status(404).send()
        }
        res.send(user)
    } catch (e) {
        res.status(500).send()
    }
})

app.patch('/users/me',auth, async(req,res)=>{
    const updates = Object.keys(req.body)
    console.log(updates)
    const allowedUpdates = ['name','email','password','age']
    const verify = updates.every((update)=>{
        return allowedUpdates.includes(update)
    })
    console.log(verify)
    if (!verify){
        return res.send("Trying to update which is Not part of an array, Not allowed")
    }
    try {
        updates.forEach((update)=>{
            req.user[update] = req.body[update]
        })    
         await req.user.save()
        res.send(req.user)
    } catch (error) {
        res.status(404).send()
    }
})

app.delete('/users/me',auth, async (req,res)=>{
    req.user.remove()
    res.send(req.user)
} ) 

//endpoint for tasks
app.post('/tasks',auth, async(req,res)=>{
    try {
        const newTask= new Task({
            ...req.body,
            owner: req.user._id
        })  
        await newTask.save()  
        res.status(201).send(newTask)
    } catch (error) {
        
    res.status(400).send(e)
    }
})

//read endpoint for task
app.get('/tasks',async(req,res)=>{
    try {
        const t= await Task.find({})
        res.send(t)
    } catch (error) {
     res.status(500).send()
    }
})

app.get('/tasks/:desc',async(req,res)=>{

    try {
    const description = req.params.desc
    console.log(req.params.desc)
    const task = await Task.findOne({description})
    if (!task){
        return res.status(404).send()
      }
      res.send(task)
        
    } catch (error) {     
           res.status(500).send()
    }

})

app.listen(port,()=>{
    console.log("Port is up running"+ port)
})

