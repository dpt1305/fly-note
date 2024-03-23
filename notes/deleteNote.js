import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  DeleteCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
import * as constant from "./constant.js";
import { STATUS_CODE, response } from "./responseMessage.js";

const handler = async (event) => {
  try {
    // 1. connection
    const client = new DynamoDBClient({ region: constant.REGION });
    const docClient = DynamoDBDocumentClient.from(client);

    // 2. get data
    const noteId = `${event.queryStringParameters.noteId}`;
    const email = `${event.queryStringParameters?.email}`;

    // 3. Delete
    const command = new DeleteCommand({
      TableName: constant.NOTE_TABLE,
      Key: {
        noteId: noteId,
        email: email,
      },
    });
    await docClient.send(command);

    // 4. return
    return response(STATUS_CODE.SUCCESS, null, "Delete success");
  } catch (error) {
    console.log(JSON.stringify(error));
    return response(STATUS_CODE.BAD_REQUEST, null, JSON.stringify(error));
  }
};

export { handler };
