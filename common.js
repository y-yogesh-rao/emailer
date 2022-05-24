exports.privateKey='ABCDEFGHIJKLMNOPQRSTUVWXYZ123456';
exports.algorithm="aes-256-cbc";
exports.iv='QWERTY1234567890';

decrypt = (text) => {
  let decipher = crypto.createDecipheriv(this.algorithm, this.privateKey, this.iv);
  let decrypted = decipher.update(text, "hex", "utf8");
  decrypted = decrypted + decipher.final("utf8");
  return decrypted;
}

encrypt = (text) => {
  let cipher = crypto.createCipheriv(this.algorithm,this.privateKey, this.iv);
  let encrypted =cipher.update(text, "utf8", "hex");
  encrypted = encrypted + cipher.final("hex");
  return encrypted;
}

readHTMLFile = (path, callback) => {
  Fs.readFile(path, { encoding: "utf-8" }, function(err, html) {
    if (err) {
      throw err;
      callback(err);
    } else {
      callback(null, html);
    }
  });
};

const getTokenStatus = async (userId) =>{
	let data = await Models.User.findOne(
		{where: {id : userId}}
	);
	return data;
};

exports.validateApiKeys = async (req,h) => {
  const apiKey = req.headers?.['x-api-key']
  if(apiKey !== undefined) {
    const userFound = await Models.UserSetting.findOne({where:{apiKey},attributes:['id','apiKey','apiKeyName'],include:[
      {model:Models.User,attributes:['id','email','accountId']}
    ]});
    if(!userFound) return {success:false,data:null};
    return {success:true,data:userFound};
  }
  return {success:true,data:null};
}

exports.prefunction = (req,h) => {
  global.LanguageCodes = process.env.ALL_LANGUAGE_CODE.split(',');
  global.LanguageIds = process.env.ALL_LANGUAGE_ID.split(',').map(function(item) {
    return parseInt(item, 10);
  });
  global.utcOffset = req.headers.utcoffset;
  return true;
}

exports.getTotalPages = async (records, perpage) => {
  let totalPages = Math.ceil(records / perpage);
  return totalPages;
};

exports.routeError = (errors, message) => {
  errors.forEach(err=>{ 
  console.log(err); 
  switch(err.code){
    case "any.required":
      err.message=message;
      break
      }
    })
    return errors
}

// Function to fomrat minutes into the required format
exports.convertOffsetMinuteToOffsetString = async (offsetInMinutes) => {
  let quotient;
  let remainder;
  let finalString = offsetInMinutes >= 0 ? '+' : '-';
  if(offsetInMinutes >= 0) {
      quotient = Math.floor(offsetInMinutes/60) < 10 ? `0${Math.floor(offsetInMinutes/60)}` : Math.floor(offsetInMinutes/60);
      remainder = offsetInMinutes%60 === 0 ? '00' : offsetInMinutes%60;
  } else {
      quotient = Math.ceil(offsetInMinutes/60) < 10 ? `0${-Math.ceil(offsetInMinutes/60)}` : -Math.ceil(offsetInMinutes/60);
      remainder = offsetInMinutes%60 === 0 ? '00' : -offsetInMinutes%60;
  }
  return `${finalString}${quotient}:${remainder}`;
}

exports.validateToken = async (token) => {
  fetchtoken = JSON.parse(decrypt(token.data));
  console.log(fetchToken)
  var diff = Moment().diff(Moment(token.iat * 1000));
  var userId = fetchtoken && fetchtoken.User && fetchtoken.User.id ? fetchtoken.User.id : 0;
  var userTokenStatus = fetchtoken && fetchtoken.User && fetchtoken.User.tokenStatus ? fetchtoken.User.tokenStatus : 0;
  let sessionCheck = await getTokenStatus(userId);

  if (diff > 0) {
    if(userId > 0) {
      if ((sessionCheck.tokenStatus == userTokenStatus)) {
        return {
          isValid: true,
          credentials: { userData: fetchtoken, scope: fetchtoken.Permissions }
        };
      } else {
        return {
          isValid: false
        };
      }
    } else {
      return {
        isValid: true,
        credentials: { userData: fetchtoken, scope: fetchtoken.Permissions }
      };
    }
  }
  return {
    isValid: false
  };
};

exports.signToken = tokenData => {
    return Jwt.sign(
      { data: encrypt(JSON.stringify(tokenData))},
      this.privateKey
    );
};

exports.FailureError = (err,req) => {
  console.log('Something went wrong in failure action')
  const updatedError = err;
	updatedError.output.payload.message = [];
	let customMessages = {};
	if (err.isJoi && Array.isArray(err.details) && err.details.length > 0){
		err.details.forEach((error) => {
			customMessages[error.context.label] = req.i18n.__(error.message);
		});
	}
	delete updatedError.output.payload.validation;
	updatedError.output.payload.error =  req.i18n.__('BAD_REQUEST');
	updatedError.output.payload.message = req.i18n.__(
		"ERROR_WHILE_VALIDATING_REQUEST"
	);
	updatedError.output.payload.errors = customMessages;
	return updatedError;
}

exports.generateError = (req, type, message, err) => {
    switch(type){
        case 500:
            error = Boom.badImplementation(message);
            error.output.payload.error =  req.i18n.__('INTERNAL_SERVER_ERROR');
            error.output.payload.message =  req.i18n.__(message);
            console.log(err);
            break;
        case 400:
            error = Boom.badRequest(message);
            error.output.payload.error =  req.i18n.__('BAD_REQUEST');
            error.output.payload.message =  req.i18n.__(message);
            console.log(err);
            break;
        default: 
            error = Boom.badImplementation(message);
            error.output.payload.error =  req.i18n.__('UNKNOWN_ERROR_MESSAGE');
            error.output.payload.message =  req.i18n.__(message);
            console.log(err);
            break;
    }
    return error;
}

exports.headers = (authorized,keyRequired=undefined) => {
	let Globalheaders = {
    language: Joi.string().optional().default(process.env.DEFAULT_LANGUANGE_CODE),
    utcoffset: Joi.string().optional().default(0)
  };
  
  if(keyRequired === true) {
    _.assign(Globalheaders, {'x-api-key': Joi.string().required()});
  } else if (keyRequired === false) {
    _.assign(Globalheaders, {'x-api-key': Joi.string().optional()});
  }
	if(authorized) _.assign(Globalheaders, {authorization: Joi.string().required()});
  
	return Globalheaders;
};

exports.sendOTP = async (mobile) => {
    //Add code to send OTP 
    return{mobile:mobile,pinId:9999}
}

exports.sendEmailFromServer = async (to,from,subject,content,replacements,language,template) => {
  return new Promise((resolve,reject) => {
    readHTMLFile(__dirname + "/emails/"+language+'/' + template + ".html", async (err,html) => {
      let sendTo=to.join(',');
      let template = handlebars.compile(html);
      let mergeContent = template({content});
      let templateToSend = handlebars.compile(mergeContent);
      let htmlToSend = templateToSend(replacements);
  
      let mailOptions = {
        from: from,             // sender address
        to: sendTo,             // list of receivers
        subject: subject,       // Subject line
        html: htmlToSend,       // html body
      };
      console.log(mailOptions)

      await sendmail(mailOptions, (error,response) => {
        if(error) reject(error)
        let statusCode = response.split(' ')[0];
        mailOptions = {...mailOptions, statusCode};
        resolve(mailOptions)
      });
    });
  })
}

exports.sendEmail = async (to, from, cc, bcc, subject, content, replacements, attachments, language, template) => {
  let protocol = process.env.EMAIL_PROTOCOL;
  switch(protocol){
    case 'smtp':
        let transporter = nodemailer.createTransport({
          host: Constants.SMTP.host,
          port: Constants.SMTP.port,
          secure: Constants.SMTP.ssl,
          auth: {
            user: Constants.SMTP.username,
            pass: Constants.SMTP.password
          }
        });
        console.log(__dirname);
        readHTMLFile(__dirname + "/emails/"+language+'/' + template + ".html", async function(
          err,
          html
        ) {
          let sendto=to.join(',');
          //let to='sachinkhanna@illuminz.com';
          var template = handlebars.compile(html);
          var mergeContent = template({content:content});
          var templateToSend = handlebars.compile(mergeContent);
          var htmlToSend = templateToSend(replacements);
          let mailOptions = {
            from: from, // sender address
            to: sendto, // list of receivers
            cc:cc.join(','),
            bcc:bcc.join(','),
            subject: subject, // Subject line
            text: striptags(htmlToSend), // plain text body
            html: htmlToSend, // html body
            attachments: attachments,
            priority: "high"
          };
          console.log('mailOptions: ', mailOptions)
          let info = await transporter.sendMail(mailOptions);
          return info;
        });
  }
  return;
}

exports.generateCode = (requestedlength) => {
  const char = '1234567890'; //Random Generate Every Time From This Given Char
  const length = typeof requestedlength !='undefined' ? requestedlength : 4;
  let randomvalue = '';
  for ( let i = 0; i < length; i++) {
    const value = Math.floor(Math.random() * char.length);
    randomvalue += char.substring(value, value + 1).toUpperCase();
  }
  return randomvalue;
}
