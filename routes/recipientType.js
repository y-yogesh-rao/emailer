const recipientTypeController = require('../controllers/recipientTypeController');

module.exports = [
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
	}
]