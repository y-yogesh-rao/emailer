exports.dailyCron = async (req,h) => {
    const transaction = await Models.sequelize.transaction();
    try {
        await Models.User.update({emailsRemaining:Constants.USER_EMAIL_LIMIT},{where:{},transaction:transaction})

        await transaction.commit();
        return h.response({success:true,message:req.i18n.__('CRON_EXECUTED_SUCCESSFULLY'),responseData:{}}).code(200);
    } catch(error) {
        await transaction.rollback();
        return h.response({success:false,message:req.i18n.__('SOMETHING_WENT_WRONG'),responseData:{}}).code(500);
    }
}

// exports.oneMinuteCron = async (req,h) => {
//     const transaction = await Models.sequelize.transaction();
//     try {
//         await transaction.commit();
//         return h.response({success:true,message:req.i18n.__('CRON_EXECUTED_SUCCESSFULLY'),responseData:{}}).code(200);
//     } catch(error) {
//         await transaction.rollback();
//         return h.response({success:false,message:req.i18n.__('SOMETHING_WENT_WRONG'),responseData:{}}).code(500);
//     }
// }