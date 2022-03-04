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
                    status: Joi.number().optional().valid(0,1).default(null),
                    pageNumber: Joi.number().integer().optional().default(null),
                    flag: Joi.string().optional().valid('DEFAULT_ROLES','ALL_ROLES').default('DEFAULT_ROLES'),
                },
				validator: Joi
			},
			pre : [{method: Common.prefunction}]
		}
    },
]