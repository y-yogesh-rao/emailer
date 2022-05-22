require("dotenv").config();
global.Sequelize = require("sequelize");

global.Op = Sequelize.Op;
global.Fs = require("fs");
global.Joi = require("joi");
global._ = require("lodash");
global.Path = require("path");
global.Slug = require("slug");
global.uuid = require('uuid');
global.Moment = require("moment");
global.Bcrypt = require("bcrypt");
global.crypto = require('crypto');
global.i18n = require("hapi-i18n");
global.Cron = require('hapi-cron');
global.request = require('request');
global.Common = require("./common");
global.Boom = require("@hapi/boom");
global.Hapi = require("@hapi/hapi");
global.Models = require("./models");
global.Jwt = require("jsonwebtoken");
global.Inert = require("@hapi/inert");
global.striptags = require("striptags");
global.sendmail = require('sendmail')();
global.Vision = require("@hapi/vision");
global.Routes=require("hapi-auto-route");
global.auth_jwt=require("hapi-auth-jwt2");
global.Constants = require("./constants");
global.nodemailer = require('nodemailer');
global.handlebars = require("handlebars");
global.HapiSwagger = require("hapi-swagger");
global.readXlsxFile = require('read-excel-file/node');