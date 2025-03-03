require("dotenv").config()
import { get } from "lodash"
import multer from "multer"
import http from "http"

import convertConfigurationIntoEnvVariables from "./framework/helpers/convertConfigurationIntoEnvVariables"
import validateConfigurationObject from "./framework/helpers/validateConfigurationObject"
import { IConfiguration } from "./framework/types/configuration"
import { errorMessage } from "./framework/logger/consoleMessages"
import loadDefaults from "./framework/defaults/loadDefaults"
import initiateLogger from "./framework/logger/index"
import initiateMailer from "./framework/mailer/index"
import { randomString } from "./framework/helpers"
import startServers from "./framework/initialization/startServers"
let connectDatabaseFn = require("./framework/database/connect").default

export const connectDatabase = connectDatabaseFn

export const serve = function (configurationOriginal: IConfiguration) {
  let expressApp = get(configurationOriginal, "expressApp", null)
  if (!expressApp) {
    expressApp = require("express")()

    expressApp.use((req, res, next) => {
      req.wow = true
      next()
    })
  }
  return new Promise((resolve, reject) => {
    loadDefaults(configurationOriginal)
      .then((configuration: IConfiguration) => {
        validateConfigurationObject(configuration)
          .then(() => {
            convertConfigurationIntoEnvVariables(configuration)
              .then(() => {
                initiateLogger().then((logger) => {
                  initiateMailer(configuration)
                    .then(async (mailerInstance) => {
                      const database = configuration.databaseInstance
                      let graphql = require("./framework/graphql/index").default
                      let restApi = require("./framework/restApi/index").default
                      let cron = require("./framework/cron/index").default

                      let models =
                        require("./framework/database/loadTables").default(
                          database,
                          configuration
                        )

                      let emailTemplates =
                        require("./framework/mailer/emailTemplates").default(
                          configuration,
                          __dirname
                        )

                      let sendEmail =
                        get(configuration, "email.disable", false) === false
                          ? require("./framework/mailer/index").sendEmail({
                              expressApp: expressApp,
                              configuration: configuration,
                              models: models,
                              emailTemplates: emailTemplates,
                              database: database,
                              mailerInstance: mailerInstance,
                              logger: logger,
                            })
                          : null

                      /* Storage */
                      let storage = multer.diskStorage({
                        destination: configuration.storage.storageDirectory,
                        filename: function (req, file, cb) {
                          cb(null, randomString(20) + "_" + file.originalname)
                        },
                      })
                      /* Storage */
                      const httpServer = http.createServer(expressApp)
                      let multerInstance = multer({ storage: storage })

                      let socketio =
                        require("./framework/socket/index").default(
                          configuration,
                          {
                            expressApp: expressApp,
                            httpServer: httpServer,
                            configuration: configuration,
                            models: models,
                            sendEmail: sendEmail,
                            emailTemplates: emailTemplates,
                            database: database,
                            mailerInstance: mailerInstance,
                            logger: logger,
                          }
                        )

                      let { graphql: graphqlAppInstance, graphqlVoyager } =
                        await graphql({
                          expressApp: expressApp,
                          configuration: configuration,
                          models: models,
                          sendEmail: sendEmail,
                          emailTemplates: emailTemplates,
                          database: database,
                          mailerInstance: mailerInstance,
                          socketio: socketio,
                          logger: logger,
                        })
                      let restApiInstance = await restApi({
                        expressApp: expressApp,
                        configuration: configuration,
                        models: models,
                        emailTemplates: emailTemplates,
                        sendEmail: sendEmail,
                        database: database,
                        multerInstance: multerInstance,
                        mailerInstance: mailerInstance,
                        socketio: socketio,
                        logger: logger,
                      })

                      cron(configuration, {
                        graphql: graphqlAppInstance,
                        restApi: restApiInstance,
                        socketio: socketio,
                        models: models,
                        emailTemplates: emailTemplates,
                        sendEmail: sendEmail,
                        database: database,
                        logger: logger,
                        multerInstance: multerInstance,
                        mailerInstance: mailerInstance,
                        httpServer: httpServer,
                      })
                      await startServers(configuration, {
                        graphql: graphqlAppInstance,
                        restApi: restApiInstance,
                        graphqlVoyager: graphqlVoyager,
                        httpServer: httpServer,
                      })
                      resolve({
                        socketio: socketio,
                        models: models,
                        emailTemplates: emailTemplates,
                        sendEmail: sendEmail,
                        database: database,
                        logger: logger,
                        multerInstance: multerInstance,
                        mailerInstance: mailerInstance,
                        //
                        express: expressApp,
                        graphql: graphqlAppInstance,
                        httpServer: httpServer,
                      })
                    })
                    .catch((e) => {
                      errorMessage(e)
                    })
                })
              })
              .catch((err2) => {
                errorMessage(
                  `Something went wrong while initializing Wertik js, Please check docs, and make sure you that you pass correct configuration.`
                )
                errorMessage(err2)
                reject(err2)
              })
          })
          .catch((err) => {
            reject(err)
          })
      })
      .catch((err: any) => {
        errorMessage(
          "Something went wrong while verifying default configuration \n Received: " +
            err.message
        )
      })
  })
}
