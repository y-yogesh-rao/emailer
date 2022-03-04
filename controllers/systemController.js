const Constants = require('../constants');

exports.initializeUsers = async (req,h) => {
    const transaction = await Models.sequelize.transaction();
    try {
        const doExists = Models.User.findAll({});
        if (doExists.length > 0) {
            await transaction.rollback();
            return h.response({success:false,message:'SYSTEM_USERS_ALREADY_INITIALIZED',responseData:{}}).code(400);
        }

        const adminRole = await Models.Role.create({name:'Admin'},{transaction:transaction});
        const userRole = await Models.Role.create({name:'User'},{transaction:transaction});

        const adminPassword = Bcrypt.hashSync(process.env.GLOBAL_ADMIN_PASSWORD,parseInt(process.env.HASH_ROUNDS));
        await Models.User.create({
            roleId:adminRole.id,email:process.env.GLOBAL_ADMIN_EMAIL,password:adminPassword,status:Constants.STATUS.ACTIVE,phoneNumber:'1234567890',
            UserProfile:{firstName:'Admin'}
        },{include:[
            {model:Models.UserProfile}
        ],transaction:transaction});

        await transaction.commit();
        return h.response({success:true,message:'SYSTEM_USERS_INITIALIZED_SUCCESSFULLY',responseData:{}}).code(200);
    } catch(error) {
        console.log(error);
        await transaction.rollback();
        return h.response({success:false,message:'FAILED_TO_INITIALIZE_SYSTEM_USERS',responseData:{}}).code(500);
    }
}

exports.initializeSystem = async (req,h) => {
    const transaction = await Models.sequelize.transaction();
    try {
        const userExists = await Models.User.findOne({});
        if(!userExists) {
            await transaction.rollback();
            return h.response({success:false,message:req.i18n.__('INITIALIZE_USERS_BEFORE_INITIALIZING_SYSTEM'),responseData:{}}).code(400);
        }

        const doExists = await Models.Language.findAll({});
        if (doExists.length > 0) {
            await transaction.rollback();
            return h.response({success:false,message:'SYSTEM_ALREADY_INITIALIZED',responseData:{}}).code(400);
        }

        await Models.Language.bulkCreate(
            [
                {name:"English",status:Constants.STATUS.ACTIVE,code:'en',isDefault:Constants.STATUS.ACTIVE}
            ],
            { updateOnDuplicate:["name"] }
        );

        // --------------------------------------------- CREATING EMAIL TEMPLATES ------------------------------------------

        await Models.EmailTemplate.bulkCreate([
            {code:'SIGNUP_PROCESS',status:Constants.STATUS.ACTIVE},
            {code:'SIGNUP_SUCCESS',status:Constants.STATUS.ACTIVE},
            {code:'SIGNUP_INVITATION',status:Constants.STATUS.ACTIVE},
            {code:'RESEND_EMAIL_TOKEN',status:Constants.STATUS.ACTIVE},
            {code:'RESET_PASSWORD',status:Constants.STATUS.ACTIVE},
        ],{transaction:transaction});

        // --------------------------------------------- CREATING EMAIL TEMPLATE CONTENT ------------------------------------------

        await Models.EmailTemplateContent.bulkCreate([
            {emailTemplateId:1,languageId:1,content:'<div><h3>Hi! Your Verification Code is {{code}} </h3><br> Or <br> Click the below URL to verify email <br> {{domain}}{{token}}</div>',subject:'Verification Code',replacements:'code,domain,token'},
            {emailTemplateId:2,languageId:1,content:'<div><h3>Hi User! Miranda Welcomes You! Please visit the below URL to know more about us! <br> {{domain}}</h3></div>',subject:'Welcome To Miranda',replacements:'domain'},
            {emailTemplateId:3,languageId:1,content:'<div><h3>You have been assinged a job. Please visit {{domain}} and get started with Miranda </h3></div>',subject:'Signup Invitation',replacements:'domain'},
            {emailTemplateId:4,languageId:1,content:'<div><h3>Hi! Your Verification Code is {{code}} </h3><br> Or <br> Click the below URL to verify email <br> {{domain}}{{token}}</div>',subject:'Verification Code',replacements:'code,domain,token'},
            {emailTemplateId:5,languageId:1,content:'<div><h3>Your Password Reset Code is {{code}} </h3></div>',subject:'Password Reset Code',replacements:'code'},
        ],{transaction:transaction});

        // --------------------------------------------- CREATING ROLES & PERMISSIONS ------------------------------------------

        const permissionCodes = [
            {permissionCode:'manage-contacts'},                               // 1
            {permissionCode:'manage-senders'},                                // 2
            {permissionCode:'manage-emails'},                                 // 3
            {permissionCode:'manage-email-templates'}                         // 4
        ]
        await Models.Permission.bulkCreate(permissionCodes,{transaction:transaction});

        const adminUser = await Models.User.findOne({where:{id:1}});

        await transaction.commit();
        return h.response({success:true,message:'SYSTEM_INITIALIZED_SUCCESSFULLY',responseData:{}}).code(200);
    } catch (error) {
        console.log(error);
        await transaction.rollback();
        return h.response({success:false,message:'FAILED_TO_INITIALIZE_SYSTEM',responseData:{}}).code(500);
    }
}