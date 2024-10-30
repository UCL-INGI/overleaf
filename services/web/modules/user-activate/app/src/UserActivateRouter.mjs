import logger from '@overleaf/logger'
import settings from '@overleaf/settings'
import UserActivateController from './UserActivateController.mjs'
import AuthenticationController from '../../../../app/src/Features/Authentication/AuthenticationController.js'

export default {
  apply(webRouter) {
    logger.debug({}, 'Init UserActivate router')

    if(settings.userActivateAllowedDomain) {
      if(! settings.nav || ! "header_extras" in settings.nav) {
        settings.nav.header_extras = []
      }
      settings.nav.header_extras.push({
        text: "invite", url: "/admin/register", class: "subdued", only_when_logged_in: true
      })
    }

    webRouter.get(
      '/admin/user',
      UserActivateController.ensureEmailDomain,
      (req, res) => res.redirect('/admin/register')
    )

    webRouter.get('/user/activate', UserActivateController.activateAccountPage)
    AuthenticationController.addEndpointToLoginWhitelist('/user/activate')

    webRouter.get(
      '/admin/register',
      UserActivateController.ensureEmailDomain,
      UserActivateController.registerNewUser
    )
    webRouter.post(
      '/admin/register',
      UserActivateController.ensureEmailDomain,
      UserActivateController.register
    )
  },
}
