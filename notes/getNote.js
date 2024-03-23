import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import * as constant from "./constant.js";
import { STATUS_CODE, response } from "./responseMessage.js";

const handler = async (event) => {
  try {
    // 1. connection
    const client = new DynamoDBClient({ region: constant.REGION });
    const docClient = DynamoDBDocumentClient.from(client);

    // 2. get data
    const noteId = `${event.queryStringParameters?.noteId}`;
    const email = `${event.queryStringParameters?.email}`;

    console.log("111 " + noteId);
    console.log("2222 " + email);

    // 3. parse
    const command = new GetCommand({
      TableName: constant.NOTE_TABLE,
      Key: {
        noteId,
        email,
      },
    });

    // 4. send request
    const getResult = await docClient.send(command);

    // 5. return
    if (!getResult.Item) {
      return response(STATUS_CODE.NOT_FOUND);
    }

    return response(STATUS_CODE.SUCCESS, null, JSON.stringify(getResult.Item));
  } catch (error) {
    console.log(error);
    return response(STATUS_CODE.BAD_REQUEST, null, JSON.stringify(error));
  }
};

export { handler };
