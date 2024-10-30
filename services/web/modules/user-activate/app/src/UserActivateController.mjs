import Path from 'node:path'
import { fileURLToPath } from 'node:url'
import settings from '@overleaf/settings'
import UserGetter from '../../../../app/src/Features/User/UserGetter.mjs'
import UserRegistrationHandler from '../../../../app/src/Features/User/UserRegistrationHandler.mjs'
import ErrorController from '../../../../app/src/Features/Errors/ErrorController.mjs'
import SessionManager from '../../../../app/src/Features/Authentication/SessionManager.mjs'
import AuthorizationMiddleware from '../../../../app/src/Features/Authorization/AuthorizationMiddleware.mjs'
import { expressify } from '@overleaf/promise-utils'

const __dirname = Path.dirname(fileURLToPath(import.meta.url))

function registerNewUser(req, res, next) {
  res.render(Path.resolve(__dirname, '../views/user/register'))
}

async function register(req, res, next) {
  const { email } = req.body
  if (email == null || email === '') {
    return res.sendStatus(422) // Unprocessable Entity
  }
  const { user, setNewPasswordUrl } =
    await UserRegistrationHandler.promises.registerNewUserAndSendActivationEmail(
      email
    )
  res.json({
    email: user.email,
    setNewPasswordUrl,
  })
}

async function activateAccountPage(req, res, next) {
  // An 'activation' is actually just a password reset on an account that
  // was set with a random password originally.
  if (req.query.user_id == null || req.query.token == null) {
    return ErrorController.notFound(req, res)
  }

  if (typeof req.query.user_id !== 'string') {
    return ErrorController.forbidden(req, res)
  }

  const user = await UserGetter.promises.getUser(req.query.user_id, {
    email: 1,
    loginCount: 1,
  })

  if (!user) {
    return ErrorController.notFound(req, res)
  }

  if (user.loginCount > 0) {
    // Already seen this user, so account must be activated.
    // This lets users keep clicking the 'activate' link in their email
    // as a way to log in which, if I know our users, they will.
    return res.redirect(`/login`)
  }

  req.session.doLoginAfterPasswordReset = true

  res.render(Path.resolve(__dirname, '../views/user/activate'), {
    title: 'activate_account',
    email: user.email,
    token: req.query.token,
  })
}

async function ensureEmailDomain(req, res, next) {
  if (settings.userActivateAllowedDomain) {
      const userId = SessionManager.getLoggedInUserId(req.session)
      const reversedHostname = settings.userActivateAllowedDomain.trim().split('').reverse().join('')
      const query = {
          _id: userId,
          emails: {$exists: true},
          'emails.reversedHostname': reversedHostname,
      }
      const user = await UserGetter.promises.getUser(query)
      if (user) {
          return next()
      }
  }
  return AuthorizationMiddleware.ensureUserIsSiteAdmin(req, res, next)
}

export default {
  registerNewUser,
  register: expressify(register),
  activateAccountPage: expressify(activateAccountPage),
  ensureEmailDomain: expressify(ensureEmailDomain)
}
