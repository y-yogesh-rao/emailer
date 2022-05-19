const rolePermissionController = require('../controllers/rolePermissionController');

module.exports = [
    {
        method: "GET",
        path: "/admin/listRoles",
        handler: rolePermissionController.listRoles,
		options: {
			tags: ["api", "Role & Permission"],
			notes: "Endpoint to list yards",
			description: "List Yards",
			auth: false,
			validate: {
				options: {
					abortEarly: false
				},
				failAction: async (req, h, err) => {
					return Common.FailureError(err, req);
				},
                query: {
                    status: Joi.number().valid(0,1).optional().default(null),
					pageNumber: Joi.number().integer().optional().default(null),
					limit: Joi.number().integer().min(0).max(50).optional().default(null),
					orderByValue: Joi.string().allow('ASC','DESC').optional().default('DESC'),
					orderByParameter: Joi.string().allow('createdAt','id').optional().default('createdAt'),
                },
				validator: Joi
			},
			pre : [{method: Common.prefunction}]
		}
    },
]