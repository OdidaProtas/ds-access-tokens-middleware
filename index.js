module.exports = async function validateDSAccessTokens(
  request,
  response,
  next
) {
  const axios = require("axios");
  require("dotenv").config();

  const accessToken = request.headers.access_token;
  const baseURL = process.env.DREAMER_CODES_AUTH_SERVICE__BASE_URL;

  if (!Boolean(accessToken)) {
    response.status(403);
    return {
      msg: "Authentication failed",
      desc: "Access token not found",
    };
  }

  if (!Boolean(baseURL)) {
    response.status(403);
    return {
      msg: "Authentication failed",
      desc: "Middleware url improperly configured",
    };
  }

  const axiosInstance = axios.create({
    baseURL,
    timeout: 30000,
  });

  axiosInstance.interceptors.request.use(
    (config) => {
      config.headers.common["access_token"] = accessToken;
      return config;
    },
    (error) => {
      console.log(error);
    }
  );

  axiosInstance
    .get(`/verify-access-token`)
    .then(({ data }) => {
      request["currentUser"] = data.user;
      request["currentUserRoles"] = data.roles;
      request["currentUserPermissions"] = data.permissions;
      next();
    })
    .catch((e) => {
      response.status(403);
      return {
        msg: "User validation failed",
        desc: e,
      };
    });
};
