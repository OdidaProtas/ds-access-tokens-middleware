module.exports = async function validateDSAccessTokens(request, response, next) {
  const axios = require("axios");
  require("dotenv").config();
  const accessToken = request.headers.access_token;
  axios
    .get(`${process.env.ACCESS_TOKEN_VALIDATION_URL}/${accessToken}`)
    .then(({ data }) => {
      request["currentUser"] = data.user;
      request["currentUserRoles"] = data.roles;
      request["permittedActions"] = data.permissions;
      next();
    })
    .catch((e) => {
      response.status(403);
      return {
        msg: "User validation failed",
        detail: e,
      };
    });
};
