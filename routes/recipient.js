const recipientController = require('../controllers/recipientController');

module.exports = [
    {
		method : "GET",
		path : "/recipient/getRecipientDetails",
		handler : recipientController.getRecipientDetails,
		options: {
			tags: ["api", "Recipient"],
			notes: "Endpoint to get details of recipient",
			description: "Get Recipient Details",
			auth: {strategy: 'jwt', scope: ["admin","user","manage-contacts"]},
			validate: {
				headers: Joi.object(Common.headers(true)).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false
				},
				query: {
					recipientId: Joi.number().integer().required().error(errors=>{return Common.routeError(errors,'RECIPIENT_ID_IS_REQUIRED')}),
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
		path : "/recipient/listRecipients",
		handler : recipientController.listRecipients,
		options: {
			tags: ["api", "Recipient"],
			notes: "Endpoint to get list of recipients",
			description: "List Recipients",
			auth: {strategy: 'jwt', scope: ["admin","user","manage-contacts"]},
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
					orderByParameter: Joi.string().allow('createdAt','id','recipientEmail','recipientName','recipientTypeId','postalCode').optional().default('createdAt'),
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
		path : "/recipient/addRecipient",
		handler : recipientController.addRecipient,
		options: {
			tags: ["api", "Recipient"],
			notes: "Endpoint to add recipient",
			description: "Add Recipient",
			auth: {strategy: 'jwt', scope: ["admin","user","manage-contacts"]},
			validate: {
				headers: Joi.object(Common.headers(true)).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false
				},
				payload: {
					attachmentId: Joi.number().integer().optional().default(null),
					addressLine_2: Joi.string().max(5000).optional().default(null),
					alternateRecipientEmail: Joi.string().email().optional().default(null),
					city: Joi.string().max(250).required().error(errors=>{return Common.routeError(errors,'CITY_IS_REQUIRED')}),
					state: Joi.string().max(250).required().error(errors=>{return Common.routeError(errors,'STATE_IS_REQUIRED')}),
					country: Joi.string().max(250).required().error(errors=>{return Common.routeError(errors,'COUNTRY_NAME_IS_REQUIRED')}),
					postalCode: Joi.string().max(8).required().error(errors=>{return Common.routeError(errors,'POSTAL_CODE_IS_REQUIRED')}),
					recipientName: Joi.string().max(250).required().error(errors=>{return Common.routeError(errors,'SENDER_NAME_IS_REQUIRED')}),
					recipientEmail: Joi.string().email().required().error(errors=>{return Common.routeError(errors,'RECIPIENT_EMAIL_IS_REQUIRED')}),
					addressLine_1: Joi.string().max(5000).required().error(errors=>{return Common.routeError(errors,'COMPANY_ADDRESS_1_IS_REQUIRED')}),
					recipientTypeId: Joi.number().integer().required().error(errors=>{return Common.routeError(errors,'RECIPIENT_TYPE_ID_IS_REQUIRED')}),
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
		path : "/recipient/updateRecipient",
		handler : recipientController.updateRecipient,
		options: {
			tags: ["api", "Recipient"],
			notes: "Endpoint to update recipient details",
			description: "Update Recipient",
			auth: {strategy: 'jwt', scope: ["admin","user","manage-contacts"]},
			validate: {
				headers: Joi.object(Common.headers(true)).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false
				},
				payload: {
                    city: Joi.string().max(250).optional().default(null),
					state: Joi.string().max(250).optional().default(null),
					country: Joi.string().max(250).optional().default(null),
					postalCode: Joi.string().max(8).optional().default(null),
					recipientName: Joi.string().max(250).optional().default(null),
					attachmentId: Joi.number().integer().optional().default(null),
					recipientEmail: Joi.string().email().optional().default(null),
                    addressLine_2: Joi.string().max(5000).optional().default(null),
					addressLine_1: Joi.string().max(5000).optional().default(null),
					recipientTypeId: Joi.number().integer().optional().default(null),
					alternateRecipientEmail: Joi.string().email().optional().default(null),
                    recipientId: Joi.number().integer().required().error(errors=>{return Common.routeError(errors,'RECIPIENT_ID_REQUIRED')}),
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
		path : "/recipient/deleteRecipient",
		handler : recipientController.deleteRecipient,
		options: {
			tags: ["api", "Recipient"],
			notes: "Endpoint to delete recipient details",
			description: "Delete Recipient",
			auth: {strategy: 'jwt', scope: ["admin","user","manage-contacts"]},
			validate: {
				headers: Joi.object(Common.headers(true)).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false
				},
				payload: {
                    recipientId: Joi.number().integer().required().error(errors=>{return Common.routeError(errors,'RECIPIENT_ID_REQUIRED')}),
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