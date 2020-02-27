// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
// http://localhost:4200/implicit/callback/
// http://70.176.243.97:8551/apps/yonkerscallback/
const env = {
  local: 'http://localhost:4200/implicit/callback/',
  test: 'http://70.176.243.97:8551/apps/yonkerscallback/',
  prod: 'http://localhost:8551/apps/yonkerscallback/',
  yonkersDev: 'http://10.2.71.205:4200/apps/yonkerscallback/'
}

export const environment = {
  production: false,
  oktaConfig: {
    clientId: '0oairuqk2i2gqj7mZ0h7',
    issuer: 'https://dev-456721.oktapreview.com/oauth2/default',
    redirectUri: env.yonkersDev,
    scope: 'openid profile email'
  }
}
