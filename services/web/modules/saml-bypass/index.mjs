import SAMLBypassRouter from './app/src/SAMLBypassRouter.mjs'

/**
 * @import { WebModule } from "../../types/web-module"
 */

/** @type {WebModule} */
const SAMLBypassModule = {
  nonCsrfRouter: SAMLBypassRouter,
}

export default SAMLBypassModule
