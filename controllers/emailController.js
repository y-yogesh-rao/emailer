exports.createEmailTemplate = async (req,h) => {
    const transaction = await Models.sequelize.transaction();
    try{
        let languageCode = LanguageCodes.indexOf(req.headers.language);
        let languageId = LanguageIds[LanguageCodes.indexOf(req.headers.language)];

        let {content,subject,code,replacements} = req.payload;

        let defaultLanguage=process.env.DEFAULT_LANGUANGE_CODE_ID;
        let defaultDefined = await Models.EmailTemplate.findOne({where:{code}});

        let doExists = await Models.EmailTemplate.findOne({where:{code},include:[
            {model:Models.EmailTemplateContent,where:{languageId}}
        ]});

        if(!doExists) {
            let emailTemplate = {};
            if(defaultDefined){
                let emailTemplateContentData = await Models.EmailTemplateContent.create({
                    emailTemplateId:defaultDefined.id,
                    languageId,content,subject,replacements
                },{transaction:transaction});

                emailTemplate = defaultDefined;
                emailTemplate.dataValues.EmailTemplateContents = [emailTemplateContentData];
            } else {
                let emailTemplateContent=[];
                if(!defaultDefined && defaultLanguage !== languageId) {
                    emailTemplateContent.push({
                        languageId:defaultLanguage,
                        content,subject,replacements
                    });
                }
                emailTemplateContent.push({languageId,content,subject,replacements});
                emailTemplate = await Models.EmailTemplate.create({
                    code:req.payload.code,
                    status:Constants.STATUS.ACTIVE,
                    EmailTemplateContents:emailTemplateContent
                },{include:[
                    {model:Models.EmailTemplateContent}
                ],transaction:transaction});
            }
            if(emailTemplate) {
                await transaction.commit();
                return h.response({responseData:emailTemplate, message: req.i18n.__("EMAIL_TEMPLATE_CREATED_SUCCESSFULLY")}).code(200);
            } else {
                await transaction.rollback();
                return Common.generateError(req,400,'ERROR_WHILE_CREATING_EMAIL_TEMPLATE',{});
            }
        } else {
            await transaction.rollback();
            return Common.generateError(req,400,'EMAIL_TEMPLATE_ALREADY_EXISTS',{});
        }
    } catch(err) {
        await transaction.rollback();
        return Common.generateError(req,500,'SOMETHING_WENT_WRONG_WITH_EXCEPTION',err);
    }
}

exports.updateEmailTemplate = async (req,h) => {
    const transaction = await Models.sequelize.transaction();
    try{
        let languageCode = LanguageCodes.indexOf(req.headers.language);
        let languageId = LanguageIds[LanguageCodes.indexOf(req.headers.language)];

        let {content,subject,replacements} = req.payload;

        let emailTemplateId = req.payload.emailTemplateId;
        let doExists = await Models.EmailTemplate.findOne({where:{id:emailTemplateId},include:[
            {model:Models.EmailTemplateContent,where:{languageId}}
        ]});
        if(doExists) {
            await doExists.EmailTemplateContents[0].update({content,subject,replacements},{transaction:transaction});
            await transaction.commit();
            return h.response({responseData:doExists, message: req.i18n.__("EMAIL_TEMPLATE_UPDATED_SUCCESSFULLY")}).code(200);
        } else {
            return Common.generateError(req,400,'EMAIL_TEMPLATE_DO_NOT_EXISTS',{});
        }
    } catch (err) {
        await transaction.rollback();
        return Common.generateError(req,500,'SOMETHING_WENT_WRONG_WITH_EXCEPTION',err);
    }
}

exports.deleteEmailTemplate = async (req,h) => {
    const transaction = await Models.sequelize.transaction();
    try{
        let emailTemplateId = req.payload.emailTemplateId;
        let doExists = await Models.EmailTemplateContent.findOne({where:{emailTemplateId},include:[{model:Models.EmailTemplate}]});
        if(doExists) {
            let deleteParent = await Models.EmailTemplate.destroy({where:{id:doExists.emailTemplateId},transaction:transaction});
            let deleteAllChild = await Models.EmailTemplateContent.destroy({where:{emailTemplateId:doExists.emailTemplateId},transaction:transaction});
            await transaction.commit();
            return h.response({responseData:(deleteAllChild+deleteParent), message: req.i18n.__("EMAIL_TEMPLATE_DELETED_SUCCESSFULLY")}).code(200);
        } else {
            return Common.generateError(req,400,'EMAIL_TEMPLATE_DO_NOT_EXISTS',{});
        }
    } catch(err) {
        await transaction.rollback();
        return Common.generateError(req,500,'SOMETHING_WENT_WRONG_WITH_EXCEPTION',err);
    }
}

exports.listEmailTemplates = async(req,h) => {
    try{
        let limit = typeof req.query.limit != 'undefined' ? req.query.limit : Constants.PAGINATION_LIMIT;
        let offset = (req.query.page-1) * limit;
        let page = typeof req.query.page != 'undefined' && req.query.page > 0 ? req.query.page : 1;

        let requestedLanguage = await Models.Language.findOne({where:{code:req.headers.language}});
        let defaultLanguage = await Models.Language.findOne({where:{code:process.env.DEFAULT_LANGUANGE_CODE}});
        if(requestedLanguage && defaultLanguage) {
            let allEmailTemplates = await Models.EmailTemplate.findAndCountAll({
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
                ],
                limit:limit,
                offset:offset
            });
            return h.response({responseData:{data:allEmailTemplates.rows,totalRecords:allEmailTemplates.count,page:page,totalPages:allEmailTemplates.count>0?Math.ceil(allEmailTemplates.count/limit):0}}).code(200);
        } else {
            return Common.generateError(req,400,'INVALID_REQUEST',{});
        }
    } catch(err) {
        return Common.generateError(req,500,'SOMETHING_WENT_WRONG_WITH_EXCEPTION',err);
    }
}

exports.getEmailTemplates = async(req,h) => {
    try{
        let requestedLanguage = await Models.Language.findOne({where:{code:req.headers.language}});
        let defaultLanguage = await Models.Language.findOne({where:{code:process.env.DEFAULT_LANGUANGE_CODE}});

        if(requestedLanguage && defaultLanguage){
            let emailTemplates = await Models.EmailTemplate.findOne({
                where:{code:req.query.code},
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
            return h.response({responseData:{data:emailTemplates}}).code(200);
        } else {
            return Common.generateError(req,400,'INVALID_REQUEST',{});
        }
    } catch(err) {
        return Common.generateError(req,500,'SOMETHING_WENT_WRONG_WITH_EXCEPTION',err);
    }
}