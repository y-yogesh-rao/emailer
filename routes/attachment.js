"use strict";
const attachmentController = require('../controllers/attachmentController');
module.exports = [
    {
        method: "POST",
        path: "/attachment/upload",
        handler: attachmentController.uploadFile,
		options: {
			tags: ["api", "Attachment"],
			notes: "Endpoint to upload single/multiple attachments",
			description:"Upload attachment",
			auth: false,
			validate: {
				options: {
					abortEarly: false
				},
				failAction: async (req, h, err) => {
					return Common.FailureError(err, req);
				},
                payload: Joi.object({
                    files: Joi.any()
                        .meta({ swaggerType: 'file'}).required()
                        .description('Array of files or object'),
                    user_id: Joi.number().optional().default(1)
                }),
				validator: Joi
			},
            payload: {
                maxBytes: 10000000,
                output: "stream",
                parse: true,
                multipart: true,
                timeout: 60000,
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            },
			pre : [{method: Common.prefunction}]
		}
    },
    {
		method: "DELETE",
		path: "/attachment/delete",
		handler: attachmentController.deleteAttachments,
		options: {
			tags: ["api", "Attachment"],
			notes: "Endpoint to delete single/multiple attachments by id",
			description:"Delete attachment",
			auth: false,
			validate: {
				options: {
					abortEarly: false
				},
				query: {
                    ids : Joi.string().required().description('Comma seperated ids to delete multiple attachments')
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
		path : "/attachment/download",
		handler : attachmentController.downloadFile,
		options: {
			tags: ["api", "Attachment"],
			notes: "Endpoint to download attachment",
			description: "Download Attachment",
			auth: false,
			validate: {
				options: {
					abortEarly: false
				},
				query: {
                    id : Joi.number().required()
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
		path : "/attachment/view",
		handler : attachmentController.viewAttachments,
		options: {
			tags: ["api", "Attachment"],
			notes: "Endpoint to view attachment",
			description: "View Attachment",
			auth: false,
			validate: {
				options: {
					abortEarly: false
				},
				query: {
                    id : Joi.number().required()
				},
				failAction: async (req, h, err) => {
					return Common.FailureError(err, req);
				},
				validator: Joi
			},
			pre : [{method: Common.prefunction}]
		}
	}
]