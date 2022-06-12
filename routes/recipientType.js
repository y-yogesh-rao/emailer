const recipientTypeController = require('../controllers/recipientTypeController');

module.exports = [
	{
		method : "GET",
		path : "/recipient/getRecipientTypeDetails",
		handler : recipientTypeController.getRecipientTypeDetails,
		options: {
			tags: ["api", "Recipient Type"],
			notes: "Endpoint to get details of recipient type",
			description: "Get Recipient Type Details",
			auth: {strategy: 'jwt', scope: ["admin","user","manage-contact-types"]},
			validate: {
				headers: Joi.object(Common.headers(true)).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false
				},
				query: {
					recipientTypeId: Joi.number().integer().required().error(errors=>{return Common.routeError(errors,'RECIPIENT_TYPE_ID_REQUIRED')}),
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
		path : "/recipientType/listRecipientTypes",
		handler : recipientTypeController.listRecipientTypes,
		options: {
			tags: ["api", "Recipient Type"],
			notes: "Endpoint to get list of recipient types",
			description: "List Recipient Types",
			auth: {strategy: 'jwt'},
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
		method : "POST",
		path : "/recipient/addRecipientType",
		handler : recipientTypeController.addRecipientType,
		options: {
			tags: ["api", "Recipient Type"],
			notes: "Endpoint to add recipient type",
			description: "Add Recipient",
			auth: {strategy: 'jwt', scope: ["admin","user","manage-contact-types"]},
			validate: {
				headers: Joi.object(Common.headers(true)).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false
				},
				payload: {
					recipients: Joi.array().items(Joi.number().integer()).optional().default([]),
					name: Joi.string().max(250).required().error(errors=>{return Common.routeError(errors,'RECIPIENT_TYPE_NAME_IS_REQUIRED')}),
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
		path : "/recipient/updateRecipientType",
		handler : recipientTypeController.updateRecipientType,
		options: {
			tags: ["api", "Recipient Type"],
			notes: "Endpoint to update recipient type details",
			description: "Update Recipient",
			auth: {strategy: 'jwt', scope: ["admin","user","manage-contact-types"]},
			validate: {
				headers: Joi.object(Common.headers(true)).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false
				},
				payload: {
                    name: Joi.string().max(250).allow("").optional().default(null),
					recipients: Joi.array().items(Joi.number().integer()).optional().default([]),
                    recipientTypeId: Joi.number().integer().required().error(errors=>{return Common.routeError(errors,'RECIPIENT_TYPE_ID_REQUIRED')}),
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
		path : "/recipient/deleteRecipientType",
		handler : recipientTypeController.deleteRecipientType,
		options: {
			tags: ["api", "Recipient Type"],
			notes: "Endpoint to delete recipient type",
			description: "Delete Recipient Type",
			auth: {strategy: 'jwt', scope: ["admin","user","manage-contact-types"]},
			validate: {
				headers: Joi.object(Common.headers(true)).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false
				},
				payload: {
                    recipientTypeId: Joi.number().integer().required().error(errors=>{return Common.routeError(errors,'RECIPIENT_TYPE_ID_REQUIRED')}),
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