exports.getEmailTemplates = async(req,h) => {
    try{
        const emailTemplateId = req.query.emailTemplateId;

        let requestedLanguage = await Models.Language.findOne({where:{code:req.headers.language}});
        let defaultLanguage = await Models.Language.findOne({where:{code:process.env.DEFAULT_LANGUANGE_CODE}});

        if(requestedLanguage && defaultLanguage){
            let responseData = await Models.EmailTemplate.findOne({
                where:{id:emailTemplateId},
                include:[
                    {
                        model:Models.EmailTemplateContent,
                        where:{languageId:requestedLanguage.id},
                        as:"mainContent",
                        required: false
                    },{
                        model:Models.EmailTemplateContent,
                        as:"defaultContent",
                        where:{languageId:defaultLanguage.id},
                        required: false,
                    }
                ]
            });
            return h.response({success:true,message:req.i18n.__('REQUEST_SUCCESSFUL'),responseData:responseData}).code(200);
        } else {
            return h.response({success:false,message:req.i18n.__('INVALID_REQUEST'),responseData:{}}).code(400);
        }
    } catch(error) {
        console.log(error);
        return h.response({success:false,message:req.i18n.__('SOMETHING_WENT_WRONG'),responseData:{}}).code(500);
    }
}

exports.listEmailTemplates = async (req,h) => {
    try{
        const userId = req.auth.credentials.userData.User.id;
        const roleId = req.auth.credentials.userData.User.roleId;

        let where = (roleId === 1) ? {} : {accountId:{[Op.in]:[1,userId]}};
        const limit = req.query.limit !== null ? req.query.limit : Constants.PAGINATION_LIMIT;
        const offset = (req.query.pageNumber-1) * limit;

        let requestedLanguage = await Models.Language.findOne({where:{code:req.headers.language}});
        let defaultLanguage = await Models.Language.findOne({where:{code:process.env.DEFAULT_LANGUANGE_CODE}});

        const orderByValue = req.query.orderByValue;
        const orderByParameter = req.query.orderByParameter;

        if(req.query.status !== null) where={...where,status:req.query.status};

        let options = {
            where,order:[[orderByParameter,orderByValue]],
            include:[
                {
                    model:Models.EmailTemplateContent,
                    where:{languageId:requestedLanguage.id},
                    as:"mainContent",
                    required: false
                },{
                    model:Models.EmailTemplateContent,
                    as:"defaultContent",
                    where:{languageId:defaultLanguage.id},
                    required: false,
                }
            ]
        }

        if(req.query.pageNumber !== null) options={...options,limit,offset};

        if(requestedLanguage && defaultLanguage) {
            let emailTemplates = await Models.EmailTemplate.findAndCountAll(options);
            const totalPages = await Common.getTotalPages(emailTemplates.count,limit);
            const responseData = {
                totalPages,
                perPage: limit,
                totalRecords: emailTemplates.count,
                emailTemplates: emailTemplates.rows,
                baseUrl: process.env.NODE_SERVER_PUBLIC_API
            }
            return h.response({success:true,message:req.i18n.__('REQUEST_SUCCESSFUL'),responseData:responseData}).code(200);
        } else {
            return h.response({success:false,message:req.i18n.__('INVALID_REQUEST'),responseData:{}}).code(400);
        }
    } catch(error) {
        console.log(error);
        return h.response({success:false,message:req.i18n.__('SOMETHING_WENT_WRONG'),responseData:{}}).code(500);
    }
}

exports.createEmailTemplate = async (req,h) => {
    const transaction = await Models.sequelize.transaction();
    try {
        const createdById = req.auth.credentials.userData.User.id;
        const accountId = createdById;
        const lastUpdatedById = createdById;
        
        let languageCode = LanguageCodes.indexOf(req.headers.language);
        let languageId = LanguageIds[LanguageCodes.indexOf(req.headers.language)];

        let {content,subject,code,replacements} = req.payload;

        let defaultLanguage=process.env.DEFAULT_LANGUANGE_CODE_ID;
        let defaultDefined = await Models.EmailTemplate.findOne({where:{code,accountId}});

        let doExists = await Models.EmailTemplate.findOne({where:{code,accountId},include:[
            {model:Models.EmailTemplateContent,where:{languageId}}
        ]});

        if(!doExists) {
            let emailTemplate = {};
            if(defaultDefined) {
                let emailTemplateContentData = await Models.EmailTemplateContent.create({
                    emailTemplateId:defaultDefined.id,
                    languageId,content,subject,replacements
                },{transaction:transaction});

                emailTemplate = defaultDefined;
                emailTemplate.dataValues.EmailTemplateContents = [emailTemplateContentData];
            } else {
                let emailTemplateContent=[];
                console.log(defaultLanguage, languageId)
                if(!defaultDefined && (defaultLanguage != languageId)) {
                    emailTemplateContent.push({
                        languageId:defaultLanguage,
                        content,subject,replacements
                    });
                }
                emailTemplateContent.push({languageId,content,subject,replacements});
                emailTemplate = await Models.EmailTemplate.create({
                    code:req.payload.code,
                    status:Constants.STATUS.ACTIVE,
                    accountId,createdById,lastUpdatedById,
                    EmailTemplateContents:emailTemplateContent
                },{include:[
                    {model:Models.EmailTemplateContent}
                ],transaction:transaction});
            }
            if(emailTemplate) {
                await transaction.commit();
                return h.response({success:true,message: req.i18n.__("EMAIL_TEMPLATE_CREATED_SUCCESSFULLY"),responseData:{createdEmailTemplate:emailTemplate}}).code(201);
            } else {
                await transaction.rollback();
                return h.response({success:false,message: req.i18n.__("ERROR_WHILE_CREATING_EMAIL_TEMPLATE"),responseData:{}}).code(400);
            }
        } else {
            await transaction.rollback();
            return h.response({success:false,message: req.i18n.__("EMAIL_TEMPLATE_ALREADY_EXISTS"),responseData:{}}).code(400);
        }
    } catch(error) {
        console.log(error);
        await transaction.rollback();
        return h.response({success:false,message: req.i18n.__("SOMETHING_WENT_WRONG"),responseData:{}}).code(500);
    }
}

exports.updateEmailTemplate = async (req,h) => {
    const transaction = await Models.sequelize.transaction();
    try{
        const lastUpdatedById = req.auth.credentials.userData.User.id;

        let languageCode = LanguageCodes.indexOf(req.headers.language);
        let languageId = LanguageIds[LanguageCodes.indexOf(req.headers.language)];

        let {content,subject,replacements} = req.payload;

        let emailTemplateId = req.payload.emailTemplateId;
        let doExists = await Models.EmailTemplate.findOne({where:{id:emailTemplateId},include:[
            {model:Models.EmailTemplateContent,where:{languageId}}
        ]});
        if(doExists) {
            const updatedEmailTemplate = await doExists.EmailTemplateContents[0].update({content,subject,replacements,lastUpdatedById},{transaction:transaction});
            await transaction.commit();
            return h.response({success:true,message: req.i18n.__("EMAIL_TEMPLATE_UPDATED_SUCCESSFULLY"),responseData:{updatedEmailTemplate}}).code(200);
        } else {
            await transaction.rollback();
            return h.response({success:false,message: req.i18n.__("EMAIL_TEMPLATE_DO_NOT_EXISTS"),responseData:{}}).code(400);
        }
    } catch (error) {
        await transaction.rollback();
        return h.response({success:false,message: req.i18n.__("SOMETHING_WENT_WRONG"),responseData:{}}).code(500);
    }
}

exports.deleteEmailTemplate = async (req,h) => {
    const transaction = await Models.sequelize.transaction();
    try{
        let emailTemplateId = req.payload.emailTemplateId;
        let doExists = await Models.EmailTemplate.findOne({where:{id:emailTemplateId},include:[{model:Models.EmailTemplate}]});
        if(doExists) {
            let deleteEmailTemplate = await doExists.destroy({where:{id:emailTemplateId},transaction:transaction});
            await Models.EmailTemplateContent.destroy({where:{emailTemplateId:doExists.emailTemplateId},transaction:transaction});
            await transaction.commit();
            return h.response({success:false,message:req.i18n.__("EMAIL_TEMPLATE_DELETED_SUCCESSFULLY"),responseData:{deleteEmailTemplate}}).code(200);
        } else {
            await transaction.rollback();
            return h.response({success:false,message:req.i18n.__('EMAIL_TEMPLATE_DO_NOT_EXIST'),responseData:{}}).code(400);
        }
    } catch(error) {
        console.log(error);
        await transaction.rollback();
        return h.response({success:false,message:req.i18n.__('SOMETHING_WENT_WRONG'),responseData:{}}).code(500);
    }
}

exports.sendMailToRecipients = async (req,h) => {
    const transaction = await Models.sequelize.transaction();
    try {
        const userId = req.auth.credentials.userData.User.id;

        let languageCode = req.headers.language || process.env.DEFAULT_LANGUANGE_CODE;
        let languageId = LanguageIds[LanguageCodes.indexOf(req.headers.language)];

        const senderId = req.payload.senderId;
        const recipients = req.payload.recipients;
        const emailTemplateId = req.payload.emailTemplateId;

        const senderExists = await Models.Sender.findOne({where:{id:senderId}});
        if(!senderExists) {
            await transaction.rollback();
            return h.response({success:false,message:req.i18n.__('SENDER_NOT_FOUND'),responseData:{}}).code(400);
        }

        let emailTemplate = await Models.EmailTemplate.findOne({
            where:{id:emailTemplateId},
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
        
        if(emailTemplate) {
            let replacement = null;
            let subject = emailTemplate.EmailTemplateContents.length > 0 ? emailTemplate.EmailTemplateContents[0].subject : emailTemplate.defaultContent[0].subject;
            let emailContent = emailTemplate.EmailTemplateContents.length > 0 ? emailTemplate.EmailTemplateContents[0].content : emailTemplate.defaultContent[0].content;

            console.log('___________', senderExists.senderEmail)
            await Common.sendEmail(recipients,[process.env.FROM_EMAIL],[],[],subject,emailContent,replacement,[],languageCode,'default');
            await transaction.commit();
            return h.response({success:true,message:req.i18n.__('EMAILS_SENT_TO_RECIPIENTS'),responseData:{}}).code(200);
        } else {
            await transaction.rollback();
            return h.response({success:false,message:req.i18n.__('EMAIL_TEMPLATE_NOT_FOUND'),responseData:{}}).code(400);
        }
    } catch(error) {
        console.log(error);
        await transaction.rollback();
        return h.response({success:false,message:req.i18n.__('SOMETHING_WENT_WRONG'),responseData:{}}).code(500);
    }
}

