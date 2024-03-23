import * as constant from "./constant.js";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { STATUS_CODE, response } from "./responseMessage.js";

export const handler = async (event) => {
  try {
    // 1. connection
    const client = new DynamoDBClient({ region: constant.REGION });
    const docClient = DynamoDBDocumentClient.from(client);

    // 2. get data
    const eventBody = JSON.parse(event.body);

    const email = eventBody.email;
    const noteId = eventBody.noteId;
    const content = eventBody.content ? eventBody.content : "default";
    const updatedDate = new Date().toUTCString();

    if (email == null || noteId == null) {
      return response(STATUS_CODE.BAD_REQUEST, null, JSON.stringify(error));
    }

    // 3. update content
    const updateCommand = new UpdateCommand({
      TableName: constant.NOTE_TABLE,
      Key: {
        email,
        noteId,
      },
      UpdateExpression: "set #content = :content,  #updatedDate = :updatedDate",

      ExpressionAttributeValues: {
        ":content": content,
        ":updatedDate": updatedDate,
      },
      ExpressionAttributeNames: {
        "#content": "content",
        "#updatedDate": "updatedDate",
      },
      ReturnValues: "ALL_NEW",
    });

    const responseBody = await docClient.send(updateCommand);
    return response(STATUS_CODE.SUCCESS, null, JSON.stringify(responseBody));
  } catch (error) {
    return response(STATUS_CODE.BAD_REQUEST, null, JSON.stringify(error));
  }
};
