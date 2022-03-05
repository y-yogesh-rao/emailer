exports.createSender = async (req,h) => {
    const transaction = await Models.sequelize.transaction();
    try {
        const createdById = req.auth.credentials.userData.User.id;
        const accountId = createdById;
        const lastUpdatedById = createdById;

        let {senderEmail,senderName,replyTo,city,state,postalCode,companyName,companyAddressLine_1,companyAddressLine_2} = req.payload;
        const senderExists = await Models.Sender.findOne({where:{senderEmail}});
        if(senderExists) {
            await transaction.rollback();
            return h.response({success:false,message:req.i18n.__('SENDER_WITH_THIS_EMAIL_ID_ALREADY_EXISTS'),responseData:{}}).code(400);
        }

        const createdSender = await Models.Sender.create({
            createdById,accountId,lastUpdatedById,senderEmail,senderName,replyTo,city,state,postalCode,companyName,companyAddressLine_1,companyAddressLine_2
        },{transaction:transaction});

        await transaction.commit();
        return h.response({success:true,message:req.i18n.__('SENDER_CREATED_SUCCESSFULLY'),responseData:{createdSender}}).code(201);
    } catch(error) {
        console.log(error);
        await transaction.rollback();
        return h.response({success:false,message:req.i18n.__('SOMETHING_WENT_WRONG'),responseData:{}}).code(500);
    }
}

exports.updateSender = async (req,h) => {
    const transaction = await Models.sequelize.transaction();
    try {
        const lastUpdatedById = req.auth.credentials.userData.User.id;

        const senderId = req.payload.senderId;
        const senderExists = await Models.Sender.findOne({where:{id:senderId}});
        if(!senderExists) {
            await transaction.rollback();
            return h.response({success:false,message:req.i18n.__('SENDER_NOT_FOUND'),responseData:{}}).code(400);
        }

        let updationObject={lastUpdatedById};
        if(req.payload.city !== null) updationObject['city']=req.payload.city;
        if(req.payload.state !== null) updationObject['state']=req.payload.state;
        if(req.payload.replyTo !== null) updationObject['replyTo']=req.payload.replyTo;
        if(req.payload.postalCode !== null) updationObject['postalCode']=req.payload.postalCode;
        if(req.payload.senderName !== null) updationObject['senderName']=req.payload.senderName;
        if(req.payload.companyName !== null) updationObject['companyName']=req.payload.companyName;
        if(req.payload.companyAddressLine_1 !== null) updationObject['companyAddressLine_1']=req.payload.companyAddressLine_1;
        if(req.payload.companyAddressLine_2 !== null) updationObject['companyAddressLine_2']=req.payload.companyAddressLine_2;
        
        const updatedSender = await senderExists.update(updationObject,{transaction:transaction});

        await transaction.commit();
        return h.response({success:true,message:req.i18n.__('SENDER_UPDATED_SUCCESSFULLY'),responseData:{updatedSender}}).code(200);
    } catch(error) {
        console.log(error);
        await transaction.rollback();
        return h.response({success:false,message:req.i18n.__('SOMETHING_WENT_WRONG'),responseData:{}}).code(500);
    }
}

exports.deleteSender = async (req,h) => {
    const transaction = await Models.sequelize.transaction();
    try {
        const senderId = req.payload.senderId;
        const senderExists = await Models.Sender.findOne({where:{id:senderId}});
        if(!senderExists) {
            await transaction.rollback();
            return h.response({success:false,message:req.i18n.__('SENDER_NOT_FOUND'),responseData:{}}).code(400);
        }

        const updatedEmail = `${senderExists.senderEmail}_ARCHIVED_${Moment().valueOf()}`;
        await senderExists.update({senderEmail:updatedEmail},{transaction:transaction});
        
        const deletedSender = await senderExists.destroy({where:{id:senderId}},{transaction:transaction});

        await transaction.commit();
        return h.response({success:true,message:req.i18n.__('SENDER_UPDATED_SUCCESSFULLY'),responseData:{deletedSender}}).code(200);
    } catch(error) {
        console.log(error);
        await transaction.rollback();
        return h.response({success:false,message:req.i18n.__('SOMETHING_WENT_WRONG'),responseData:{}}).code(500);
    }
}

exports.listSenders = async (req,h) => {
    try {
        const accountId = req.auth.credentials.userData.User.id;
        let where={accountId};
        const limit = req.query.limit !== null ? req.query.limit : Constants.PAGINATION_LIMIT;
        const offset = (req.query.pageNumber-1) * limit;

        const orderByValue = req.query.orderByValue;
        const orderByParameter = req.query.orderByParameter;

        if(req.query.status !== null) where={...where,status:req.query.status};

        let options={where,order:[[orderByParameter,orderByValue]],distinct:true,attributes:{exclude:['deletedAt']}}

        if(req.query.pageNumber !== null) options={...options,limit,offset}

        const senders = await Models.Sender.findAndCountAll(options);
        const totalPages = await Common.getTotalPages(senders.count,limit);
        const responseData = {
            totalPages,
            perPage: limit,
            senders: senders.rows,
            totalRecords: senders.count,
            baseUrl: process.env.NODE_SERVER_PUBLIC_API
        }
        return h.response({success:true,message:req.i18n.__('REQUEST_SUCCESSFUL'),responseData:responseData}).code(200);
    } catch(error) {
        console.log(error);
        return h.response({success:false,message:req.i18n.__('SOMETHING_WENT_WRONG'),responseData:{}}).code(500);
    }
}

exports.getSenderDetails = async (req,h) => {
    try {
        const senderId = req.query.senderId;
        const responseData = await Models.Sender.findOne({where:{id:senderId},attributes:{exclude:['deletedAt']},include:[
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