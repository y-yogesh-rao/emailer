exports.getRecipientTypeDetails = async (req,h) => {
    try {
        const recipientTypeId = req.query.recipientTypeId;

        const responseData = await Models.List.findOne({where:{id:recipientTypeId},attributes:{exclude:['deletedAt']}})

        return h.response({success:true,message:req.i18n.__('REQUEST_SUCCESSFUL'),responseData:responseData}).code(200);
    } catch(error) {
        console.log(error);
        return h.response({success:false,message:req.i18n.__('SOMETHING_WENT_WRONG'),responseData:{}}).code(500);
    }
}

exports.listRecipientTypes = async (req,h) => {
    try {
        const accountId = req.auth.credentials.userData.User.accountId;
        let where={accountId};
        const limit = req.query.limit !== null ? req.query.limit : Constants.PAGINATION_LIMIT;
        const offset = (req.query.pageNumber-1) * limit;

        const orderByValue = req.query.orderByValue;
        const orderByParameter = req.query.orderByParameter;

        if(req.query.status !== null) where={...where,status:req.query.status};

        let options={where,order:[[orderByParameter,orderByValue]],distinct:true,attributes:{exclude:['deletedAt']},include:[
            {model:Models.Recipient,through:{attributes:[]},attributes:['id','firstName','lastName','recipientEmail']}
        ]}

        if(req.query.pageNumber !== null) options={...options,limit,offset}

        const recipientTypes = await Models.List.findAndCountAll(options);
        const totalPages = await Common.getTotalPages(recipientTypes.count,limit);
        const responseData = {
            totalPages,
            perPage: limit,
            recipientTypes: recipientTypes.rows,
            totalRecords: recipientTypes.count,
            baseUrl: process.env.NODE_SERVER_PUBLIC_API
        }
        return h.response({success:true,message:req.i18n.__('REQUEST_SUCCESSFUL'),responseData:responseData}).code(200);
    } catch(error) {
        console.log(error);
        return h.response({success:false,message:req.i18n.__('SOMETHING_WENT_WRONG'),responseData:{}}).code(500);
    }
}

exports.addRecipientType = async (req,h) => {
    const transaction = await Models.sequelize.transaction();
    try {
        const createdById = req.auth.credentials.userData.User.id;
        const accountId = req.auth.credentials.userData.User.accountId;
        const lastUpdatedById = createdById;

        const name = req.payload.name;
        const recipients = req.payload.recipients;
        const recipientTypeExists = await Models.List.findOne({where:{name,accountId}});
        if(recipientTypeExists) {
            await transaction.rollback();
            return h.response({success:false,message:req.i18n.__('RECIPIENT_TYPE_ALREADY_EXISTS'),responseData:{}}).code(400);
        }

        let createdRecipientType = await Models.List.create({createdById,accountId,lastUpdatedById,name},{transaction:transaction});
        await createdRecipientType.setRecipients(recipients,{transaction:transaction});
        delete createdRecipientType.dataValues.deletedAt;

        await transaction.commit();
        return h.response({success:true,message:req.i18n.__('RECIPIENT_ADDED_SUCCESSFULLY'),responseData:{createdRecipientType}}).code(201);
    } catch(error) {
        console.log(error);
        await transaction.rollback();
        return h.response({success:false,message:req.i18n.__('SOMETHING_WENT_WRONG'),responseData:{}}).code(500);
    }
}

exports.updateRecipientType = async (req,h) => {
    const transaction = await Models.sequelize.transaction();
    try {
        const lastUpdatedById = req.auth.credentials.userData.User.id;

        const recipientTypeId = req.payload.recipientTypeId;
        const recipientTypeExists = await Models.List.findOne({where:{id:recipientTypeId},attributes:{exclude:['deletedAt']}});
        if(!recipientTypeExists) {
            await transaction.rollback();
            return h.response({success:false,message:req.i18n.__('RECIPIENT_TYPE_NOT_FOUND'),responseData:{}}).code(400);
        }

        let updationObject={lastUpdatedById};
        if(req.payload.name !== null) updationObject['name']=req.payload.name;
        if(req.payload.status !== null) updationObject['status']=req.payload.status;
        if(req.payload.recipients.length > 0) await recipientTypeExists.setRecipients(req.payload.recipients,{transaction:transaction});
        
        const updatedRecipientType = await recipientTypeExists.update(updationObject,{transaction:transaction});
        await transaction.commit();
        return h.response({success:true,message:req.i18n.__('RECIPIENT_TYPE_UPDATED_SUCCESSFULLY'),responseData:{updatedRecipientType}}).code(200);
    } catch(error) {
        console.log(error);
        await transaction.rollback();
        return h.response({success:false,message:req.i18n.__('SOMETHING_WENT_WRONG'),responseData:{}}).code(500);
    }
}

exports.deleteRecipientType = async (req,h) => {
    const transaction = await Models.sequelize.transaction();
    try {
        const recipientTypeId = req.payload.recipientTypeId;
        const recipientTypeExists = await Models.List.findOne({where:{id:recipientTypeId},attributes:{exclude:['deletedAt']}});
        if(!recipientTypeExists) {
            await transaction.rollback();
            return h.response({success:false,message:req.i18n.__('RECIPIENT_TYPE_NOT_FOUND'),responseData:{}}).code(400);
        }
        
        await recipientTypeExists.setRecipients([],{transaction:transaction});
        const deletedRecipientType = await recipientTypeExists.destroy({where:{id:recipientTypeId}},{transaction:transaction});
        await transaction.commit();
        return h.response({success:true,message:req.i18n.__('RECIPIENT_TYPE_DELETED_SUCCESSFULLY'),responseData:{deletedRecipientType}}).code(200);
    } catch(error) {
        console.log(error);
        await transaction.rollback();
        return h.response({success:false,message:req.i18n.__('SOMETHING_WENT_WRONG'),responseData:{}}).code(500);
    }
}