const logger = require('@overleaf/logger')
const settings = require('@overleaf/settings')
const SAMLBypassController = require('./SAMLBypassController')
const AuthenticationController = require('../../../../app/src/Features/Authentication/AuthenticationController')

module.exports = {
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
