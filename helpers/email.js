const juice = require("juice");
const nodemailer = require("nodemailer");
const config = require("../config/email");
const messageTemplate = config.message_template;
const messageActions = config.message_actions;

class Email {
    static aTransporter;
    static get transporter() {
        if (this.aTransporter === undefined) {
            this.aTransporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD,
                },
            });
        }
        return this.aTransporter;
    }

    static sendMail(
        {
            subject = "New message from NHS BI Platform",
            message = "Test message",
            to = "fwccg.fcdigital@nhs.net",
            actions = [],
            attachments = [],
        },
        callback
    ) {
        this.transporter.sendMail(
            {
                from: `"Notifications" <${process.env.EMAIL_USERNAME}>`,
                to,
                subject,
                text: message,
                attachments,
                html: actions.length > 0 ? this.createMessageWithActions(actions, message) : this.createMessage(message),
            },
            (error, value) => {
                if (error) {
                    console.log("Message error: " + error + ", to: " + to);
                    callback(error, "Message error");
                } else {
                    console.log("Message sent: " + value.messageId + ", to: " + to);
                    callback(null, "Message sent");
                }
            }
        );
    }

    static createMessage(message) {
        return juice(messageTemplate.replace("MESSAGE", message));
    }

    static createMessageWithActions(actions, message) {
        // Create action
        let actionsHTML = "";
        actions.forEach((action) => {
            actionsHTML += `<a href="${messageActions[action.type]}?${new URLSearchParams(
                action.type_params
            ).toString()}" target="_blank" class="button ${action.class}">&nbsp;${action.text}&nbsp;</a>`;
        });

        // Apply to template
        return juice(
            messageTemplate.replace(
                "MESSAGE</div>",
                `${message}</div><div class="action">${actionsHTML}</div>`
            )
        );
    }
}

module.exports = Email;
