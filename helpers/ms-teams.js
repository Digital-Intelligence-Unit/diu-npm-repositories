/* eslint-disable no-template-curly-in-string */
const { IncomingWebhook } = require("ms-teams-webhook");
const ACData = require("adaptivecards-templating");

class MsTeams {
    static jsonschema = {
        type: "message",
        attachments: [{
            contentType: "application/vnd.microsoft.card.adaptive",
            content: {
                type: "AdaptiveCard",
                body: [
                    {
                        type: "Image",
                        url: "https://www.nexusintelligencenw.nhs.uk/assets/images/nexusgenNHS.png",
                        horizontalAlignment: "Center",
                        width: "200px"
                    },
                    {
                        type: "TextBlock",
                        text: "${$root.title}",
                        wrap: true,
                        weight: "Bolder",
                        size: "Large",
                        horizontalAlignment: "Center"
                    },
                    {
                        type: "TextBlock",
                        text: "${$root.message}",
                        wrap: true,
                        spacing: "Small"
                    }
                ],
                actions: [
                    {
                        type: "Action.OpenUrl",
                        title: "${$root.actionButton.title}",
                        url: "${$root.actionButton.url}"
                    }
                ],
                $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
                version: "1.4"
            }
        }]
    };

    static sendNotification(
        {
            title = "New Notification",
            message = "Test message",
            actionButton = {
                title: "View",
                url: (
                    (process.env.AWSPROFILE || "Dev") === "Dev" ? "dev." : "www."
                ) + (process.env.SITE_URL || "nexusintelligencenw.nhs.uk")
            }
        },
        callback
    ) {
        try {
            // Setup webhook
            const webhook = new IncomingWebhook(process.env.MSTEAMS_WEBHOOK_URL);

            // Create card
            const card = (new ACData.Template(this.jsonschema)).expand({
                $root: {
                    title,
                    message,
                    actionButton
                }
            });

            // Send notification
            webhook.send(card).then(() => {
                console.log("Microsoft Teams message sent");
                callback(null, "Message sent");
            }, (error) => {
                console.log("Failed to send Microsoft Teams message: " + error);
                callback(error, null);
            });
        } catch (error) {
            callback(error, null);
        }
    }
}

module.exports = MsTeams;
