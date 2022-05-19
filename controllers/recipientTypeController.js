exports.listRecipientTypes = async (req,h) => {
    try {
        const accountId = req.auth.credentials.userData.User.accountId;
        let where={accountId};
        const limit = req.query.limit !== null ? req.query.limit : Constants.PAGINATION_LIMIT;
        const offset = (req.query.pageNumber-1) * limit;

        const orderByValue = req.query.orderByValue;
        const orderByParameter = req.query.orderByParameter;

        if(req.query.status !== null) where={...where,status:req.query.status};

        let options={where,order:[[orderByParameter,orderByValue]],distinct:true,attributes:{exclude:['deletedAt']}}

        if(req.query.pageNumber !== null) options={...options,limit,offset}

        const recipientTypes = await Models.RecipientType.findAndCountAll(options);
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