const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user : '@gmail.com',
        pass : ''
    }
})

const mailoption = {
    from : 'senthamizhko@gmail.com',
    to : 'senthamizhko@gmail.com',
    subject: 'Node js',
    text: 'Hi'
}

transporter.sendMail(mailoption, (err, info)=>{
    if(err){
        throw new Error(err)
    }
    console.log('success')

})