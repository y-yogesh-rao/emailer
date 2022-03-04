const systemController = require('../controllers/systemController');

module.exports = [
    {
		method : "GET",
		path : "/system/initializeUsers",
		handler : systemController.initializeUsers,
		options: {
			tags: ["api", "System"],
			notes: "Endpoint to initialize system users",
			description: "Initialize Users",
			auth: false,
			validate: {
				headers: Joi.object(Common.headers()).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false
				},
				query: {},
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
		path : "/system/initializeSystem",
		handler : systemController.initializeSystem,
		options: {
			tags: ["api", "System"],
			notes: "Endpoint to initialize system",
			description: "Initialize System",
			auth: false,
			validate: {
				headers: Joi.object(Common.headers()).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false
				},
				query: {},
				failAction: async (req, h, err) => {
					return Common.FailureError(err, req);
				},
				validator: Joi
			},
			pre : [{method: Common.prefunction}]
		}
	}
]