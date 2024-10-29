const SAMLBypassRouter = require('./app/src/SAMLBypassRouter')

/** @import { WebModule } from "../../types/web-module" */

/** @type {WebModule} */
const SAMLBypassModule = {
    nonCsrfRouter: SAMLBypassRouter,
}

module.exports = SAMLBypassModule
