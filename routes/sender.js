const senderController = require('../controllers/senderController');

module.exports = [
    {
		method : "GET",
		path : "/sender/getSenderDetails",
		handler : senderController.getSenderDetails,
		options: {
			tags: ["api", "Sender"],
			notes: "Endpoint to get details of sender",
			description: "Get Sender Details",
			auth: {strategy: 'jwt', scope: ["admin","user","manage-senders"]},
			validate: {
				headers: Joi.object(Common.headers(true)).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false
				},
				query: {
					senderId: Joi.number().integer().required().error(errors=>{return Common.routeError(errors,'SENDER_ID_IS_REQUIRED')}),
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
		path : "/sender/listSenders",
		handler : senderController.listSenders,
		options: {
			tags: ["api", "Sender"],
			notes: "Endpoint to get list of senders",
			description: "List Senders",
			auth: {strategy: 'jwt', scope: ["admin","user","manage-senders"]},
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
					orderByParameter: Joi.string().allow('createdAt','id','senderEmail','senderName','companyName','postalCode').optional().default('createdAt'),
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
		path : "/sender/createSender",
		handler : senderController.createSender,
		options: {
			tags: ["api", "Sender"],
			notes: "Endpoint to create sender",
			description: "Create Sender",
			auth: {strategy: 'jwt', scope: ["admin","user","manage-senders"]},
			validate: {
				headers: Joi.object(Common.headers(true)).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false
				},
				payload: {
					city: Joi.string().max(250).allow("").optional().default(null),
					state: Joi.string().max(250).allow("").optional().default(null),
					country: Joi.string().max(250).allow("").optional().default(null),
					postalCode: Joi.string().max(8).allow("").optional().default(null),
					replyTo: Joi.string().max(250).allow("").optional().default(null),
					companyName: Joi.string().max(250).allow("").optional().default(null),
					companyAddressLine_1: Joi.string().max(5000).allow("").optional().default(null),
					companyAddressLine_2: Joi.string().max(5000).allow("").optional().default(null),
					senderName: Joi.string().max(250).required().error(errors=>{return Common.routeError(errors,'SENDER_NAME_IS_REQUIRED')}),
					senderEmail: Joi.string().email().required().error(errors=>{return Common.routeError(errors,'SENDER_EMAIL_IS_REQUIRED')}),
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
		path : "/sender/updateSender",
		handler : senderController.updateSender,
		options: {
			tags: ["api", "Sender"],
			notes: "Endpoint to update sender details",
			description: "Update Sender",
			auth: {strategy: 'jwt', scope: ["admin","user","manage-senders"]},
			validate: {
				headers: Joi.object(Common.headers(true)).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false
				},
				payload: {
                    city: Joi.string().max(250).allow("").optional().default(null),
					state: Joi.string().max(250).allow("").optional().default(null),
					country: Joi.string().max(250).allow("").optional().default(null),
					replyTo: Joi.string().max(250).allow("").optional().default(null),
					postalCode: Joi.string().max(8).allow("").optional().default(null),
					senderName: Joi.string().max(250).allow("").optional().default(null),
					senderEmail: Joi.string().email().allow("").optional().default(null),
					companyName: Joi.string().max(250).allow("").optional().default(null),
					companyAddressLine_1: Joi.string().max(5000).allow("").optional().default(null),
					companyAddressLine_2: Joi.string().max(5000).allow("").optional().default(null),
                    senderId: Joi.number().integer().required().error(errors=>{return Common.routeError(errors,'SENDER_ID_REQUIRED')}),
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
		path : "/sender/deleteSender",
		handler : senderController.deleteSender,
		options: {
			tags: ["api", "Sender"],
			notes: "Endpoint to delete sender details",
			description: "Delete Sender",
			auth: {strategy: 'jwt', scope: ["admin","user","manage-senders"]},
			validate: {
				headers: Joi.object(Common.headers(true)).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false
				},
				payload: {
                    senderId: Joi.number().integer().required().error(errors=>{return Common.routeError(errors,'SENDER_ID_REQUIRED')}),
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