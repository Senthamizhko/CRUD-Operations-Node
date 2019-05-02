require('../db/mongoose')

const User = require('../models/users')
const Task = require('../models/tasks')


const t = async(id)=>{
    const t1 = await Task.findByIdAndDelete(id)
    const t2 = await Task.countDocuments({completed: true})
    return t2
}

t('5ca34b02b5638a49c836c755').then((c)=>{
    console.log(c)
}).catch((e)=>{
    console.log('e'+e)
})