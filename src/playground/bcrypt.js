const bcrypt = require('bcrypt')

const password = 'sentha123'

const myfunction = async (password)=>{
    const hashed = await bcrypt.hash(password, 8)
    console.log(hashed)
    console.log(password)
    const compare = await bcrypt.compare(password,hashed)
    console.log(compare)
}
myfunction(password)