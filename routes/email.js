"use strict";
const emailController = require("../controllers/emailController");
module.exports = [ 
	{
		method : "GET",
		path : "/email/getEmailTemplates",
		handler : emailController.getEmailTemplates,
		options: {
			tags: ["api", "Email"],
			notes: "Endpoint to get defined email template by code",
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
					code : Joi.string().optional().error(errors=>{return Common.routeError(errors,'EMAIL_TEMPLATE_SUBJECT_IS_REQUIRED')}),
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
					limit: Joi.number().optional(),
					page : Joi.number().optional().default(1),
					subject : Joi.string().optional().error(errors=>{return Common.routeError(errors,'EMAIL_TEMPLATE_SUBJECT_IS_REQUIRED')}),
					content : Joi.string().optional().error(errors=>{return Common.routeError(errors,'EMAIL_TEMPLATE_CONTENT_IS_REQUIRED')}),
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
				headers: Joi.object(Common.headers()).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false
				},
				payload: {
					replacements : Joi.string().optional(),
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
]