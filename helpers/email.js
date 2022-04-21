const nodemailer = require("nodemailer");
const config = require("../config/email");
const messageTemplate = config.message_template;
const messageActions = config.message_actions;

class Email {
    static _transporter;
    static get transporter() {
        if (this._transporter == undefined) {
            this._transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD
                },
            });
        }
        return this._transporter;
    }

    static sendMail({
        subject = "New message from Nexus Intelligence",
        message = "Test message",
        to = "fwccg.fcdigital@nhs.net",
        actions = [],
        attachments = []
    }, callback) {
        this.transporter.sendMail({
            from: `"Notifications" <${process.env.EMAIL_USERNAME}>`,
            to: to,
            subject: subject,
            text: message,
            attachments: attachments,
            html: actions.length > 0 ? this._createMessageWithActions(actions, message) : this._createMessage(message),
        }).then((value) => {
            console.log("Message sent: " + value.messageId + ", to: " + to);
            callback(null, "Message sent");
        });
    }

    static _createMessage(message) {
        return messageTemplate.replace("MESSAGE", message);
    }

    static _createMessageWithActions(actions, message) {
        //Create action
        let actionsHTML = "";
        actions.forEach((action) => {
            actionsHTML += `<a href="${messageActions[action.type]}?${new URLSearchParams(action.type_params).toString()}" target="_blank" class="mat-button ${action.class}">${action.text}</a>`;
        });

        //Apply to template
        return messageTemplate.replace("MESSAGE</div>", `${message}</div><div class="full main mat-card action">${actionsHTML}</div>`);
    }
}

module.exports = Email;