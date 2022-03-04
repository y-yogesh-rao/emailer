"use strict";
const Joi = require("joi");
const userController = require("../controllers/userController");

module.exports = [
	{
		method : "GET",
		path : "/admin/listUsers",
		handler : userController.listUsers,
		options: {
			tags: ["api", "User"],
			notes: "Endpoint to list users",
			description: "List Users",
			auth: {strategy:'jwt',scope:['admin']},
			validate: {
				headers: Joi.object(Common.headers(true)).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false
				},
				query:{
					email: Joi.string().optional().default(null),
					companyName: Joi.string().optional().default(null),
					phoneNumber: Joi.string().optional().default(null),
					createdOnFrom: Joi.string().optional().default(null),
					createdOnUpto: Joi.string().optional().default(null),
					status: Joi.number().optional().valid(0,1,2).default(null),
					pageNumber: Joi.number().integer().optional().default(null),
					flag: Joi.string().valid('APPROVED_USERS','PENDING_USERS').optional().default(null),
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
		path : "/admin/updateUserStatus",
		handler : userController.updateUserStatus,
		options: {
			tags: ["api", "User"],
			notes: "Endpoint to update user status",
			description: "Update User Status",
			auth: {strategy:'jwt',scope:['admin']},
			validate: {
				headers: Joi.object(Common.headers(true)).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false
				},
				payload:{
					userId: Joi.number().integer().required().error(errors=>{return Common.routeError(errors,'USER_ID_IS_REQUIRED')}),
					status: Joi.number().valid(0,1,2).required().error(errors=>{return Common.routeError(errors,'STATUS_IS_REQUIRED')})
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
		path : "/admin/getUserDetails",
		handler : userController.getUserDetails,
		options: {
			tags: ["api", "User"],
			notes: "Endpoint to get user details",
			description: "Get User Details",
			auth: {strategy:'jwt',scope:['admin','driver','broker','company','trucker']},
			validate: {
				headers: Joi.object(Common.headers(true)).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false
				},
				query:{
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
		path : "/user/signup",
		handler : userController.signup,
		options: {
			tags: ["api", "User"],
			notes: "Endpoint to register a new user",
			description: "User Signup",
			auth: false,
			validate: {
				headers: Joi.object(Common.headers()).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false
				},
				payload:{
					username: Joi.string().optional().default(null),
					email: Joi.string().email().required().error(errors=>{return Common.routeError(errors,'EMAIL_IS_REQUIRED')}),
					password: Joi.string().required().min(8).error(errors=>{return Common.routeError(errors,'PASSWORD_IS_REQUIRED')}),
					confirmPassword: Joi.string().required().min(8).error(errors=>{return Common.routeError(errors,'CONFIRM_PASSWORD_IS_REQUIRED')})
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
		path : "/user/resendCode",
		handler : userController.resendVerificationCode,
		options: {
			tags: ["api", "User"],
			notes: "Endpoint to resend verification code",
			description: "Resend Verification Code",
			auth: false,
			validate: {
				headers: Joi.object(Common.headers()).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false
				},
				payload:{
					token: Joi.string().required().error(errors=>{return Common.routeError(errors,'TOKEN_IS_REQUIRED')}),
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
		path : "/user/verifyCode",
		handler : userController.verifyCode,
		options: {
			tags: ["api", "User"],
			notes: "Endpoint to verify code",
			description: "Code verification",
			auth: false,
			validate: {
				headers: Joi.object(Common.headers()).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false
				},
				payload:{
					token:Joi.string().required().error(errors=>{return Common.routeError(errors,'TOKEN_IS_REQUIRED')}),
					code:Joi.string().required().error(errors=>{return Common.routeError(errors,'CODE_IS_REQUIRED')}),
					verificationType:Joi.string().required().valid('signup','resetPassword').error(errors=>{return Common.routeError(errors,'VERIFICATION_TYPE_IS_REQUIRED')}),
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
		path : "/user/createAccount",
		handler : userController.createAccount,
		options: {
			tags: ["api", "User"],
			notes: "Endpoint to verify code",
			description: "Code verification",
			auth: {strategy:'jwt'},
			validate: {
				headers: Joi.object(Common.headers(true)).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false
				},
				payload:{
					password: Joi.string().optional().default(null),
					countryCode: Joi.string().optional().default('+1'),
					email: Joi.string().email().optional().default(null),
					userId: Joi.number().integer().allow(null).optional().default(null),
					city: Joi.string().required().error(errors=>{return Common.routeError(errors,'CITY_IS_REQUIRED')}),
					flag: Joi.string().valid('SIGNUP_VIA_USER','SIGNUP_VIA_ADMIN').optional().default('SIGNUP_VIA_USER'),
					state: Joi.string().required().error(errors=>{return Common.routeError(errors,'STATE_IS_REQUIRED')}),
					address: Joi.string().required().error(errors=>{return Common.routeError(errors,'ADDRESS_IS_REQUIRED')}),
					zipCode: Joi.string().required().error(errors=>{return Common.routeError(errors,'ZIP_CODE_IS_REQUIRED')}),
					DIR_number: Joi.string().required().error(errors=>{return Common.routeError(errors,'DIR_NUMBER_IS_REQUIRED')}),
					DOT_number: Joi.string().required().error(errors=>{return Common.routeError(errors,'DOT_NUMBER_IS_REQUIRED')}),
					FEIN_number: Joi.string().required().error(errors=>{return Common.routeError(errors,'FEIN_NUMBER_IS_REQUIRED')}),
					companyName: Joi.string().required().error(errors=>{return Common.routeError(errors,'COMPANY_NAME_IS_REQUIRED')}),
					ethnicOriginId: Joi.number().integer().required().error(errors=>{return Common.routeError(errors,'ETHNIC_ORIGIN_ID_IS_REQUIRED')}),
					CA_MCP_number: Joi.string().required().error(errors=>{return Common.routeError(errors,'CA_MCP_NUMBER_IS_REQUIRED')}),
					phoneNumber: Joi.string().required().length(10).error(errors=>{return Common.routeError(errors,'PHONE_NUMBER_IS_REQUIRED')}),
					attachmentId: Joi.number().integer().required().error(errors=>{return Common.routeError(errors,'ATTACHMENT_ID_IS_REQUIRED')}),
					roleIds: Joi.array().items(Joi.number().integer()).required().error(errors=>{return Common.routeError(errors,'ROLE_IDS_ARE_REQUIRED')}),
					vendorCertifications: Joi.array().items({
						certificate_id: Joi.number().integer().required().error(errors=>{return Common.routeError(errors,'CERTIFICATE_ID_IS_REQUIRED')}),
						attachment_id: Joi.number().integer().required().error(errors=>{return Common.routeError(errors,'ATTACHMENT_ID_IS_REQUIRED')}),
						issueDate: Joi.string().required().error(errors=>{return Common.routeError(errors,'ISSUE_DATE_IS_REQUIRED')}),
						expiryDate: Joi.string().optional().default(null)
					}).optional().default(null),
					leaseAgreementDocuments: Joi.array().items({
						certificate_id: Joi.number().integer().required().error(errors=>{return Common.routeError(errors,'CERTIFICATE_ID_IS_REQUIRED')}),
						attachment_id: Joi.number().integer().required().error(errors=>{return Common.routeError(errors,'ATTACHMENT_ID_IS_REQUIRED')}),
						issueDate: Joi.string().required().error(errors=>{return Common.routeError(errors,'ISSUE_DATE_IS_REQUIRED')}),
						expiryDate: Joi.string().optional().default(null)
					}).optional().default(null),
					truckCompanyCertifications: Joi.array().items({
						certificate_id: Joi.number().integer().required().error(errors=>{return Common.routeError(errors,'CERTIFICATE_ID_IS_REQUIRED')}),
						attachment_id: Joi.number().integer().required().error(errors=>{return Common.routeError(errors,'ATTACHMENT_ID_IS_REQUIRED')}),
						issueDate: Joi.string().required().error(errors=>{return Common.routeError(errors,'ISSUE_DATE_IS_REQUIRED')}),
						expiryDate: Joi.string().optional().default(null)
					}).optional().default(null)
				},
				failAction: async (req, h, err) => {
					return Common.FailureError(err, req);
				},
				validator: Joi
			},
			pre : [{method: Common.prefunction}]
		}
	},
	// {
	// 	method : "GET",
	// 	path : "/user/verifyEmail",
	// 	handler : userController.verifyEmail,
	// 	options: {
	// 		tags: ["api", "User"],
	// 		notes: "Endpoint to verify email by clicking on link",
	// 		description: "Email verification",
	// 		auth: false,
	// 		validate: {
	// 			headers: Joi.object(Common.headers()).options({
	// 				allowUnknown: true
	// 			}),
	// 			options: {
	// 				abortEarly: false
	// 			},
	// 			query: {
	// 				token:Joi.string().required().error(errors=>{return Common.routeError(errors,'TOKEN_IS_REQUIRED')})
	// 			},
	// 			failAction: async (req, h, err) => {
	// 				return Common.FailureError(err, req);
	// 			},
	// 			validator: Joi
	// 		},
	// 		pre : [{method: Common.prefunction}]
	// 	}
	// },
    {
		method : "POST",
		path : "/user/login",
		handler : userController.login,
		options: {
			tags: ["api", "User"],
			notes: "Endpoint to allow user to login to portal with email, mobile or social login options",
			description: "User login",
			auth: false,
			validate: {
				headers: Joi.object(Common.headers()).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false
				},
				payload: {
                    deviceFlag : Joi.string().valid('WEB','APP').optional().default('APP'),
                    username:Joi.string().required().error(errors=>{return Common.routeError(errors,'EMAIL_IS_REQUIRED')}),
                    type : Joi.string().valid('email-password','username-password','mobile-otp','social-login').required().default('email-password'),
                    password:Joi.when('type', {
                        switch: [
                            { is: 'email-password', then: Joi.required().error(errors=>{return Common.routeError(errors,'PASSWORD_IS_REQUIRED')})},
                            { is: 'username-password', then: Joi.required().error(errors=>{return Common.routeError(errors,'PASSWORD_IS_REQUIRED')})}
                        ],
                        otherwise: Joi.optional()
                    }),
                    socialPlatform:Joi.when('type', {
                        switch: [
                            { is: 'social-login', then: Joi.required().default('facebook').valid('google','facebook') }
                        ],
                        otherwise: Joi.optional()
                    }),
					socialWithMobile:Joi.when('type', {
                        switch: [
                            { is: 'social-login', then: Joi.required().valid(0,1) }
                        ],
                        otherwise: Joi.optional().default(0)
                    }),
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
		path : "/user/changePassword",
		handler : userController.changePassword,
		options: {
			tags: ["api", "User"],
			notes: "Endpoint to allow change password",
			description: "Change Password",
			auth: {strategy: 'jwt', scope: ["admin","user","company","broker","trucker","driver"]},
			validate: {
				headers: Joi.object(Common.headers(true)).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false
				},
				payload: {
					oldPassword:Joi.string().required().error(errors=>{return Common.routeError(errors,'OLD_PASSWORD_IS_REQUIRED')}),
					newPassword:Joi.string().required().error(errors=>{return Common.routeError(errors,'NEW_PASSWORD_IS_REQUIRED')}),
					confirmNewPassword:Joi.string().required().error(errors=>{return Common.routeError(errors,'PASSWORD_CONFIRMATION_IS_REQUIRED')}),
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
		path : "/user/generateToken",
		handler : userController.generateToken,
		options: {
			tags: ["api", "User"],
			notes: "Endpoint to send reset/change password request",
			description: "Generate Token",
			auth: {strategy: 'jwt', mode: 'optional'},
			validate: {
				headers: Joi.object(Common.headers()).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false
				},
				payload: {
					tokenType:Joi.string().valid('resetPassword','changeEmail').required().error(errors=>{return Common.routeError(errors,'TOKEN_TYPE_IS_REQUIRED')}),
					email:Joi.string().required().error(errors=>{return Common.routeError(errors,'EMAIL_IS_REQUIRED')}),
					newEmail:Joi.when('tokenType', {
                        switch: [
                            { is: 'changeEmail', then: Joi.required().error(errors=>{return Common.routeError(errors,'NEW_EMAIL_IS_REQUIRED')})}
                        ],
                        otherwise: Joi.optional().default(null)
                    }),
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
		path : "/user/updatePassword",
		handler : userController.updatePassword,
		options: {
			tags: ["api", "User"],
			notes: "Endpoint to allow change/reset password",
			description: "Change Password",
			auth: false,
			validate: {
				headers: Joi.object(Common.headers()).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false
				},
				payload: {
					token:Joi.string().required().error(errors=>{return Common.routeError(errors,'TOKEN_IS_REQUIRED')}),
					code:Joi.string().required().error(errors=>{return Common.routeError(errors,'CODE_IS_REQUIRED')}),
                    password:Joi.string().required().error(errors=>{return Common.routeError(errors,'PASSWORD_IS_REQUIRED')}),
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