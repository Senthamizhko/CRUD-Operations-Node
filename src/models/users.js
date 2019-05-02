const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userschema = new mongoose.Schema({
    name:{type: String,
         required: true,
         trim: true,
         lowercase: true },
    email:{type: String,
           trim: true,
           unique: true,
            validate(value)
           {
            if (!validator.isEmail(value))
            {
                throw new Error("Invalid email")
            }
           }           
          },
    age:{type:Number,
        default : 0},
    password:{
        type: String,
        required: true,
        minlength: 7,
     //   validate(value){
            // if (validator.isLength(value) < 6){
            //     throw new Error("Password length is short"+ validator.isLength(value))
            // }
       //     if (value.toLowerCase().includes('password')== true){
         //       throw new Error("Password cannot be word password")
           // }
       // },
        trim: true
        
    },
    tokens:[{
        token:{
            type: String,
            required: true
        }
    }],
    upload:{
        type:Buffer
    }
},{
    timestamps: true
})

//userschema.methods.onlyPublic = function(){
userschema.methods.toJSON = function(){
    const user = this
    const userobject = user.toObject()
    delete userobject.password
    delete userobject.tokens
    return userobject
}
userschema.methods.generatejwt = async function(){
    const user = this
    const token = jwt.sign({_id:user._id.toString()},'sentha')
    user.tokens = user.tokens.concat({token:token})
    user.save()
    return token
}
userschema.statics.findByCredential = async (email,password) =>{
 
    const user = await User.findOne({email}) 
    if (!user){
       throw new Error('unable to login')        
    }
    const boolean1 = await bcrypt.compare(password, user.password)
    if (!boolean1){
        throw new Error('Unable to login, password ')
    }
    return user
}
userschema.pre('save', async function(next){
    const user = this
    
    if (user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8)
     }
    next()
   })

//creating a model
const User = mongoose.model('User',userschema)

module.exports = User