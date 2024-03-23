const success = (msg, body) => {
  return {
    message: "Success",
    body: body,
    statusCode: 200,
  };
};
const notFound = (msg, body) => {
  return {
    body: msg ?? "Not found!",
    statusCode: 404,
  };
};
const forbidden = (msg, body) => {
  return {
    body: msg ?? "Forbidden!",
    statusCode: 403,
  };
};
const badRequest = (msg, body) => {
  return {
    message: "Bad request!",
    body: msg ?? "Bad request!",
    statusCode: 400,
  };
};

const response = (statusCode, msg, body) => {
  switch (statusCode) {
    case 200:
      return success(msg, body);
    case 404:
      return notFound(msg, body);
    case 403:
      return forbidden(msg, body);
    case 400:
      return badRequest(msg, body);

    default:
      return badRequest(msg, body);
  }
};
const STATUS_CODE = {
  SUCCESS: 200,
  NOT_FOUND: 404,
  FORBIDDEN: 403,
  BAD_REQUEST: 400,
};
export { response, STATUS_CODE };
