import {
  SESClient,
  ListIdentitiesCommand,
  SendEmailCommand,
} from "@aws-sdk/client-ses";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import {
  SendMessageCommand,
  SQSClient,
  ReceiveMessageCommand,
} from "@aws-sdk/client-sqs";
import { constant } from "./constant.js";
import { STATUS_CODE, response } from "./responseMessage.js";

const getMessageFromSQS = async () => {
  // 1. connection
  const client = new SQSClient({ region: constant.REGION });

  // 2. receive message
  const receiveRequest = new ReceiveMessageCommand({
    AttributeNames: ["SentTimestamp"],
    MaxNumberOfMessages: 10,
    QueueUrl: constant.MAIN_QUEUE_URL,
    MessageAttributeNames: ["All"],
    WaitTimeSeconds: 10,
    VisibilityTimeout: 30,
  });

  return await client.send(receiveRequest);
};

const createEmailBody = async (email) => {
  // 1. connection
  const client = new DynamoDBClient({ region: constant.REGION });
  const docClient = DynamoDBDocumentClient.from(client);

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
  const results = await docClient.send(getEmail);
  if (!results.Items) {
    return createMissYouEmailBody(email);
  } else {
    return createNormalEmailBody(email, results.Items);
  }
};

const sendEmail = async (email, bodyText, sesClient) => {
  // Replace with your sender email address (verified in SES)
  const sender = "phutung99.kma@gmail.com";

  // Get recipient email address and message body from event (or other source)
  const recipient = email; // Replace with logic to get recipient email
  const subject = "Test - Remind fly notes"; // Replace with logic to get email subject
  // Replace with logic to get email body text

  // Prepare email parameters
  const params = new SendEmailCommand({
    Destination: {
      ToAddresses: [recipient],
    },
    Source: sender,
    Message: {
      Body: {
        Text: {
          Charset: "UTF-8",
          Data: bodyText,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
    },
  });

  return await sesClient.send(params);
};

const createMissYouEmailBody = (email) => {
  const text = `Hi ${email},\r\nTuần vừa rồi chưa thấy bạn quay lại, chúng tớ rất nhớ cậu.\r\nHãy viết tiếp những ghi chú ý nghĩa tại đây nhé.\r\nChúc bạn một tuần mới vui vẻ`;
  return text;
};
const createNormalEmailBody = (email, notes) => {
  const concatContent = notes.map((e) => `\"${e.content}\"`).join(", ");
  const body = `Hi ${email},\r\nTuần mới của bạn thế nào? Chúng tớ có vài ghi chú cho bạn: ${concatContent} Hãy viết tiếp những ghi chú ý nghĩa tại đây nhé.\r\n Chúc bạn một tuần mới vui vẻ`;
  return body;
};

const handler = async (event) => {
  try {
    console.log("SQS event:", JSON.stringify(event));
    console.log(JSON.stringify(event.Records));
    // Access SQS records from the event
    const records = JSON.parse(JSON.stringify(event.Records));
    const record = records[0];

    const email = record.body;
    console.log("email: ", email);

    const bodyText = await createEmailBody(email);

    const sesClient = new SESClient({ region: constant.REGION });
    await sendEmail(email, bodyText, sesClient);

    return {
      statusCode: 200,
      body: `send email: ${email} successfully`,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      statusCode: 500,
      body: `Failed to send email`,
    };
  }
};

export { handler };
