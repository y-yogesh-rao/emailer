exports.listRoles = async (req,h) => {
    try {
        let where={};
        const limit = req.query.limit !== null ? req.query.limit : Constants.PAGINATION_LIMIT;
        const offset = (req.query.pageNumber-1) * limit;

        const orderByValue = req.query.orderByValue;
        const orderByParameter = req.query.orderByParameter;

        let options={where,order:[[orderByParameter,orderByValue]],distinct:true,attributes:{exclude:['deletedAt']}}
        if(req.query.pageNumber !== null) options={...options,limit,offset}

        const roles = await Models.Role.findAndCountAll(options);
        const totalPages = await Common.getTotalPages(roles.count,limit);
        const responseData = {
            totalPages,
            perPage: limit,
            roles: roles.rows,
            totalRecords: roles.count,
            baseUrl: process.env.NODE_SERVER_PUBLIC_API,
        }
        return h.response({success:true,message:req.i18n.__('REQUEST_SUCCESSFUL'),responseData:responseData}).code(200);
    } catch (error) {
        console.log(error);
        return h.response({success:false,message:req.i18n.__('SOMETHING_WENT_WRONG'),responseData:[]}).code(500);
    }
}