"use strict";
const emailController = require("../controllers/emailController");
module.exports = [ 
	{
		method : "GET",
		path : "/email/getEmailTemplates",
		handler : emailController.getEmailTemplates,
		options: {
			tags: ["api", "Email"],
			notes: "Endpoint to get defined email template by id",
			description:"Get email template",
			auth: {strategy: 'jwt', scope: ["admin","user","manage-email-templates"]},
			validate: {
				headers: Joi.object(Common.headers(true)).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false
				},
				query: {
					emailTemplateId : Joi.number().integer().error(errors=>{return Common.routeError(errors,'EMAIL_TEMPLATE_ID_IS_REQUIRED')}),
				},
				failAction: async (req, h, err) => {
					return Common.FailureError(err, req);
				},
				validator: Joi
			},
			pre : [{method: Common.prefunction}]
		}
	},
	{
		method : "GET",
		path : "/email/listEmailTemplates",
		handler : emailController.listEmailTemplates,
		options: {
			tags: ["api", "Email"],
			notes: "Endpoint to list defined email template for portal",
			description:"List email templates",
			auth: {strategy: 'jwt', scope: ["admin","user","manage-email-templates"]},
			validate: {
				headers: Joi.object(Common.headers(true)).options({
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
			pre : [{method: Common.prefunction}]
		}
	},
	{
		method : "GET",
		path : "/email/getPreBuiltTemplates",
		handler : emailController.getPreBuiltTemplates,
		options: {
			tags: ["api", "Email"],
			notes: "Endpoint to list defined email template for portal",
			description:"List email templates",
			auth: false,
			validate: {
				headers: Joi.object(Common.headers()).options({
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
			pre : [{method: Common.prefunction}]
		}
	},
    {
		method : "POST",
		path : "/email/createEmailTemplate",
		handler : emailController.createEmailTemplate,
		options: {
			tags: ["api", "Email"],
			notes: "Endpoint to define a new email template for portal",
			description:"Create email template",
			auth: {strategy: 'jwt', scope: ["admin","user","manage-email-templates"]},
			validate: {
				headers: Joi.object(Common.headers(true)).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false
				},
				payload: {
					replacements : Joi.string().optional().default(null),
                    code : Joi.string().required().error(errors=>{return Common.routeError(errors,'EMAIL_TEMPLATE_CODE_IS_REQUIRED')}),
					subject : Joi.string().required().error(errors=>{return Common.routeError(errors,'EMAIL_TEMPLATE_SUBJECT_IS_REQUIRED')}),
					content : Joi.string().required().error(errors=>{return Common.routeError(errors,'EMAIL_TEMPLATE_CONTENT_IS_REQUIRED')}),
				},
				failAction: async (req, h, err) => {
					return Common.FailureError(err, req);
				},
				validator: Joi
			},
			pre : [{method: Common.prefunction}]
		}
	},
	{
        method : "POST",
        path : "/email/sendMailToRecipients",
        handler : emailController.sendMailToRecipients,
        options: {
            tags: ["api", "Email"],
            notes: "Endpoint to send mails to all the recipients by selecting one of the email templates",
            description:"Send Email",
            auth: {strategy: 'jwt', scope: ["admin","user","manage-email-templates"]},
            validate: {
                headers: Joi.object(Common.headers(true)).options({
                    allowUnknown: true
                }),
                options: {
                    abortEarly: false
                },
                payload: {
                    senderId: Joi.number().integer().required().error(errors=>{return Common.routeError(errors,'SENDER_ID_IS_REQUIRED')}),
                    emailTemplateId: Joi.number().integer().required().error(errors=>{return Common.routeError(errors,'EMAIL_TEMPLATE_ID_IS_REQUIRED')}),
                    recipients: Joi.array().items(Joi.string().email()).required().error(errors=>{return Common.routeError(errors,'RECIPIENTS_IS/ARE_REQUIRED')}),
                },
                failAction: async (req, h, err) => {
                    return Common.FailureError(err, req);
                },
                validator: Joi
            },
            pre : [{method: Common.prefunction}]
        }
    },
	{
		method : "PATCH",
		path : "/email/updateEmailTemplate",
		handler : emailController.updateEmailTemplate,
		options: {
			tags: ["api", "Email"],
			notes: "Endpoint to update defined email template for portal by id",
			description:"Update email template",
			auth: {strategy: 'jwt', scope: ["admin","user","manage-email-templates"]},
			validate: {
				headers: Joi.object(Common.headers(true)).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false
				},
				payload: {
					replacements : Joi.string().optional(),
					subject : Joi.string().required().error(errors=>{return Common.routeError(errors,'EMAIL_TEMPLATE_SUBJECT_IS_REQUIRED')}),
					content : Joi.string().required().error(errors=>{return Common.routeError(errors,'EMAIL_TEMPLATE_CONTENT_IS_REQUIRED')}),
					emailTemplateId: Joi.number().required().error(errors=>{return Common.routeError(errors,'EMAIL_TEMPLATE_ID_IS_REQUIRED')}),
				},
				failAction: async (req, h, err) => {
					return Common.FailureError(err, req);
				},
				validator: Joi
			},
			pre : [{method: Common.prefunction}]
		}
	},
	{
		method : "DELETE",
		path : "/email/deleteEmailTemplate",
		handler : emailController.deleteEmailTemplate,
		options: {
			tags: ["api", "Email"],
			notes: "Endpoint to remove defined email template from the portal by id",
			description:"Remove email template",
			auth: {strategy: 'jwt', scope: ["admin","user","manage-email-templates"]},
			validate: {
				headers: Joi.object(Common.headers(true)).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false
				},
				payload: {
					emailTemplateId:Joi.number().required().error(errors=>{return Common.routeError(errors,'EMAIL_TEMPLATE_ID_IS_REQUIRED')}),
				},
				failAction: async (req, h, err) => {
					return Common.FailureError(err, req);
				},
				validator: Joi
			},
			pre : [{method: Common.prefunction}]
		}
	},
	{
        method : "POST",
        path : "/email/sendEmail",
        handler : emailController.sendEmail,
        options: {
            tags: ["api", "Email"],
            notes: "Endpoint to send mail to specified people",
            description:"Send Email",
            auth: false,
            validate: {
                options: {
                    abortEarly: false
                },
                payload: {
                    html: Joi.string().required().error(errors=>{return Common.routeError(errors,'BODY_IS_REQUIRED')}),
                    subject: Joi.string().required().error(errors=>{return Common.routeError(errors,'SUBJECT_IS_REQUIRED')}),
                    to: Joi.string().email().required().error(errors=>{return Common.routeError(errors,'TO_EMAIL_IS_REQUIRED')}),
                    from: Joi.string().email().required().error(errors=>{return Common.routeError(errors,'FROM_EMAIL_IS_REQUIRED')}),
                },
                failAction: async (req, h, err) => {
                    return Common.FailureError(err, req);
                },
                validator: Joi
            },
            pre : [{method: Common.prefunction}]
        }
    },
]