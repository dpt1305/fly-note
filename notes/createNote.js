import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { constant } from "./constant.js";
import { STATUS_CODE, response } from "./responseMessage.js";
import { v4 as uuidv4 } from "uuid";

const isEmailExisted = async (email, docClient) => {
  const getEmail = new QueryCommand({
    TableName: constant.EMAIL_TABLE,
    KeyConditionExpression: "email = :email ",
    ExpressionAttributeValues: {
      ":email": `${email}`,
    },
    ConsistentRead: true,
  });
  const emailResponse = await docClient.send(getEmail);
  if (emailResponse.Count == 0) {
    return false;
  } else {
    return true;
  }
};

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

    // 3. create note
    const noteCommand = new PutCommand({
      TableName: constant.NOTE_TABLE,
      Item: {
        noteId,
        email,
        content,
        createdDate,
      },
    });
    const responseBody = await docClient.send(noteCommand);

    // 4. save email
    const isExisted = await isEmailExisted(email, docClient);
    if (!isExisted) {
      const emailCommand = new PutCommand({
        TableName: constant.EMAIL_TABLE,
        Item: {
          email,
          dateTime: createdDate,
        },
      });
      await docClient.send(emailCommand);
    }

    // 5. return
    return response(STATUS_CODE.SUCCESS, null, JSON.stringify(responseBody));
  } catch (error) {
    console.log(error);
    return response(STATUS_CODE.BAD_REQUEST, null, JSON.stringify(error));
  }
};

export { handler };
