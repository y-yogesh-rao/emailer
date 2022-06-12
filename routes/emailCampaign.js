"use strict";
const emailCampaignController = require("../controllers/emailCampaignController");
module.exports = [ 
	{
        method : "POST",
        path : "/email/campaign/createEmailCampaign",
        handler : emailCampaignController.createEmailCampaign,
        options: {
            tags: ["api", "Email Campaign"],
            notes: "Create email campaign and send mails instantlt or schedule the email campaign",
            description: "Create Email Campaign",
            auth: {strategy:'jwt'},
            validate: {
				headers: Joi.object(Common.headers(true,false)).options({
					allowUnknown: true
				}),
                options: {
                    abortEarly: false
                },
                payload: {
                    scheduledAt: Joi.date().min(Moment().format('YYYY-MM-DD hh:mm:ss')).optional().default(null),
                    senderId: Joi.number().integer().required().error(errors=>{return Common.routeError(errors,'SENDER_ID_IS_REQUIRED')}),
                    status: Joi.number().integer().valid(0,1).required().error(errors=>{return Common.routeError(errors,'STATUS_IS_REQUIRED')}),
                    subject: Joi.string().example('Email Subject').required().error(errors=>{return Common.routeError(errors,'SUBJECT_IS_REQUIRED')}),
                    emailTemplateId: Joi.number().integer().required().error(errors=>{return Common.routeError(errors,'EMAIL_TEMPLATE_ID_IS_REQUIRED')}),
                    name: Joi.string().example('Email Campaign Name').required().error(errors=>{return Common.routeError(errors,'CAMPAIGN_NAME_IS_REQUIRED')}),
                    recipients: Joi.array().min(1).items(Joi.number().integer()).required().error(errors=>{return Common.routeError(errors,'RECIPIENTS_IS/ARE_REQUIRED')}),
                },
                failAction: async (req, h, err) => {
                    return Common.FailureError(err, req);
                },
                validator: Joi
            },
            pre : [
				{ method: Common.prefunction },
				{ method: Common.validateApiKeys, assign:'apiKeyValidation' },
			]
        }
    },
	{
		method : "GET",
		path : "/email/campaign/listEmailCampaigns",
		handler : emailCampaignController.listEmailCampaigns,
		options: {
			tags: ["api", "Email Campaign"],
			notes: "Endpoint to list defined email template for portal",
			description:"List email templates",
			auth: {strategy: 'jwt', scope: ["admin","user","manage-email-templates"]},
			validate: {
				headers: Joi.object(Common.headers(true,false)).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false
				},
				query: {
					status: Joi.number().valid(0,1).optional().default(null),
					pageNumber: Joi.number().integer().optional().default(null),
					limit: Joi.number().integer().min(0).max(50).optional().default(null),
					orderByValue: Joi.string().allow('ASC','DESC').optional().default('DESC'),
					orderByParameter: Joi.string().allow('createdAt','id').optional().default('createdAt'),
				},
				failAction: async (req, h, err) => {
					return Common.FailureError(err, req);
				},
				validator: Joi
			},
			pre : [
				{ method: Common.prefunction },
				{ method: Common.validateApiKeys, assign:'apiKeyValidation' },
			]
		}
	},
]