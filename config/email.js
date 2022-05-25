const site = process.env.SITE_URL || "nexusintelligencenw.nhs.uk";
const fullSite = ((process.env.AWSPROFILE || "Dev") === "Dev" ? "dev." : "www.") + site;
const fullApi = ((process.env.AWSPROFILE || "Dev") === "Dev" ? "dev." : "") + site;

module.exports = {
    message_actions: {
        home_page: "https://" + fullSite,
        account_request: "https://" + fullSite + "/support/access-request",
        account_request_approve: "https://" + fullSite + "/support/access-request/approve",
        account_request_deny: "https://" + fullSite + "/support/access-request/deny",
        sign_acknowledgement: "https://messaging." + fullApi + "/acknowledgements/confirmack",
    },
    message_template: `
        <style>
            @import url('https://fonts.googleapis.com/css?family=Poppins&display=swap');
            div { width: calc(100% - 30px); }
            .full { margin: 15px; }
            .body { background-color: #eef5f9; width: 100%; padding: 10px 0px; }
            .header { background-color: #27205d; padding: 10px 5px; text-align: center;  }
            .main { font-family: "Poppins", sans-serif !important; }
            .footer { text-align: center; }
            .mat-card {
                transition: box-shadow 280ms cubic-bezier(.4,0,.2,1);
                display: block;
                position: relative;
                padding: 16px;
                border-radius: 4px;
                background-color: white;
            }
            .mat-button {
                border-radius: 5px;
                font-family: "Poppins", sans-serif !important;
                box-sizing: border-box;
                position: relative;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
                cursor: pointer;
                outline: 0;
                border: none;
                -webkit-tap-highlight-color: transparent;
                display: inline-block;
                white-space: nowrap;
                text-decoration: none;
                vertical-align: baseline;
                text-align: center;
                margin: 2px 10px;
                min-width: 64px;
                line-height: 36px;
                padding: 0 16px;
                border-radius: 4px;
                overflow: visible;
                transform: translate3d(0,0,0);
                transition: background .4s cubic-bezier(.25,.8,.25,1),box-shadow 280ms cubic-bezier(.4,0,.2,1);
                color: white;
            }
            .action {
                text-align: center;
            }
            .primary {
                background-color: #1e88e5;
            }
            .accent {
                background-color: #3f51b5;
            }
            .warn {
                background-color: #e91e63;
            }
            .default {
                color: black !important;
                background-color: white;
                border: 1px solid darkgray;
            }
        </style>
        <div class="body">
            <div class="full main mat-card">MESSAGE</div>
        </div>
    `,
};
