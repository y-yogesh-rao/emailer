exports.listEmailCampaigns = async (req,h) => {
    try{
        let accountId;
        if(req.auth?.credentials?.userData) accountId = req.auth.credentials.userData.User.accountId;

        const preValues = req.pre;
        if(!preValues?.apiKeyValidation?.success) {
            return h.response({success:false,message:req.i18n.__('INVALUD_USER'),responseData:{}}).code(401);
        } else {
            if(preValues?.apiKeyValidation?.data?.User?.accountId) accountId = preValues?.apiKeyValidation?.data?.User?.accountId;
        }

        let where = {accountId};
        const limit = req.query.limit !== null ? req.query.limit : Constants.PAGINATION_LIMIT;
        const offset = (req.query.pageNumber-1) * limit;

        const orderByValue = req.query.orderByValue;
        const orderByParameter = req.query.orderByParameter;

        if(req.query.status !== null) where={...where,status:req.query.status};

        let options = {where,order:[[orderByParameter,orderByValue]],include:[
            {model:Models.EmailCampaignRecipient,attributes:{exclude:['deletedAt','content']}}
        ]}

        if(req.query.pageNumber !== null) options={...options,limit,offset};

        let emailCampaigns = await Models.EmailCampaign.findAndCountAll(options);

        for(let i=0;i<emailCampaigns.rows.length;i++) {
            let sentCount = 0;
            let openedCount = 0;
            let clickedCount = 0;
            let deliveredCount = 0;
            let unsubscribedCount = 0;

            let emailCampaign = emailCampaigns.rows[i];
            let emailCampaignRecipientCount = emailCampaign.EmailCampaignRecipients.length;
            for(let j=0;j<emailCampaignRecipientCount;j++) {
                let emailCampaignRecipient = emailCampaign.EmailCampaignRecipients[j];
                if(emailCampaignRecipient.sent) sentCount+=1;
                if(emailCampaignRecipient.opened) openedCount+=1;
                if(emailCampaignRecipient.clicked) clickedCount+=1;
                if(emailCampaignRecipient.delivered) deliveredCount+=1;
                if(emailCampaignRecipient.unsubsribed) unsubscribedCount+=1;
            }

            emailCampaign.dataValues.sentCount = sentCount;
            emailCampaign.dataValues.openedCount = openedCount;
            emailCampaign.dataValues.clickedCount = clickedCount;
            emailCampaign.dataValues.deliveredCount = deliveredCount;
            emailCampaign.dataValues.unsubscribedCount = unsubscribedCount;

            emailCampaign.dataValues.sentPercentage = emailCampaignRecipientCount !== 0 ? (sentCount / emailCampaignRecipientCount) * 100 : 0;
            emailCampaign.dataValues.openedPercentage = emailCampaignRecipientCount !== 0 ? (openedCount / emailCampaignRecipientCount) * 100 : 0;
            emailCampaign.dataValues.clickedPercentage = emailCampaignRecipientCount !== 0 ? (clickedCount / emailCampaignRecipientCount) * 100 : 0;
            emailCampaign.dataValues.deliveredPercentage = emailCampaignRecipientCount !== 0 ? (deliveredCount / emailCampaignRecipientCount) * 100 : 0;
            emailCampaign.dataValues.unsubscribedPercentage = emailCampaignRecipientCount !== 0 ? (unsubscribedCount / emailCampaignRecipientCount) * 100 : 0;
        }

        const totalPages = await Common.getTotalPages(emailCampaigns.count,limit);
        const responseData = {
            totalPages,
            perPage: limit,
            totalRecords: emailCampaigns.count,
            emailCampaigns: emailCampaigns.rows,
            baseUrl: process.env.NODE_SERVER_PUBLIC_API
        }
        return h.response({success:true,message:req.i18n.__('REQUEST_SUCCESSFUL'),responseData:responseData}).code(200);h.response({success:false,message:req.i18n.__('INVALID_REQUEST'),responseData:{}}).code(400);
    } catch(error) {
        console.log(error);
        return h.response({success:false,message:req.i18n.__('SOMETHING_WENT_WRONG'),responseData:{}}).code(500);
    }
}

exports.createEmailCampaign = async (req,h) => {
    const transaction = await Models.sequelize.transaction();
    try {
        let languageCode = req.headers.language || process.env.DEFAULT_LANGUANGE_CODE;
        let languageId = LanguageIds[LanguageCodes.indexOf(req.headers.language)];

        let accountId;
        if(req.auth?.credentials?.userData) accountId = req.auth.credentials.userData.User.accountId;

        const preValues = req.pre;
        if(!preValues?.apiKeyValidation?.success) {
            return h.response({success:false,message:req.i18n.__('INVALUD_USER'),responseData:{}}).code(401);
        } else {
            if(preValues?.apiKeyValidation?.data?.User?.accountId) accountId = preValues?.apiKeyValidation?.data?.User?.accountId;
        }

        let createdById = accountId;
        let lastUpdatedById = accountId;

        const senderId = req.payload.senderId;
        const senderExists = await Models.Sender.findOne({where:{id:senderId}})
        if(!senderExists) {
            await transaction.rollback();
            return h.response({success:false,message:req.i18n.__('SENDER_NOT_FOUND'),responseData:{}}).code(400);
        }

        const emailTemplateId = req.payload.emailTemplateId;
        let emailTemplateExists = await Models.EmailTemplate.findOne({where:{id:emailTemplateId},include:[
            {model:Models.EmailTemplateContent,where:{languageId},required:false},
            {model:Models.EmailTemplateContent,as:"defaultContent",where:{languageId:process.env.DEFAULT_LANGUANGE_CODE_ID},required:false}
        ]});
        if(!emailTemplateExists) {
            await transaction.rollback();
            return h.response({success:false,message:req.i18n.__('EMAIL_TEMPLATE_NOT_FOUND'),responseData:{}}).code(400);
        }

        let content = emailTemplateExists.EmailTemplateContents.length > 0 
            ? emailTemplateExists.EmailTemplateContents[0].content 
            : emailTemplateExists.defaultContent[0].content;

        let { name,subject,recipients,status,scheduledAt } = req.payload;
        if(scheduledAt !== null) scheduledAt = Moment(scheduledAt);

        let successfulEmailCount = 0;
        let emailCampaignRecipients=[];

        for(let recipientId of recipients) {
            let replacements={};
            let recipientObject = {recipientId};
            let recipientDetails = await Models.Recipient.findOne({where:{id:recipientId}});
            if(!recipientDetails) continue;

            replacements["contactGender"] = recipientDetails.gender;
            replacements["contactCountry"] = recipientDetails.country;
            replacements["contactName"] = recipientDetails.recipientName;
            replacements["contactAddress"] = recipientDetails.addressLine_1;
            replacements["contactCompanyName"] = recipientDetails.companyName;
            replacements["contactDOB"] = Moment(recipientDetails.dob).format('lll');

            if(status === Constants.EMAIL_CAMPAIGN_STATUS.SENT && scheduledAt === null) {
                recipientObject = {...recipientObject,sent:true};

                // Sending Email
                const emailInfo = await Common.sendEmailFromServer([recipientDetails.recipientEmail],senderExists.senderEmail,subject,content,replacements,languageCode,'default');
                if(parseInt(emailInfo.statusCode) === 221) {
                    successfulEmailCount += 1;
                    recipientObject = {...recipientObject,delivered:true,content:emailInfo.html};
                };
            }
            emailCampaignRecipients.push(recipientObject);
        }

        await Models.User.update({
            emailsRemaining:Sequelize.literal(`emails_remaining - ${successfulEmailCount}`)
        },{where:{id:accountId},transaction:transaction});

        const createdEmailCampaign = await Models.EmailCampaign.create({
            senderId,emailTemplateId,accountId,createdById,lastUpdatedById,name,subject,content,scheduledAt,status,
            EmailCampaignRecipients: emailCampaignRecipients
        },{include:[
            {model:Models.EmailCampaignRecipient}
        ],transaction:transaction});

        await transaction.commit();
        return h.response({success:true,message:req.i18n.__('EMAIL_CAMPAIGN_CREATED_SUCCESSFULLY'),responseData:{createdEmailCampaign}}).code(201);
    } catch(error) {
        console.log(error);
        await transaction.rollback();
        return h.response({success:false,message:req.i18n.__('SOMETHING_WENT_WRONG'),responseData:{}}).code(500);
    }
}

exports.updateEmailCampaign = async (req,h) => {
    try {

        await transaction.commit();
        return h.response({success:true,message:req.i18n.__('EMAIL_CAMPAIGN_UPDATED_SUCCESSFULLY'),responseData:{}}).code(200);
    } catch(error) {
        console.log(error);
        await transaction.rollback();
        return h.response({success:false,message:req.i18n.__('SOMETHING_WENT_WRONG'),responseData:{}}).code(500);
    }
}

exports.deleteEmailCampaign = async (req,h) => {
    try {

        await transaction.commit();
        return h.response({success:true,message:req.i18n.__('EMAIL_CAMPAIGN_DELETED_SUCCESSFULLY'),responseData:{}}).code(200);
    } catch(error) {
        console.log(error);
        await transaction.rollback();
        return h.response({success:false,message:req.i18n.__('SOMETHING_WENT_WRONG'),responseData:{}}).code(500);
    }
}