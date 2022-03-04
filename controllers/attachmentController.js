"use strict";
const { Readable } = require('stream');
const extensions = require('../extensions');

/** Create directory structure */
const createFolderIfNotExists = () => {
    const dt = new Date();
    const folder = dt.getUTCFullYear() + "/" + dt.getUTCMonth() + "/" +  dt.getUTCDate() + '/';
    const targetDir = 'resources/attachments/' + folder;
    Fs.mkdirSync(targetDir, { recursive: true }, 0o777);
    return targetDir
}
 /** Check file is array or object and call respective functions */
const uploader = (file, options) => {
    return Array.isArray(file) ? filesHandler(file, options) : fileHandler(file, options);
}

/** Function to upload multiple files */
const filesHandler = (files, options) => {
    const promises = files.map(x => fileHandler(x, options));
    return Promise.all(promises);
}

/** unlink file from path */
const unlinkFile = (path) => {
    Fs.unlink(path, (err) => {
        if (err) {
            console.error(err)
            return
        }      
    })
}

/** Function to upload single file */
const fileHandler = async (file, options) => {
    console.log('*******', file);
    if (!file.hapi.filename) throw new Error(422);
    const extension = Path.extname(file.hapi.filename);
    const name = uuid.v1() + extension;
    const destinationPath = `${options.dest}${name}`;
    const fileStream = await Fs.createWriteStream(destinationPath);
    
    return new Promise((resolve, reject) => {
        file.on('error', (err) => {
            reject(err);
        });
        file.pipe(fileStream);
        file.on('end', async (err) => {
            console.log('file upload ended');
            setTimeout(() => {
                const { size } = Fs.statSync(destinationPath);
                const kb = Math.ceil(size / 1000);
                const fileDetails = {
                    inUse: 0,
                    size: kb,
                    unique_name: name,
                    extension: extension,
                    path: destinationPath,
                    userId: options.userId,
                }
                resolve(fileDetails);
            }, 100); 
        });
    });
}

/** Upload attachment */
exports.uploadFile = async (request, header) => {
    try { 
        if (request.payload && request.payload['files']) {
            const path = createFolderIfNotExists();
            const userId = request.payload.hasOwnProperty('userId') ? request.payload.userId : null
            const upload_info = {
                dest: path,
                userId: userId
            }
            let fileDetails = await uploader(request.payload['files'], upload_info);
            if ((fileDetails && fileDetails.hasOwnProperty('uniqueName')) || (Array.isArray(fileDetails) && fileDetails && fileDetails.length)) {
                fileDetails = Array.isArray(fileDetails) ? fileDetails : [ fileDetails ]; 
                const respData = await Models.Attachment.bulkCreate(fileDetails, { returning: true });
                for(let uploadedFile of respData) {
                    uploadedFile.dataValues.baseUrl = process.env.NODE_SERVER_PUBLIC_API
                }
                return header.response({
                    responseData: respData,
                    message: request.i18n.__("FILE_UPLOADED_SUCCESSFULLY")
                }).code(200);
            }
        }
    } catch(err) {
        if (err.message == 422) {
            return Common.generateError(request, 422, 'SELECT_FILE_TO_UPLOAD', err);
        }
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

/**  Delete attachment */
exports.deleteAttachments = async (request, header) => {
    try {
        const deleteIds = request.query.ids;
        const idsArray = deleteIds.split`,`.map(x => +x);
        const attachmentArray = await Models.Attachment.findAll({ where: {id: idsArray}, attributes: ['id', 'path'] });
        attachmentArray.forEach( async (data) => {
            unlinkFile(data.path);
            await Models.Attachment.destroy({ where: { id: data.id } });
        });
        if (attachmentArray.length) {
            return header.response({
                message: request.i18n.__("FILE_DELETED_SUCCESSFULLY")
            }).code(200);
        } else {
            return Common.generateError(request, 404, 'FILE_NOT_FOUND');
        }
    } catch (err)  {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

/** Download attachment */
exports.downloadFile = async (request, h) => {
    try {
        const attachment = await Models.Attachment.findOne({where:{id: request.query.id}, attributes: ['id','path','uniqueName','extension']});
        if (attachment) {
            if (attachment.path && attachment.uniqueName) {
                const stream = Fs.createReadStream(attachment.path);
                const streamData = new Readable().wrap(stream);
                const contentType = extensions.getContentType(attachment.extension);
                return h.response(streamData)
                    .header('Content-Type', contentType)
                    .header('Content-Disposition', 'attachment; filename= ' + attachment.uniqueName);
            }
        } else {
            return Common.generateError(request, 404, 'FILE_NOT_FOUND');
        }
    } catch (err)  {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

/** View attachment */
exports.viewAttachments = async (request, h) => {
    try {
        const attachment = await Models.Attachment.findOne({where:{id:request.query.id},attributes:['id','path','unique_name','extension']});
        if (attachment) {
            if (attachment.path && attachment.uniqueName) {
                const stream = Fs.createReadStream(attachment.path);
                const streamData = new Readable().wrap(stream);
                const contentType = extensions.getContentType(attachment.extension);
                if (!attachment.uniqueName.match(/.(jpg|jpeg|png|gif)$/i)) {
                    return h.response(streamData)
                    .header('Content-Type', contentType)
                    .header('Content-Disposition', 'attachment; filename= ' + attachment.uniqueName);                
                }
                return h.response(streamData)
                    .header('Content-Type', contentType)
            }
        } else {
            return Common.generateError(request, 404, 'FILE_NOT_FOUND');
        }
    } catch (err)  {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}