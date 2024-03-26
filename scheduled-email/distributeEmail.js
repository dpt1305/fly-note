// this will distribute content and send to "sendEmail" function
// that way will make the good way

import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { constant } from "./constant.js";
import { STATUS_CODE, response } from "./responseMessage.js";

const getAllEmails = async () => {
  // 1. connection
  const client = new DynamoDBClient({ region: constant.REGION });
  const docClient = DynamoDBDocumentClient.from(client);

  // 2. get data
  const nowTime = new Date().toISOString();

  // 3. parse
  const getEmail = new ScanCommand({
    TableName: constant.EMAIL_TABLE,
    // KeyConditionExpression: "dateTime < :dateTime ",
    // ExpressionAttributeValues: {
    //   ":dateTime": `${nowTime}`,
    // },
    // ConsistentRead: true,
    ProjectionExpression: "email",
  });

  // 4. send request
  const getResult = await docClient.send(getEmail);
  return getResult.Items;
};

const sendMessagesToQueue = async (email, clientSQS) => {
  // 1. create command
  const command = new SendMessageCommand({
    QueueUrl: constant.MAIN_QUEUE_URL,
    DelaySeconds: 10,
    MessageBody: `${email}`,
  });

  // 2. send message
  return await clientSQS.send(command);
};

const handler = async (event) => {
  // 1. connection
  const client = new SQSClient({ region: constant.REGION });

  //2. get all of emails
  const emailArray = await getAllEmails();

  // 3. send emails to queue
  const promiseArray = emailArray.map((e) =>
    sendMessagesToQueue(e.email, client)
  );
  await Promise.all(promiseArray);

  // 4. return
  return response(STATUS_CODE.SUCCESS, null, "success");
};

export { handler };
