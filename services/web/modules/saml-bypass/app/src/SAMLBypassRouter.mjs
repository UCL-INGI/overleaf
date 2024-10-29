import logger from '@overleaf/logger'
import settings from '@overleaf/settings'
import SAMLBypassController from './SAMLBypassController.mjs'
import AuthenticationController from '../../../../app/src/Features/Authentication/AuthenticationController.mjs'

export default {
  apply(webRouter) {
    if(!settings.samlBypass.enabled) {
      return
    }

    logger.debug({}, 'Init SAMLBypass router')

    webRouter.get('/sso-login', SAMLBypassController.ssoLoginPage)
    webRouter.get('/sso-login/metadata', SAMLBypassController.ssoLoginMetadata)
    webRouter.post('/sso-login/callback', SAMLBypassController.ssoCallback)

    if (AuthenticationController.addEndpointToLoginWhitelist != null) {
      AuthenticationController.addEndpointToLoginWhitelist('/sso-login')
      AuthenticationController.addEndpointToLoginWhitelist('/sso-login/metadata')
      AuthenticationController.addEndpointToLoginWhitelist('/sso-login/callback')
    }
  },
}
