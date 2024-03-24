import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import * as constant from "./constant.js";
import { STATUS_CODE, response } from "./responseMessage.js";
import { v4 as uuidv4 } from "uuid";

const handler = async (event) => {
  try {
    // 1. connection
    const client = new DynamoDBClient({ region: constant.REGION });
    const docClient = DynamoDBDocumentClient.from(client);

    // 2. get data
    const eventBody = JSON.parse(event.body);

    const email = eventBody.email;
    const content = eventBody.content ? eventBody.content : "default";
    const noteId = uuidv4();
    const createdDate = new Date().toISOString();

    if (!eventBody.email) {
      return response(STATUS_CODE.BAD_REQUEST, null, JSON.stringify(error));
    }

    // 3. parse
    const command = new PutCommand({
      TableName: constant.NOTE_TABLE,
      Item: {
        noteId,
        email,
        content,
        createdDate,
      },
    });

    // 4. send request
    const responseBody = await docClient.send(command);
    return response(STATUS_CODE.SUCCESS, null, JSON.stringify(responseBody));
  } catch (error) {
    return response(STATUS_CODE.BAD_REQUEST, null, JSON.stringify(error));
  }
};

export { handler };
