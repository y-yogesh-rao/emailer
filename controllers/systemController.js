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
        const userPassword = Bcrypt.hashSync(process.env.GLOBAL_USER_PASSWORD,parseInt(process.env.HASH_ROUNDS));
        const createdAdmin = await Models.User.create({
            roleId:adminRole.id,email:process.env.GLOBAL_ADMIN_EMAIL,password:adminPassword,status:Constants.STATUS.ACTIVE,phoneNumber:'1234567890',
            UserProfile:{firstName:'Admin'},UserSettings:[{apiKeyName:'Admin API Key'}]
        },{include:[
            {model:Models.UserProfile},
            {model:Models.UserSetting},
        ],transaction:transaction});

        const createdUser = await Models.User.create({
            roleId:userRole.id,email:process.env.GLOBAL_USER_EMAIL,password:userPassword,status:Constants.STATUS.ACTIVE,phoneNumber:'0987654321',
            UserProfile:{firstName:'User'},UserSettings:[{apiKeyName: 'User API Key'}]
        },{include:[
            {model:Models.UserProfile},
            {model:Models.UserSetting},
        ],transaction:transaction});

        await createdAdmin.update({accountId:createdAdmin.id},{transaction:transaction});
        await createdUser.update({accountId:createdUser.id},{transaction:transaction});

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
            {accountId:null,createdById:1,lastUpdatedById:1,code:'SIGNUP_PROCESS',status:Constants.STATUS.ACTIVE},
            {accountId:null,createdById:1,lastUpdatedById:1,code:'SIGNUP_SUCCESS',status:Constants.STATUS.ACTIVE},
            {accountId:null,createdById:1,lastUpdatedById:1,code:'SIGNUP_INVITATION',status:Constants.STATUS.ACTIVE},
            {accountId:null,createdById:1,lastUpdatedById:1,code:'RESEND_EMAIL_TOKEN',status:Constants.STATUS.ACTIVE},
            {accountId:null,createdById:1,lastUpdatedById:1,code:'RESET_PASSWORD',status:Constants.STATUS.ACTIVE},
        ],{transaction:transaction});

        // --------------------------------------------- CREATING ADMIN EMAIL TEMPLATE CONTENT ------------------------------------------

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
            {permissionCode:'manage-email-templates'},                        // 4
            {permissionCode:'manage-recipient-types'},                        // 5
        ]
        await Models.Permission.bulkCreate(permissionCodes,{transaction:transaction});

        const adminRole = await Models.Role.findOne({where:{name:'Admin'}});
        await adminRole.setPermissions([1,2,3,4],{transaction:transaction});

        const userRole = await Models.Role.findOne({where:{name:'User'}});
        await userRole.setPermissions([1,2,3,4],{transaction:transaction});

        // --------------------------------------------- CREATING RECIPIENT TYPES ------------------------------------------

        const createdList = await Models.List.bulkCreate([
            {createdById:2,lastUpdatedById:2,accountId:2,name:'India'},
            {createdById:2,lastUpdatedById:2,accountId:2,name:'Russia'},
            {createdById:2,lastUpdatedById:2,accountId:2,name:'Canada'},
            {createdById:2,lastUpdatedById:2,accountId:2,name:'Australia'},
            {createdById:2,lastUpdatedById:2,accountId:2,name:'International'},
        ],{transaction:transaction});

        // --------------------------------------------- CREATING RECIPIENTS ------------------------------------------

        await Models.Recipient.bulkCreate([
            {
                country: 'India',
                lastName:'Friend',
                firstName:'Indian',
                recipientEmail:'indian@yopmail.com',
                createdById:2,lastUpdatedById:2,accountId:2
            },
            {
                country: 'Russia',
                lastName:'Friend',
                firstName:'Russian',
                recipientEmail:'russian@yopmail.com',
                createdById:2,lastUpdatedById:2,accountId:2
            },
            {
                country: 'Canada',
                lastName:'Friend',
                firstName:'Canadian',
                recipientEmail:'canadian@yopmail.com',
                createdById:2,lastUpdatedById:2,accountId:2
            },
            {
                country: 'Australia',
                lastName:'Friend',
                firstName:'Australian',
                recipientEmail:'australian@yopmail.com',
                createdById:2,lastUpdatedById:2,accountId:2
            },
        ],{transaction:transaction});

        await createdList[0].setRecipients([1],{transaction:transaction});
        await createdList[1].setRecipients([2],{transaction:transaction});
        await createdList[2].setRecipients([3],{transaction:transaction});
        await createdList[3].setRecipients([4],{transaction:transaction});
        await createdList[4].setRecipients([2,3,4],{transaction:transaction});


        // --------------------------------------------- CREATING SENDERS ------------------------------------------

        await Models.Sender.bulkCreate([
            {
                country: 'India',
                senderName:'Sender 01',
                senderEmail:'sender01@gmail.com',
                createdById:2,lastUpdatedById:2,accountId:2,
            },
            {
                country: 'India',
                senderName:'Sender 02',
                senderEmail:'sender02@gmail.com',
                createdById:2,lastUpdatedById:2,accountId:2,
            }
        ],{transaction:transaction});

        await transaction.commit();
        return h.response({success:true,message:'SYSTEM_INITIALIZED_SUCCESSFULLY',responseData:{}}).code(200);
    } catch (error) {
        console.log(error);
        await transaction.rollback();
        return h.response({success:false,message:'FAILED_TO_INITIALIZE_SYSTEM',responseData:{}}).code(500);
    }
}