/* eslint-disable max-len */
const site = process.env.SITE_URL || "dev.nexusintelligencenw.nhs.uk";

module.exports = {
    message_actions: {
        home_page: "https://www." + site,
        account_request: "https://www." + site + "/support/access-request",
        account_request_action: "https://www." + site + "/support/access-request/action",
        permission_request_action: "https://www." + site + "/support/permissions-request/action",
        view_request: "https://www." + site + "/admin/requests",
        team_request_action: "https://api." + site + "/teamrequests/action",
    },
    message_template: `
    <!doctype html>
    <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
            <title>Nexus Intelligence</title>
            <style>
                /* -------------------------------------
                    MAIN TEMPLATE
                ------------------------------------- */
                body {
                    font-family: "Poppins", sans-serif !important;
                    background-color: #eef5f9;
                    font-family: sans-serif;
                    margin: 0;
                    padding: 0;
                }

                table {
                    border-collapse: separate;
                    mso-table-lspace: 0pt;
                    mso-table-rspace: 0pt;
                    width: 100%;
                }

                table td {
                    vertical-align: top;
                }

                .body {
                    background-color: #eef5f9;
                    width: 100%;
                }

                /* Set a max-width, and make it display as block so it will automatically stretch to that width, 
                but will also shrink down on a phone or something */
                .container {
                    display: block;
                    margin: 0 auto !important;
                    /* makes it centered */
                    max-width: 580px;
                    padding: 10px;
                    width: 580px;
                }

                /* This should also be a block element, so that it will fill 100% of the .container */
                .content {
                    box-sizing: border-box;
                    display: block;
                    margin: 0 auto;
                    max-width: 580px;
                    padding: 10px;
                }

                .main {
                    background: #ffffff;
                    border-radius: 3px;
                }

                .wrapper {
                    box-sizing: border-box;
                    padding: 20px;
                }

                /* -------------------------------------
                    RESPONSIVE AND MOBILE FRIENDLY STYLES
                ------------------------------------- */
                @media only screen and (max-width: 620px) {
                    table.body .content {
                        padding: 0 !important;
                    }

                    table.body .container {
                        padding: 0 !important;
                        width: 100% !important;
                    }

                    table.body .main {
                        border-left-width: 0 !important;
                        border-radius: 0 !important;
                        border-right-width: 0 !important;
                    }
                }

                /* -------------------------------------
                    CUSTOM STYLE
                ------------------------------------- */
                .logo {
                    text-align: center;
                    background-color: #27205d;
                    padding: 15px 0px;
                    margin-bottom: 30px;
                }
                .message {
                    font-size: 16px;
                }
                .action {
                    text-align: center;
                }
                .button {
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
        </head>

        <body>
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body">
                <tr>
                    <td>&nbsp;</td>
                    <td class="container">
                        <!-- START CENTERED WHITE CONTAINER -->
                        <table role="presentation" class="main" width="580px">

                            <!-- START MAIN CONTENT AREA -->
                            <tr>
                                <td class="wrapper">
                                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td>
                                                <div class="logo">
                                                    <img style="width: 280px" width="280" src="https://www.nexusintelligencenw.nhs.uk/assets/images/nexusgenNHS.png">
                                                </div>

                                                <div class="message">MESSAGE</div>

                                                <p style="margin-bottom: 0px;">Regards,<br>The Digital Intelligence Team</p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </td>
                    <td>&nbsp;</td>
                </tr>
            </table>
        </body>
    </html>
    `,
};
