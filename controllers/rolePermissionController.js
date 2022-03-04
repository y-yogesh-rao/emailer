exports.listRoles = async (req,h) => {
    try {
        let where={};
        const limit = Constants.PAGINATION_LIMIT;
        const offset = (req.query.pageNumber-1) * limit;

        switch(req.query.flag) {
            case 'DEFAULT_ROLES':
                where={...where,id:{[Op.in]:[Constants.USER_TYPES.COMPANY,Constants.USER_TYPES.BROKER,Constants.USER_TYPES.TRUCKER]}}
                break;
            default:
                break;
        }

        let options={where, attributes:{exclude:['deletedAt']}};
        if(req.query.pageNumber !== null) options={...options,limit,offset};

        const roles = await Models.Role.findAndCountAll(options);
        let responseData = await Common.formatListingWithPagination(roles);
        return h.response({success:true,message:req.i18n.__('REQUEST_SUCCESSFUL'),responseData:responseData}).code(200);
    } catch (error) {
        console.log(error);
        return h.response({success:false,message:req.i18n.__('SOMETHING_WENT_WRONG'),responseData:[]}).code(500);
    }
}