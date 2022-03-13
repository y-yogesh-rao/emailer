const cronController = require('../controllers/cronController');

module.exports = [
	{
        method: "GET",
        path: "/cron/dailyCron",
        handler: cronController.dailyCron,
		options: {
			tags: ["api", "Cron"],
			notes: "Cron Job which runs every day",
			description: "Every Day Cron Job",
			auth: false,
			validate: {
				options: {
					abortEarly: false
				},
				failAction: async (req, h, err) => {
					return Common.FailureError(err, req);
				},
                query: {
                },
				validator: Joi
			},
			pre : [{method: Common.prefunction}]
		}
    },
	// {
    //     method: "GET",
    //     path: "/cron/fiveMinuteCron",
    //     handler: cronController.fiveMinuteCron,
	// 	options: {
	// 		tags: ["api", "Cron"],
	// 		notes: "Cron Job which runs every 5 minutes",
	// 		description: "Every 5 Minute Cron Job",
	// 		auth: false,
	// 		validate: {
	// 			options: {
	// 				abortEarly: false
	// 			},
	// 			failAction: async (req, h, err) => {
	// 				return Common.FailureError(err, req);
	// 			},
    //             query: {
    //             },
	// 			validator: Joi
	// 		},
	// 		pre : [{method: Common.prefunction}]
	// 	}
    // },
]