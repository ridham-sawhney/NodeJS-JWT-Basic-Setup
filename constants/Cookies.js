
const COOKIES = {
    JWT_REFRESH_TOKEN:process.env.IS_DEVELOPMENT == "true" ?  "refreshToken" : "__Host-sid",
    JWT_ACCESS_TOKEN:"__Session-ctx"
}
// const COOKIES = {
//     JWT_REFRESH_TOKEN: "__Host-sid",
//     JWT_ACCESS_TOKEN:"__Session-ctx"
// }
module.exports = {COOKIES};