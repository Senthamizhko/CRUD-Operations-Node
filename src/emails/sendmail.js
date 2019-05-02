const sgMail = require('@sendgrid/mail')
const apiKey = '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'
sgMail.setApiKey(apiKey)

const welcomemail = (email,name)=>{
    sgMail.send({

    to: email,
    from : 'senthamizhko@gmail.com',
    subject: 'Testing SendGrid ${name}. MAIL feature ',
    text : 'This is a mail generator application created by Senthamizhko :)'

})}

module.exports= {
    welcomemail
}