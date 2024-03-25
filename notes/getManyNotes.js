import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { constant } from "./constant.js";
import { STATUS_CODE, response } from "./responseMessage.js";

const handler = async (event) => {
  try {
    // 1. connection
    const client = new DynamoDBClient({ region: constant.REGION });
    const docClient = DynamoDBDocumentClient.from(client);

    // 2. get data
    const email = `${event.queryStringParameters?.email}`;

    // 3. parse
    const getEmail = new QueryCommand({
      TableName: constant.NOTE_TABLE,
      KeyConditionExpression: "email = :email ",
      ExpressionAttributeValues: {
        ":email": `${email}`,
      },
      ConsistentRead: true,
    });

    // 4. send request
    const getResult = await docClient.send(getEmail);

    // 5. return
    return response(STATUS_CODE.SUCCESS, null, JSON.stringify(getResult.Items));
  } catch (error) {
    console.log(error);
    return response(STATUS_CODE.BAD_REQUEST, null, JSON.stringify(error));
  }
};

export { handler };
