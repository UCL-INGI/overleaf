import { expressify } from '@overleaf/promise-utils'
import settings from '@overleaf/settings'
import passport from 'passport'
import { Strategy as SAMLStrategy } from '@node-saml/passport-saml'
import UserGetter from '../../../../app/src/Features/User/UserGetter.mjs'
import AuthenticationController from '../../../../app/src/Features/Authentication/AuthenticationController.mjs'
import EmailHelper from '../../../../app/src/Features/Helpers/EmailHelper.mjs'
import { allowUnsafeInlineStyles } from '../../../../app/src/infrastructure/CSP.mjs'
import UserCreator from '../../../../app/src/Features/User/UserCreator.mjs'

let samlStrategy

const _SAMLBypassController = {
    async ssoLoginPage(req, res, next) {
        passport.authenticate("saml", { failureRedirect: "/", failureFlash: true })(req, res, next)
    },

    async ssoLoginMetadata(req, res) {
        allowUnsafeInlineStyles(res)
        res.type('text/xml')
        res.send(samlStrategy.generateServiceProviderMetadata(settings.samlBypass.signingCert, settings.samlBypass.signingCert))
    },

    async ssoCallback(req, res, next) {
        passport.authenticate("saml", { failureRedirect: "/", failureFlash: true },
            async function (err, user) {
                if (err) {
                    return next(err)
                }
                if (user) {
                    try {
                        await AuthenticationController.promises.finishLogin(user, req, res)
                    } catch (err) {
                        return next(err)
                    }
                } else {
                    return res.redirect("/login?sso-login-failure")
                }
            }
        )(req, res, next)
    }
}

const SAMLBypassController = {
    async doPassportLogin(profile, done) {
        let user
        try {
             user = await SAMLBypassController._doPassportLogin(profile)
        } catch (error) {
            return done(error)
        }
        return done(undefined, user)
    },

    async _doPassportLogin(profile) {
        const email = profile[settings.samlBypass.emailField]
        const firstName = profile[settings.samlBypass.firstNameField]
        const lastName = profile[settings.samlBypass.lastNameField]

        if (!EmailHelper.parseEmail(email)) {
            return null
        }

        let user = await UserGetter.promises.getUserByAnyEmail(email)
        if (!user) {
            user = await UserCreator.promises.createNewUser(
                {
                    holdingAccount: false,
                    email: email,
                    first_name: firstName,
                    last_name: lastName,
                },
                {}
            )
        }
        return user
    },

    ssoLoginPage: expressify(_SAMLBypassController.ssoLoginPage),
    ssoLoginMetadata: expressify(_SAMLBypassController.ssoLoginMetadata),
    ssoCallback: expressify(_SAMLBypassController.ssoCallback)
}

if (settings.samlBypass.enabled) {
    samlStrategy = new SAMLStrategy(
        {
            callbackUrl: settings.samlBypass.callbackUrl,
            identifierFormat: settings.samlBypass.identifierFormat,
            entryPoint: settings.samlBypass.entryPoint,
            issuer: settings.samlBypass.issuer,
            idpCert: settings.samlBypass.idpCert,
            privateKey: settings.samlBypass.privateKey,
            decryptionPvk: settings.samlBypass.privateKey
        },
        SAMLBypassController.doPassportLogin,
    )
    passport.use(samlStrategy)
}

export default SAMLBypassController
