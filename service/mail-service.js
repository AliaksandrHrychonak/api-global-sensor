const nodemailer = require('nodemailer');

class MailService {

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        })
    }

    async sendActivationMail(to, link) {
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: 'Account activation by address: ' + process.env.CLIENT_URL,
            text: '',
            html:
                `
                    <div>
                        <h1>To activate, follow the link</h1>
                        <a href="${link}">Activate</a>
                    </div>
                `
        })
    }

    async sendMail(email, fullname, message) {
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to: "support@globalsensor.pro",
            subject: 'req' + process.env.CLIENT_URL,
            text: '',
            html:
                `
                    <div>
                        <h1>info</h1>
                        <p>${email}</p>
                        <p>${fullname}</p>
                        <p>${message}</p>
                    </div>
                `
        })
    }

    async sendForgotPasswordMail(to, link) {
      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject: 'Password recovery ' + process.env.CLIENT_URL,
        text: '',
        html:
            `
              <div>
                <h1>To recover your password, follow the link</h1>
                <a href="${link}">Recovery</a>
              </div>
            `
      })
    }
}

module.exports = new MailService();
