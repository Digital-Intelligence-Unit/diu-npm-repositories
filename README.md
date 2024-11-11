# Digital Intelligence Unit (DIU) @ L&SC ICB - Data Functions NPM Repository

NPM Repository for common functionality accross backend APIs

## Overview

The Digital Intelligence Unit @ NHS L&SC ICB have created a cloud-deployed Business Intelligence application suite with a primary focus on Population Health Management.

## Other Repositories that utilise this deployment

- API Server: <https://github.com/Digital-Intelligence-Unit/NHS_Business_Intelligence_Platform_Api>
- API V2 Server: <https://github.com/Digital-Intelligence-Unit/NHS_Business_Intelligence_Platform_ApiV2>
- Crossfilter Server: <https://github.com/Digital-Intelligence-Unit/NHS_Business_Intelligence_Platform_Crossfilter>

## Pre-requisites

- An AWS Account, with an IAM with required permissions to use CDK
- Locally stored AWS Credentials which grant programmatic access, created in AWS IAM
- Node.js v20 or later installed

## Usage notes
- During testing use yalc to install (npm link causes issues) https://meijer.ws/articles/linking-packages-with-yalc
- Only common functionality should be placed here. Additional logic i.e. models specific to an application should be created in their respective repositories

## Terms of Use

This project and all code within is © Crown copyright and available under the terms of the Open Government 3.0 licence.

The code has been developed and is maintained by the NHS and where possible we will try to adhere to the NHS Open Source Policy (<https://github.com/nhsx/open-source-policy/blob/main/open-source-policy.md>).

It shall remain free to the NHS and all UK public services.

### Contributions

This code has been authored by colleagues in the Digital Intelligence Unit @ L&SC ICB.

_This project and all code within is © Crown copyright and available under the terms of the Open Government 3.0 licence._
