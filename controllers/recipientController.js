exports.addRecipient = async (req,h) => {
    const transaction = await Models.sequelize.transaction();
    try {
        const createdById = req.auth.credentials.userData.User.id;
        const accountId = createdById;
        const lastUpdatedById = createdById;
        const attachmentId = req.payload.attachmentId;
        const recipientTypeId = req.payload.recipientTypeId;

        const recipientTypeExists = await Models.RecipientType.findOne({where:{id:recipientTypeId}});
        if(!recipientTypeExists) {
            await transaction.rollback();
            return h.response({success:false,message:req.i18n.__('RECIPIENT_TYPE_NOT_FOUND'),responseData:{}}).code(400);
        }

        let {recipientEmail,recipientName,alternateRecipientEmail,country,city,state,postalCode,addressLine_1,addressLine_2} = req.payload;
        const recipientExists = await Models.Recipient.findOne({where:{recipientEmail,accountId}});
        if(recipientExists) {
            await transaction.rollback();
            return h.response({success:false,message:req.i18n.__('RECIPIENT_WITH_THIS_EMAIL_ID_ALREADY_EXISTS'),responseData:{}}).code(400);
        }

        console.log('***********', recipientEmail,recipientName)
        const addedRecipient = await Models.Recipient.create({
            createdById,accountId,lastUpdatedById,recipientEmail,recipientName,alternateRecipientEmail,country,city,state,postalCode,addressLine_1,
            addressLine_2,recipientTypeId,attachmentId
        },{transaction:transaction});

        await transaction.commit();
        return h.response({success:true,message:req.i18n.__('RECIPIENT_ADDED_SUCCESSFULLY'),responseData:{addedRecipient}}).code(201);
    } catch(error) {
        console.log(error);
        await transaction.rollback();
        return h.response({success:false,message:req.i18n.__('SOMETHING_WENT_WRONG'),responseData:{}}).code(500);
    }
}

exports.updateRecipient = async (req,h) => {
    const transaction = await Models.sequelize.transaction();
    try {
        const lastUpdatedById = req.auth.credentials.userData.User.id;

        const recipientId = req.payload.recipientId;
        const recipientExists = await Models.Recipient.findOne({where:{id:recipientId}});
        if(!recipientExists) {
            await transaction.rollback();
            return h.response({success:false,message:req.i18n.__('RECIPIENT_NOT_FOUND'),responseData:{}}).code(400);
        }

        let updationObject={lastUpdatedById};
        if(req.payload.city !== null) updationObject['city']=req.payload.city;
        if(req.payload.state !== null) updationObject['state']=req.payload.state;
        if(req.payload.country !== null) updationObject['country']=req.payload.country;
        if(req.payload.postalCode !== null) updationObject['postalCode']=req.payload.postalCode;
        if(req.payload.attachmentId !== null) updationObject['attachmentId']=req.payload.attachmentId;
        if(req.payload.recipientName !== null) updationObject['recipientName']=req.payload.recipientName;
        if(req.payload.addressLine_1 !== null) updationObject['addressLine_1']=req.payload.addressLine_1;
        if(req.payload.addressLine_2 !== null) updationObject['addressLine_2']=req.payload.addressLine_2;
        if(req.payload.alternateRecipientEmail !== null) updationObject['alternateRecipientEmail']=req.payload.alternateRecipientEmail;

        if(req.payload.recipientEmail !== null) {
            if(req.payload.recipientEmail !== recipientExists.recipientEmail) {
                const recipientEmailExists = await Models.Recipient.findOne({where:{recipientEmail:req.payload.recipientEmail,accountId:recipientExists.accointId}})
                if(recipientEmailExists) {
                    await transaction.rollback();
                    return h.response({success:false,message:req.i18n.__('RECIPIENT_WITH_THIS_EMAIL_ID_ALREADY_EXISTS'),responseData:{}}).code(400);
                }
                updationObject['recipientEmail']=req.payload.recipientEmail;
            }
        }

        if(req.payload.recipientTypeId !== null) {
            const recipientTypeExists = await Models.RecipientType.findOne({where:{id:req.payload.recipientTypeId}});
            if(!recipientTypeExists) {
                await transaction.rollback();
                return h.response({success:false,message:req.i18n.__('RECIPIENT_TYPE_NOT_FOUND'),responseData:{}}).code(400);
            }
            updationObject['recipientTypeId']=req.payload.recipientTypeId;
        }
        
        const updatedRecipient = await recipientExists.update(updationObject,{transaction:transaction});

        await transaction.commit();
        return h.response({success:true,message:req.i18n.__('RECIPIENT_UPDATED_SUCCESSFULLY'),responseData:{updatedRecipient}}).code(200);
    } catch(error) {
        console.log(error);
        await transaction.rollback();
        return h.response({success:false,message:req.i18n.__('SOMETHING_WENT_WRONG'),responseData:{}}).code(500);
    }
}

exports.deleteRecipient = async (req,h) => {
    const transaction = await Models.sequelize.transaction();
    try {
        const recipientId = req.payload.recipientId;
        const recipientExists = await Models.Recipient.findOne({where:{id:recipientId}});
        if(!recipientExists) {
            await transaction.rollback();
            return h.response({success:false,message:req.i18n.__('RECIPIENT_NOT_FOUND'),responseData:{}}).code(400);
        }

        const updatedEmail = `${recipientExists.recipientEmail}_ARCHIVED_${Moment().valueOf()}`;
        await recipientExists.update({recipientEmail:updatedEmail},{transaction:transaction});
        
        const deletedSender = await recipientExists.destroy({where:{id:recipientId}},{transaction:transaction});
        await transaction.commit();
        return h.response({success:true,message:req.i18n.__('RECIPIENT_UPDATED_SUCCESSFULLY'),responseData:{deletedSender}}).code(200);
    } catch(error) {
        console.log(error);
        await transaction.rollback();
        return h.response({success:false,message:req.i18n.__('SOMETHING_WENT_WRONG'),responseData:{}}).code(500);
    }
}

exports.listRecipients = async (req,h) => {
    try {
        const accountId = req.auth.credentials.userData.User.id;
        let where={accountId};
        const limit = req.query.limit !== null ? req.query.limit : Constants.PAGINATION_LIMIT;
        const offset = (req.query.pageNumber-1) * limit;

        const orderByValue = req.query.orderByValue;
        const orderByParameter = req.query.orderByParameter;

        if(req.query.status !== null) where={...where,status:req.query.status};

        let options={where,order:[[orderByParameter,orderByValue]],distinct:true,attributes:{exclude:['deletedAt']},include:[
            {model:Models.RecipientType,attributes:{exclude:['deletedAt']}}
        ]}

        if(req.query.pageNumber !== null) options={...options,limit,offset}

        const recipients = await Models.Recipient.findAndCountAll(options);
        const totalPages = await Common.getTotalPages(recipients.count,limit);
        const responseData = {
            totalPages,
            perPage: limit,
            recipients: recipients.rows,
            totalRecords: recipients.count,
            baseUrl: process.env.NODE_SERVER_PUBLIC_API
        }
        return h.response({success:true,message:req.i18n.__('REQUEST_SUCCESSFUL'),responseData:responseData}).code(200);
    } catch(error) {
        console.log(error);
        return h.response({success:false,message:req.i18n.__('SOMETHING_WENT_WRONG'),responseData:{}}).code(500);
    }
}

exports.getRecipientDetails = async (req,h) => {
    try {
        const recipientId = req.query.recipientId;
        const responseData = await Models.Recipient.findOne({where:{id:recipientId},attributes:{exclude:['deletedAt']},include:[
            {model:Models.Attachment,attributes:{exclude:['deletedAt']}},
            {model:Models.RecipientType,attributes:{exclude:['deletedAt']}},
            {model:Models.User,as:'Account',attributes:['id','email','phoneNumber'],include:{model:Models.UserProfile,attributes:['firstName','lastName','dob','gender'],include:{model:Models.Attachment,attributes:{exclude:['deletedAt']}}}},
            {model:Models.User,as:'CreatedBy',attributes:['id','email','phoneNumber'],include:{model:Models.UserProfile,attributes:['firstName','lastName','dob','gender'],include:{model:Models.Attachment,attributes:{exclude:['deletedAt']}}}},
            {model:Models.User,as:'LastUpdatedBy',attributes:['id','email','phoneNumber'],include:{model:Models.UserProfile,attributes:['firstName','lastName','dob','gender'],include:{model:Models.Attachment,attributes:{exclude:['deletedAt']}}}},
        ]})
        return h.response({success:true,message:req.i18n.__('REQUEST_SUCCESSFUL'),responseData:responseData}).code(200);
    } catch(error) {
        console.log(error);
        return h.response({success:false,message:req.i18n.__('SOMETHING_WENT_WRONG'),responseData:{}}).code(500);
    }
}