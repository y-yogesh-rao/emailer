const getLoginData = async (userId,roleId) => {
    let Permissions=[];
    let userProfile = {};
    let userRolePermissions={};
    userProfile = await Models.UserProfile.findOne({attributes:["firstName","lastName","attachmentId","gender","dob"],where:{userId},include:[{attributes:['uniqueName','path'],model:Models.Attachment}]});
    userRolePermissions =  await Models.Role.findOne({attributes:["id","name"],where:{id:roleId},include:[{attributes:["permissionCode"],model:Models.Permission,required:false}]});
    if(userRolePermissions) {
        Permissions.push(userRolePermissions.name.replace(/ /g,'-').toLowerCase());
        for(let permission of userRolePermissions?.Permissions) Permissions.push(permission.permissionCode)
    }

    return {UserProfile:userProfile,Role:userRolePermissions.Role,Permissions:Permissions};
}

const loginAction = async (user) => {
    let hasFullAccess = 0;
    if(user.roleId === 1) hasFullAccess = 1;
    let userData = await getLoginData(user.id,user.roleId);
    let responseData = {User:user,UserProfile:userData.UserProfile,Role:userData.Role,Permissions:userData.Permissions,hasAllAccess:hasFullAccess}
    const tokenData = responseData;
    let token = Common.signToken(tokenData);
    _.assign(responseData,{token:token});
    return responseData;
}

exports.listUsers = async (req,h) => {
    try {
        let profileWhere={};
        let where={id:{[Op.gte]:2}};
        const limit = Constants.PAGINATION_LIMIT;
        const offset = (req.query.pageNumber-1) * limit;

        let filterFlag=false;
        let timeFilter={};
        if(req.query.email !== null) where={...where, email:req.query.email};
        if(req.query.status !== null) where={...where, status:req.query.status};
        if(req.query.companyName !== null) profileWhere={...profileWhere, companyName:{[Op.like]:`%${req.query.companyName}%`}};
        if(req.query.phoneNumber !== null) profileWhere={...profileWhere, phoneNumber:{[Op.like]:`%${req.query.phoneNumber}%`}};
        if(req.query.createdOnFrom !== null) {
            filterFlag=true;
            timeFilter={...timeFilter,[Op.gte]:Moment(req.query.createdOnFrom,'DD-MM-YYYY').add(-parseInt(utcOffset),'minutes')};
        }
        if(req.query.createdOnUpto !== null) {
            filterFlag=true;
            timeFilter={...timeFilter,[Op.lte]:Moment(req.query.createdOnUpto,'DD-MM-YYYY').add(1,'days').add(-parseInt(utcOffset),'minutes')};
        }

        if(filterFlag) where={...where,createdAt:timeFilter}

        switch(req.query.flag) {
            case 'APPROVED_USERS':
                where={...where,status:{[Op.lte]:Constants.STATUS.ACTIVE}}
                break;
            case 'PENDING_USERS':
                where={...where,status:Constants.STATUS.VERIFICATION_PENDING}
                break;
            default:
                break;
        }

        let options={where,distinct:true,include:[
            {model:Models.Role,where:{id:{[Op.lte]:4}},through:{attributes:[]}},
            {model:Models.UserProfile,where:profileWhere,attributes:{exclude:['deletedAt','updatedAt','user_id']},include:[{model:Models.Attachment,attributes:['id','path']}]},
            {model:Models.UserCertificate,attributes:{exclude:['deletedAt','updatedAt','user_id']},include:[
                {model:Models.Attachment,attributes:['id','path']},
                {model:Models.Certificate,attributes:{exclude:['deletedAt','updatedAt','id']}}
            ]}
        ]};

        if(req.query.pageNumber !== null) options={...options,limit,offset};

        const users = await Models.User.findAndCountAll(options);
        const responseData = await Common.formatListingWithPagination(users);
        return h.response({success:true,message:req.i18n.__('REQUEST_SUCCESSFUL'),responseData:responseData}).code(200);
    } catch (error) {
        console.log(error);
        return h.response({success:false,message:req.i18n.__('SOMETHING_WENT_WRONG'),responseData:{}}).code(500);
    }
}

exports.getUserDetails = async (req,h) => {
    try {
        const userId = req.auth.credentials.userData.User.id;
        const userExists = await Models.User.findOne({
            where:{id:userId},
            include:[{model:Models.Role,attributes:['id','name']}],
            attributes:["id","email","status","roleId","accountId","phoneNumber"],
        });

        let responseData = userExists ? await loginAction(userExists) : null;
        return h.response({success:true,message:req.i18n.__('REQUEST_SUCCESSFUL'),responseData:responseData}).code(200);
    } catch (error) {
        console.log(error);
        return h.response({success:false,message:req.i18n.__('SOMETHING_WENT_WRONG'),responseData:{}}).code(500);
    }
}

exports.updateUserStatus = async (req,h) => {  
    const transaction = await Models.sequelize.transaction();
    try {
        const status = req.payload.status;
        const user_id = req.payload.userId;
        
        const doExists = await Models.User.findOne({where:{id:user_id}});
        if(!doExists) {
            await transaction.rollback();
            return h.response({success:false,message:req.i18n.__('USER_NOT_FOUND'),responseData:{}}).code(400);
        }

        await doExists.update({status},{transaction:transaction});

        await transaction.commit();
        return h.response({success:true,message:req.i18n.__('STATUS_UPDATED_SUCCESSFULLY'),responseData:{}}).code(200);
    } catch (error) {
        console.log(error);
        await transaction.rollback();
        return h.response({success:false,message:req.i18n.__('SOMETHING_WENT_WRONG'),responseData:{}}).code(500);
    }
}

exports.signup = async (req,h) => {
    const transaction = await Models.sequelize.transaction();
    try {
        let languageCode = req.headers.language;
        let languageId = LanguageIds[LanguageCodes.indexOf(req.headers.language)];

        let {email,password,confirmPassword,phoneNumber,countryCode,firstName,lastName,dob,gender} = req.payload;

        if(password !== confirmPassword) {
            await transaction.rollback();
            return h.response({success:false,message:req.i18n.__('PASSWORD_AND_CONFIRM_PASSWORD_DOESNT_MATCH'),responseData:{}}).code(400);
        }

        let VerifyEmail = await Models.User.findOne({where:{email}});
        console.log('******', VerifyEmail);
        let type='signup';
        if(!VerifyEmail) {
            let emailTemplate = await Models.EmailTemplate.findOne({
                where:{code:"SIGNUP_PROCESS"},
                include:[
                    {
                        model:Models.EmailTemplateContent,
                        where:{languageId},
                        required: false
                    },{
                        model:Models.EmailTemplateContent,
                        as:"defaultContent",
                        where:{languageId:process.env.DEFAULT_LANGUANGE_CODE_ID},
                        required: false,
                    }
                ]
            });
            
            if(emailTemplate){
                token = Common.signToken({email,type,password,phoneNumber,countryCode,firstName,lastName,dob,gender});
                code = Common.generateCode(4);

                await Models.Token.upsert({email,token,type,code,status:Constants.STATUS.ACTIVE},{where:{email,type},transaction:transaction});

                let emailContent = emailTemplate.EmailTemplateContents.length > 0 ? emailTemplate.EmailTemplateContents[0].content : emailTemplate.defaultContent[0].content;
                let subject = emailTemplate.EmailTemplateContents.length > 0 ? emailTemplate.EmailTemplateContents[0].subject : emailTemplate.defaultContent[0].subject;
                let replacement = { token:token, code:code, domain:`${process.env.DOMAIN}:${process.env.NODE_PORT}/user/verifyEmail/token=` };

                await Common.sendEmail([email],[process.env.FROM_EMAIL],[],[],subject,emailContent,replacement,[],languageCode,'default');

                await transaction.commit();
                return h.response({success:true,message:req.i18n.__('VERIFICATION_EMAIL_SENT_SUCCESSFULLY'),responseData:{token}}).code(200);
            } else {
                await transaction.rollback();
                return h.response({success:false,message:req.i18n.__('ERROR_WHILE_SENDING_EMAIL'),responseData:{}}).code(400);
            }
        } else {
            await transaction.rollback();
            return h.response({success:false,message:req.i18n.__('EMAIL_ALREADY_IN_USE'),responseData:{}}).code(400);
        }
    } catch (error) {
        console.log(error);
        await transaction.rollback();
        return h.response({success:false,message:req.i18n.__('SOMETHING_WENT_WRONG'),responseData:{}}).code(500);
    }  
}

exports.resendVerificationCode = async (req,h) => {
    try {
        let languageId = LanguageIds[LanguageCodes.indexOf(req.headers.language)];
        let languageCode = req.headers.language;
        let token = req.payload.token;
        let verificationToken = await Models.Token.findOne({where: {token: token}});
        if(verificationToken) {
            if(verificationToken.status === 1) {
                let emailTemplate = await Models.EmailTemplate.findOne({
                    where:{code:"RESEND_EMAIL_TOKEN"},
                    include:[
                        {
                            model:Models.EmailTemplateContent,
                            where:{language_id:languageId},
                            required: false
                        },{
                            model:Models.EmailTemplateContent,
                            as:"defaultContent",
                            where:{language_id:process.env.DEFAULT_LANGUANGE_CODE_ID},
                            required: false,
                        }
                    ]
                });

                let email = verificationToken.email;
                let emailContent = emailTemplate.EmailTemplateContents.length>0 ? emailTemplate.EmailTemplateContents[0].content : emailTemplate.defaultContent[0].content;
                let subject = emailTemplate.EmailTemplateContents.length>0 ? emailTemplate.EmailTemplateContents[0].subject : emailTemplate.defaultContent[0].subject;
                let replacement = { token:token, code:verificationToken.code, domain:`${process.env.DOMAIN}:${process.env.NODE_PORT}/user/verifyEmail/token=` };

                await Common.sendEamil([email],[process.env.FROM_EMAIL],[],[],subject,emailContent,replacement,[],languageCode,'default');

                return h.response({success:true,message:req.i18n.__("VERIFICATION_EMAIL_RESENT_SUCCESSFULLY"),responseData:{token,email}}).code(200);
            } else return h.response({success:false,message:req.i18n.__("EMAIL_ALREADY_VERIFIED"),responseData:{}}).code(400);
        } else return h.response({success:false,message:req.i18n.__("INVALID_TOKEN_PROVIDED"),responseData:{}}).code(400);

    } catch (error) {
        console.log(error)
        return h.response({success:false,message:req.i18n.__("SOMETHING_WENT_WRONG"),responseData:{}}).code(500);
    }
}

exports.verifyCode = async (req,h) => {
    const transaction = await Models.sequelize.transaction();
    try{
        let languageId = LanguageIds[LanguageCodes.indexOf(req.headers.language)];
        let languageCode = req.headers.language;

        let code = req.payload.code;
        let token = req.payload.token;
        let verificationType = req.payload.verificationType;

        let verifyToken = await Models.Token.findOne({where:{token:token,code:code,status:Constants.STATUS.ACTIVE}});
        if (verifyToken) {
            let tokenData = await Common.validateToken(Jwt.decode(token));
            let userData = tokenData.credentials.userData;
            console.log('User data: ', userData);
            switch (verificationType) {
                case 'signup':
                    const rounds = parseInt(process.env.HASH_ROUNDS);
                    let userPassword = Bcrypt.hashSync(userData.password,rounds);
                    const userRole = await Models.Role.findOne({where:{name:'User'}});
                    let email = userData.email;

                    const doExists = await  Models.User.findOne({where:{
                        [Op.or]: [
                            {email:userData.email},
                            {phoneNumber:userData.phoneNumber},
                        ]
                    }})
                    if(doExists) {
                        await transaction.rollback();
                        return h.response({success:false,message:req.i18n.__("EMAIL_OR_PHONE_NUMBER_IS_ALREADY_IN_USE"),responseData:{}}).code(400);
                    }

                    let newUser = await Models.User.create({
                        roleId:userRole.id,
                        email:userData.email,
                        password:userPassword,
                        countryCode:userData.countryCode,
                        phoneNumber:userData.phoneNumber,
                        status:Constants.STATUS.ACTIVE,
                        UserProfile:{
                            gender:userData.gender,
                            lastName:userData.lastName,
                            firstName:userData.firstName,
                            dob:Moment(userData.dob,'YYYY-MM-DD'),
                        }
                    },{include:{model:Models.UserProfile},transaction:transaction});
                    if (newUser) {
                        let pass = "*".repeat(userData.password.length);
                        newUser.dataValues.password = pass;
                        await verifyToken.update({status:Constants.STATUS.INACTIVE,userId:newUser.id},{transaction:transaction});
                        responseData = await loginAction(newUser);

                        //send email to user
                        let emailTemplate = await Models.EmailTemplate.findOne({
                            where:{code:"SIGNUP_SUCCESS"},
                            include:[
                                {
                                    model:Models.EmailTemplateContent,
                                    where:{languageId},
                                    required: false
                                },{
                                    model:Models.EmailTemplateContent,
                                    as:"defaultContent",
                                    where:{languageId:process.env.DEFAULT_LANGUANGE_CODE_ID},
                                    required: false,
                                }
                            ]
                        });
                          
                        let emailContent= emailTemplate.EmailTemplateContents.length>0 ? emailTemplate.EmailTemplateContents[0].content : emailTemplate.defaultContent[0].content;
                        let subject = emailTemplate.EmailTemplateContents.length>0 ? emailTemplate.EmailTemplateContents[0].subject : emailTemplate.defaultContent[0].subject;

                        let replacement = { domain:`${process.env.DOMAIN}:${process.env.NODE_PORT}` };
                        await Common.sendEmail([email],[process.env.FROM_EMAIL],[],[],subject,emailContent,replacement,[],languageCode,'default');

                        await transaction.commit();
                        return h.response({success:true,message:req.i18n.__("USER_VERIFIED_SUCCESSFULLY"),responseData}).code(200);
                    } else {
                        await transaction.rollback();
                        return h.response({success:false,message:req.i18n.__("ERROR_WHILE_CREATING_THE_USER"),responseData:{}}).code(400);
                    }

                case 'resetPassword':
                    let token = req.payload.token;
                    let code = req.payload.code;
                    //let verifyToken = await Models.Token.findOne({where:{token:token,code:code,status:Constants.STATUS.ACTIVE}});
                    let tokenData = await Common.validateToken(Jwt.decode(token));
                    if(verifyToken){
                        let existingAccount={};
                        if(tokenData.isValid){
                            existingAccount = await Models.User.findOne({where:{email:tokenData.credentials.userData.email}});
                            if(existingAccount){
                                // verifyToken.update({status:Constants.STATUS.INACTIVE,user_id:tokenData.credentials.userData.user_id});
                                responseData={token}
                                await transaction.commit();
                                return h.response({success:false,message: req.i18n.__("RESET_PASSWORD_VERIFICATION_SUCCESSFUL"),responseData:responseData}).code(200);
                            } else {
                                await transaction.rollback();
                                return h.response({success:false,message:req.i18n.__('ACCOUNT_DOESNT_EXISTS'),responseData:{}}).code(400);
                            }
                        } else {
                            await transaction.rollback();
                            return h.response({success:false,message:req.i18n.__('INVALID_OR_EXPIRED_TOKEN'),responseData:{}}).code(400);
                        }
                    } else {
                        await transaction.rollback();
                        return h.response({success:false,message:req.i18n.__('INVALID_OR_EXPIRED_TOKEN'),responseData:{}}).code(400);
                    }

                default:
                    await transaction.rollback();
                    return h.response({success:false,message:req.i18n.__("INVALID_REQUEST"),responseData:{}}).code(400);
            }
        } else {
            await transaction.rollback();
            return h.response({success:false,message:req.i18n.__("EXPIRED_OR_INVALID_TOKEN"),responseData:{}}).code(400);
        }
    } catch(error) {
        console.log(error)
        await transaction.rollback();
        return h.response({success:false,message:req.i18n.__("SOMETHING_WENT_WRONG"),responseData:{}}).code(500);
    }
}

exports.createAccount = async (req,h) => {
    const transaction = await Models.sequelize.transaction();
    try {
        const roleIds = req.payload.roleIds;
        const attachment_id = req.payload.attachmentId;
        const ethnicOrigin_id = req.payload.ethnicOriginId;
        const {city,state,zipCode,address} = req.payload;
        const {companyName,FEIN_number,DIR_number,DOT_number,CA_MCP_number,countryCode,phoneNumber} = req.payload;
        
        const vendorCertifications = req.payload.vendorCertifications;
        const truckCompanyCertifications = req.payload.truckCompanyCertifications;
        const leaseAgreementDocuments = req.payload.leaseAgreementDocuments;
        
        const certificates = _.concat(vendorCertifications,truckCompanyCertifications,leaseAgreementDocuments);

        const phoneNumberExists = await Models.UserProfile.findOne({where:{phoneNumber}});
        if(phoneNumberExists) {
            await transaction.rollback();
            return h.response({success:false,message:req.i18n.__('PHONE_NUMBER_HAS_ALREADY_BEEN_TAKEN'),responseData:{}}).code(400);
        }
        
        let userEmail='';
        let userExists='';
        switch(req.payload.flag) {
            case 'SIGNUP_VIA_USER':
                const user_id = req.payload.userId || req.auth.credentials.userData.User.id;
                userExists = await Models.User.findOne({where:{id:user_id}});
                if (!userExists || userExists.status === Constants.STATUS.INACTIVE) {
                    await transaction.rollback();
                    return h.response({success:false,message:req.i18n.__('USER_DOESNT_EXIST_OR_DISABLED_BY_ADMIN'),responseData:{}}).code(400);
                }

                const userProfileExists = await Models.UserProfile.findOne({where:{user_id}});
                if (userProfileExists) {
                    await transaction.rollback();
                    return h.response({success:false,message:req.i18n.__('PROFILE_ALREADY_EXISTS'),responseData:{}}).code(400);
                }

                await Models.UserProfile.create({user_id,attachment_id,ethnicOrigin_id,companyName,FEIN_number,DIR_number,DOT_number,CA_MCP_number,countryCode,phoneNumber},{transaction:transaction});
                await Models.Address.create({user_id,city,state,zipCode,address},{transaction:transaction});
                for(let certificate of certificates) {
                    certificate['issueDate'] = Moment(certificate.issueDate,'DD-MM-YYYY');
                    certificate['expiryDate'] = certificate.expiryDate !== null ? Moment(certificate.expiryDate,'DD-MM-YYYY') : undefined;
                    certificate = {...certificate, user_id}

                    await Models.UserCertificate.create(certificate, {transaction:transaction});
                    let foundAttachment = await Models.Attachment.findOne({where:{id:certificate.attachment_id}});
                    if (foundAttachment) await foundAttachment.update({in_use:Constants.STATUS.ACTIVE},{transaction:transaction});
                }

                await userExists.setRoles(roleIds,{transaction:transaction});
                await Models.CompanyMinWage.create({company_id:userExists.id,baseHourlyRate:0,overTimeHourlyRate:0,doubleTimeHourlyRate:0},{transaction:transaction});
                await transaction.commit();
                userEmail = userExists.email;
                break;
            
            case 'SIGNUP_VIA_ADMIN':
                const {email,password} = req.payload;
                let userPassword = Bcrypt.hashSync(password,parseInt(process.env.HASH_ROUNDS))
                
                userExists = await Models.User.findOne({where:{email}});
                if (userExists) {
                    await transaction.rollback();
                    return h.response({success:false,message:req.i18n.__('EMAIL_ALREADY_TAKEN'),responseData:{}}).code(400);
                }

                const createdUser = await Models.User.create({
                    email,username:null,password:userPassword,status:Constants.STATUS.ACTIVE,account_id:1,
                    UserProfile:{attachment_id,ethnicOrigin_id,companyName,FEIN_number,DIR_number,DOT_number,CA_MCP_number,countryCode,phoneNumber},
                    Address:{city,state,zipCode,address}
                },{include:[{model:Models.UserProfile},{model:Models.Address}],transaction:transaction});

                for(let certificate of certificates) {
                    certificate['issueDate'] = Moment(certificate.issueDate,'DD-MM-YYYY');
                    certificate['expiryDate'] = certificate.expiryDate !== null ? Moment(certificate.expiryDate,'DD-MM-YYYY') : undefined;
                    certificate = {...certificate, user_id:createdUser.id}

                    await Models.UserCertificate.create(certificate, {transaction:transaction});
                    let foundAttachment = await Models.Attachment.findOne({where:{id:certificate.attachment_id}});
                    if (foundAttachment) await foundAttachment.update({in_use:Constants.STATUS.ACTIVE},{transaction:transaction});
                }

                await createdUser.setRoles(roleIds,{transaction:transaction});
                await Models.CompanyMinWage.create({company_id:createdUser.id,baseHourlyRate:0,overTimeHourlyRate:0,doubleTimeHourlyRate:0},{transaction:transaction});
                await transaction.commit();
                userEmail = email;
                break;
        }

        const updatedUser = await Models.User.findOne({
            attributes:["id","email","status","password","account_id"],
            where:{email:userEmail},
            include:[{model:Models.Role,attributes:['id','name']}]
        });
        const responseData = await loginAction(updatedUser);

        return h.response({success:true,message:req.i18n.__('ACCOUNT_CREATED_SUCCESSFULLY'),responseData:responseData}).code(201);
    } catch (error) {
        console.log(error);
        await transaction.rollback();
        return h.response({success:false,message:req.i18n.__('SOMETHING_WENT_WRONG_WHILE_CREATING_ACCOUNT'),responseData:{}}).code(500);
    }
}

exports.verifyEmail = async (req,h) => {
    const transaction = await Models.sequelize.transaction();
    try{
        let existingAccount={};
        let languageId = LanguageIds[LanguageCodes.indexOf(req.headers.language)];
        let languageCode = req.headers.language;
        let token = req.query.token;
        let tokenData = await Common.validateToken(Jwt.decode(token));
        let userData = tokenData.credentials.userData;
        if(tokenData.isValid){
            switch(tokenData.credentials.userData.type){
                case 'signup':
                    let verifyToken = await Models.Token.findOne({where:{token:token,code:code,status:Constants.STATUS.ACTIVE}});
                    const rounds = parseInt(process.env.HASH_ROUNDS);
                    let role = await Models.Role.findOne({where:{name:'user'}});
                    let userPassword = Bcrypt.hashSync(userData.password,rounds);
                    let name = userData.firstName+" "+userData.lastName;
                    let email = userData.email;
                    let newUser = await Models.User.create({
                        email:userData.email,
                        username: userData.username,
                        alternateEmail: userData.alternateEmail,
                        password:userPassword,
                        status:Constants.STATUS.ACTIVE,
                        role_id:role.id,
                        UserProfile:{
                            firstName:userData.firstName,
                            lastName:userData.lastName,
                            username: userData.username
                        }
                    },{include:[{model:Models.UserProfile}],transaction:transaction});
                    if(newUser){
                        let pass = "*".repeat(userData.password.length);
                        let userObject = {id:newUser.id, email:newUser.email,username: newUser.UserProfile.username, status:newUser.status, password:pass, role_id:newUser.role_id, package_id:newUser.package_id, account_id:newUser.account_id, kyc_status: 0, token_status: 0};
                        await transaction.commit();

                        verifyToken.update({status:Constants.STATUS.INACTIVE, user_id: newUser.id});
                        responseData = await loginAction(userObject);

                        //send email to user
                        let emailTemplate = await Models.EmailTemplate.findOne({
                            where:{code:"SIGNUP_SUCCESS"},
                            include:[
                                {
                                    model:Models.EmailTemplateContent,
                                    where:{language_id:languageId},
                                    required: false
                                },{
                                    model:Models.EmailTemplateContent,
                                    as:"defaultContent",
                                    where:{language_id:process.env.DEFAULT_LANGUANGE_CODE_ID},
                                    required: false,
                                }
                            ]
                          });
                          
                          let emailContent= emailTemplate.EmailTemplateContents.length>0 ? emailTemplate.EmailTemplateContents[0].content : emailTemplate.defaultContent[0].content;
                          let subject = emailTemplate.EmailTemplateContents.length>0 ? emailTemplate.EmailTemplateContents[0].subject : emailTemplate.defaultContent[0].subject;
                          let replacement = {name:name,domain:process.env.DOMAIN};
                          await Common.sendEamil([email],[process.env.FROM_EMAIL],[],[],subject,emailContent,replacement,[],languageCode,'default');

                        //admin notification
                        await Models.Notification.create({
                            type: Constants.NOTIFICATION.NEW_USER,
                            userId: 0,
                            title: Constants.NEW_USER,
                            detail: Constants.NEW_USER_MSG
                        });
                        return h.response({responseData:responseData, message:req.i18n.__("USER_VERIFIED_SUCCESSFULLY")}).code(200);
                    }else{
                        return Common.generateError(req,400,'ERROR_WHILE_CREATING_THE_USER',{}); 
                    }
                case 'changeEmail':
                    existingAccount = await Models.User.findOne({
                        where:{email:tokenData.credentials.userData.email},
                        include: [{model: Models.UserProfile}]
                    });
                    if(existingAccount){
                        existingAccount.update({email:userData.newEmail}, {transaction:transaction});
                        foundToken = await Models.Token.findOne({where:{token:token,status:Constants.STATUS.ACTIVE}});
                        foundToken.update({status:Constants.STATUS.INACTIVE});
                        transaction.commit();

                        let emailTemplate = await Models.EmailTemplate.findOne({
                            where:{code:"CHANGE_EMAIL_SUCCESS"},
                            include:[
                                {
                                    model:Models.EmailTemplateContent,
                                    where:{language_id:languageId},
                                    required: false
                                },{
                                    model:Models.EmailTemplateContent,
                                    as:"defaultContent",
                                    where:{language_id:process.env.DEFAULT_LANGUANGE_CODE_ID},
                                    required: false,
                                }
                            ]
                        });
                        let emailContent= emailTemplate.EmailTemplateContents.length>0 ? emailTemplate.EmailTemplateContents[0].content : emailTemplate.defaultContent[0].content;
                        let subject = emailTemplate.EmailTemplateContents.length>0 ? emailTemplate.EmailTemplateContents[0].subject : emailTemplate.defaultContent[0].subject;
                        let name = existingAccount.UserProfile.firstName+' '+existingAccount.UserProfile.lastName;
                        let replacement = {name:name};
                        await Common.sendEamil([userData.newEmail, tokenData.credentials.userData.email],[process.env.FROM_EMAIL],[],[],subject,emailContent,replacement,[],languageCode,'default');
                        return h.response({
                            message: req.i18n.__("EMAIL_CHANGED_SUCCESSFULLY")
                        }).code(200);
                    }else{
                        return Common.generateError(req,400,'INVALID_TOKEN',{});
                    }
                default:
                    return Common.generateError(req,400,'INVALID_REQUEST',{});
            }
        }
    }catch(err){
        await transaction.rollback();
        return Common.generateError(req,500,'SOMETHING_WENT_WRONG_WITH_EXCEPTION',err);
    }
}

exports.login = async (req,h) => {
    try{
        let user=null;
        let newUser={};
        let userExists ={};
        let userProfile={};
        let responseData={};
        let passwordVerification='';
        switch(req.payload.type) {
            case 'email-password':
                user=await Models.User.findOne({
                    where:{email:req.payload.username},
                    include:[{model:Models.Role,attributes:['id','name']}],
                    attributes:["id","email","status","password","roleId","accountId","phoneNumber"],
                });
                if (user) {
                    if (user.status === Constants.STATUS.INACTIVE) {
                        return h.response({success:false,message:req.i18n.__("PROFILE_BLOCKED_BY_ADMIN"),responseData:{}}).code(400);
                    } else {
                        passwordVerification = Bcrypt.compareSync(req.payload.password,user.password);
                        if (passwordVerification) {
                            user.dataValues.password = "*".repeat(req.payload.password.length);
                            responseData = await loginAction(user);
                            return h.response({success:true,message:req.i18n.__("AUTHROIZATION_VALIDATED_SUCCESSFULLY"),responseData:responseData}).code(200);
                        } else return h.response({success:false,message:req.i18n.__("INVALID_EMAIL_OR_PASSWORD"),responseData:{}}).code(403);
                    }
                } else return h.response({success:false,message:req.i18n.__("USER_DOES_NOT_EXISTS"),responseData:{}}).code(403);
            case 'username-password':
                user=await Models.User.findOne({where:{username:req.payload.username}});
                if(user) {
                    passwordVerification = Bcrypt.compareSync(req.payload.password,user.password);
                    if (passwordVerification) {
                        user.dataValues.password = "*".repeat(req.payload.password.length);
                        responseData = await loginAction(user);
                        return h.response({success:true,message:req.i18n.__("AUTHROIZATION_VALIDATED_SUCCESSFULLY"),responseData:responseData}).code(200);
                    } else return h.response({success:false,message:req.i18n.__("INCORRECT_PASSWORD"),responseData:{}}).code(403);
                } else return h.response({success:false,message:req.i18n.__("INVALID_USERNAME"),responseData:{}}).code(403);
            case 'mobile-otp':
                user=await Models.User.findOne({where:{mobile:req.payload.username}});
                sendOTP=Common.verifyOTP(req.payload.username);
                if (sendOTP.pinId) {
                    return h.response({
                        responseData: {mobile:req.payload.username,pinId:sendOTP.pinId},
                        message: req.i18n.__("OTP_SENT_SUCCESSFULLY")
                    });
                } else {
                    return Common.generateError(req,400,'ERROR_WHILE_SENDING_OTP',{}); 
                }
            case 'social-login':
                token = request.payload.socialToken;
                platform = request.payload.socialPlatform;
                let verification = await verifySocialLogin(platform,accessToken);
                if(verification){
                    userExists = await Models.User.findOne({where:{[Op.or]:[{email:req.payload.username},{mobile:req.payload.username}]}});
                    if(userExists){
                        responseData = await loginAction(user);
                        return h.response({
                            responseData:responseData,
                            message: req.i18n.__("AUTHORIZATION_VALIDATED_SUCCESSFULLY")
                        });
                    }else{
                        const transaction = await Models.sequelize.transaction(); 
                        try{
                            switch(socialWithMobile){
                                case 0:
                                    userProfile={firstName:req.payload.firstName,lastName:req.payload.lastName};
                                    newUser=await Models.User.create({email:req.payload.username,UserProfile:userProfile},{include:[{model:Models.UserProfile}],transaction:transaction});
                                    if(newUser){
                                        await transaction.commit();
                                        responseData = await loginAction(newUser);
                                        return h.response({
                                            responseData:responseData,
                                            message: req.i18n.__("AUTHORIZATION_VALIDATED_SUCCESSFULLY")
                                        });
                                    }else{
                                        await transaction.rollback();
                                        return Common.generateError(req,400,'ERROR_WHILE_CREATING_ACCOUNT_FOR_SOCIAL_LOGIN',{});
                                    }
                                    break;
                                case 1:
                                    userProfile={firstName:req.payload.firstName,lastName:req.payload.lastName};
                                    newUser=await Models.User.create({mobile:req.payload.username,UserProfile:userProfile},{include:[{model:Models.UserProfile}],transaction:transaction});
                                    if(newUser){
                                        await transaction.commit();
                                        responseData = await loginAction(newUser);
                                        return h.response({
                                            responseData:responseData,
                                            message: req.i18n.__("AUTHORIZATION_VALIDATED_SUCCESSFULLY")
                                        });
                                    }else{
                                        await transaction.rollback();
                                        return Common.generateError(req,400,'ERROR_WHILE_CREATING_ACCOUNT_FOR_SOCIAL_LOGIN',{});
                                    }
                                    break;

                                default: 
                                    return Common.generateError(req,400,'AUTHORIZATION_FAILED',{}); 
                                    break;
                            }
                        }catch(err){
                            await transaction.rollback();
                            return Common.generateError(req,500,'EXCEPTION_WHILE_CREATING_ACCOUNT_FOR_SOCIAL_LOGIN',{});
                        }
                    }
                }else{
                    return Common.generateError(req,400,'TOKEN_VERIFICATION_FAILED',{});
                }
                break;
            
            default:
                return Common.generateError(req,400,'LOGIN_METHOD_NOT_SUPPORTED',{});
        }
    } catch (error) {
        console.log(error);
        return h.response({success:false,message:req.i18n.__('SOMETHING_WENT_WRONG'),responseData:{}}).code(500);
    }
}

exports.changePassword = async (req,h) => {
    const transaction = await Models.sequelize.transaction();
    try {
        let userId = req.auth.credentials.userData.User.id;
        let oldPassword = req.payload.oldPassword;
        let newPassword = req.payload.newPassword;
        let confirmNewPassword = req.payload.confirmNewPassword;

        const rounds = parseInt(process.env.HASH_ROUNDS);
        let user = await Models.User.findOne({where:{id:userId}});
        let oldPasswordVerification = Bcrypt.compareSync(oldPassword,user.password);
        
        if (newPassword === confirmNewPassword) {
            if (oldPasswordVerification) {
                let userNewPassword = Bcrypt.hashSync(newPassword,rounds);
                await Models.User.update({password:userNewPassword},{where:{id:userId},transaction:transaction});
                await transaction.commit();
                return h.response({success:true,message: req.i18n.__("PASSWORD_CHANGED_SUCCESSFULLY"),responseData:{}}).code(200);
            } else {
                await transaction.rollback();
                return h.response({success:false,message:req.i18n.__('OLD_PASSWORD_VERIFICATION_FAILED'),responseData:{}}).code(400);
            }
        } else {
            await transaction.rollback();
            return h.response({success:false,message:req.i18n.__('OLD_AND_NEW_PASSWORD_DO_NOT_MATCH'),responseData:{}}).code(400);
        }
    } catch (err) {
        await transaction.rollback();
        return h.response({success:false,message:req.i18n.__('SOMETHING_WENT_WRONG'),responseData:{}}).code(500);
    }
}

exports.generateToken = async (req,h) => {
    const transaction = await Models.sequelize.transaction();
    try{
        let languageId = LanguageIds[LanguageCodes.indexOf(req.headers.language)];
        let languageCode = req.headers.language;
        let type = req.payload.tokenType;
        let email = req.payload.email;
        let newEmail = req.payload.newEmail;
        let token={};
        let emailTemplate={};
        let code = Common.generateCode(4);
        let userInfo=await Models.User.findOne({where:{email:email},include:[{model:Models.UserProfile}]});
        if(!userInfo) {
            await transaction.rollback();
            return h.response({success:false,message:req.i18n.__('USER_WITH_PROVIDED_EMAIL_DOESNT_EXIST'),responseData:{}}).code(400);
        }
        switch(req.payload.tokenType){
            case 'resetPassword':
                emailTemplate = await Models.EmailTemplate.findOne({
                    where:{code:"RESET_PASSWORD"},
                    include:[
                        {
                            model:Models.EmailTemplateContent,
                            where:{language_id:languageId},
                            required: false
                        },{
                            model:Models.EmailTemplateContent,
                            as:"defaultContent",
                            where:{language_id:process.env.DEFAULT_LANGUANGE_CODE_ID},
                            required: false,
                        }
                    ]
                });
                token = Common.signToken({email:email,type:type,user_id:userInfo.id});
                newEmail=email;
                break;
            case 'changeEmail':
                let newEmailInfo=await Models.User.findOne({where:{[Op.or]:[{email:newEmail},{alternateEmail:newEmail}]}});
                if(newEmailInfo) {
                    return Common.generateError(req,400,'NEW_EMAIL_HAS_ALREADY_BEEN_TAKEN',{});
                }
                emailTemplate = await Models.EmailTemplate.findOne({
                    where:{code:"CHANGE_EMAIL"},
                    include:[
                        {
                            model:Models.EmailTemplateContent,
                            where:{language_id:languageId},
                            required: false
                        },{
                            model:Models.EmailTemplateContent,
                            as:"defaultContent",
                            where:{language_id:process.env.DEFAULT_LANGUANGE_CODE_ID},
                            required: false,
                        }
                    ]
                });
                token = Common.signToken({email:email,newEmail:newEmail,type:type,user_id:userInfo.id});
                break;
            default:
                return h.response({success:false,message:req.i18n.__('INVALID_REQUEST_TYPE'),responseData:{}}).code(400);
        }
        if(emailTemplate && userInfo){
            await Models.Token.upsert({email:userInfo.email,token:token,type:type,code:code,status:Constants.STATUS.ACTIVE},{where:{user_id: userInfo.id, email:email},transaction:transaction});
            let emailContent= emailTemplate.EmailTemplateContents.length>0?emailTemplate.EmailTemplateContents[0].content:emailTemplate.defaultContent[0].content;
            let subject = emailTemplate.EmailTemplateContents.length>0?emailTemplate.EmailTemplateContents[0].subject:emailTemplate.defaultContent[0].subject;
            let replacement = {code:code};
            let cc=[];
            await Common.sendEamil([newEmail],[process.env.FROM_EMAIL],cc,[],subject,emailContent,replacement,[],languageCode,'default');
            await transaction.commit();
            return h.response({success:true,message:req.i18n.__("EMAIL_SENT_TO_PROCESS_REQUEST"),responseData:{token:token}}).code(200);
        } else {
            await transaction.rollback();
            return h.response({success:false,message:req.i18n.__('INVALID_EMAIL_OR_EMAIL_TEMPLATE_NOT_CREATED'),responseData:{}}).code(400);
        }
    } catch (error) {
        console.log(error);
        await transaction.rollback();
        return h.response({success:false,message:req.i18n.__('SOMETHING_WENT_WRONG'),responseData:{}}).code(500);
    }

}

exports.updatePassword = async (req,h) => {
    const transaction = await Models.sequelize.transaction();
    try{
        let token = req.payload.token;
        let code = req.payload.code;
        let password = req.payload.password;
        let verifyToken = await Models.Token.findOne({where:{token:token,code:code,status:Constants.STATUS.ACTIVE}});
        let tokenData = await Common.validateToken(Jwt.decode(token));
        if(verifyToken){
            let existingAccount={};
            if(tokenData.isValid){
                existingAccount = await Models.User.findOne({where:{email:tokenData.credentials.userData.email}});
                if(existingAccount){
                    const rounds = parseInt(process.env.HASH_ROUNDS);
                    let userPassword = Bcrypt.hashSync(password,rounds);
                    await Models.User.update(
                        {password: userPassword},
                        { where:{ email: tokenData.credentials.userData.email},transaction:transaction}
                    );
                    verifyToken.update({status:Constants.STATUS.INACTIVE,user_id:tokenData.credentials.userData.user_id});
                    newUser = await Models.User.findOne({where:{email:tokenData.credentials.userData.email}});
                    let pass = "*".repeat(password.length);
                    let responseData = {id:newUser.id,email:newUser.email,status:newUser.status,password:pass,account_id:newUser.account_id}
                    await transaction.commit();
                    return h.response({responseData:responseData,message: req.i18n.__("PASSWORD_UPDATED_SUCCESSFULLY")}).code(200);
                }else{
                    await transaction.rollback();
                    return Common.generateError(req,400,'ACCOUNT_DOES_NOT_EXISTS',{}); 
                }
            }else{
                await transaction.rollback();
                return Common.generateError(req,400,'INVALID_OR_EXPIRED_TOKEN',{}); 
            }
        }else{
            await transaction.rollback();
            return Common.generateError(req,400,'INVALID_OR_EXPIRED_TOKEN',{}); 
        }
    }catch(err){
        await transaction.rollback();
        return Common.generateError(req,500,'SOMETHING_WENT_WRONG_WITH_EXCEPTION',err);
    }
}

exports.updateUserProfile = async (req,h) => {
    const transaction = await Models.sequelize.transaction();
    try {
        const user_id = req.auth.credentials.userData.User.id;
        let updationObject = {
            attachment_id: req.payload.attachmentId,
            ethnicOrigin_id: req.payload.ethnicOriginId,
            companyName: req.payload.companyName,
            FEIN_number: req.payload.FEIN_number,
            DOT_number: req.payload.DOT_number,
            DIR_number: req.payload.DIR_number,
            CA_MCP_number: req.payload.CA_MCP_number,
            countryCode: req.payload.countryCode,
            phoneNumber: req.payload.phoneNumber,
            isMinority: req.payload.isMinority
        }

        const doExists = await Models.UserProfile.findOne({where:{user_id}})
        if(!doExists) {
            await transaction.rollback();
            return h.response({success:false,message:req.i18n.__('PROFILE_NOT_FOUND'),responseData:{}}).code(400);
        }

        await doExists.update(updationObject, {transaction:transaction});

        await transaction.commit();
        return h.response({success:true,message:req.i18n.__('PROFILE_UPDATED_SUCCESSFULLY'),responseData:{}}).code(200);
    } catch (error) {
        console.log(error);
        await transaction.rollback();
        return h.response({success:false,message:req.i18n.__('SOMETHING_WENT_WRONG'),responseData:{}}).code(500);
    }
}
