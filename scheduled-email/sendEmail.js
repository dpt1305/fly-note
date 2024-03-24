import {
  SESClient,
  ListIdentitiesCommand,
  SendEmailCommand,
} from "@aws-sdk/client-ses";
// import axios from "axios";

const handler = async (event) => {
  const client = new SESClient({ region: "ap-southeast-1" });

  // Replace with your sender email address (verified in SES)
  const sender = "phutung99.kma@gmail.com";

  // Get recipient email address and message body from event (or other source)
  const recipient = "tungplatin@gmail.com"; // Replace with logic to get recipient email
  const subject = "Test - Remind fly notes"; // Replace with logic to get email subject
  const bodyText = "this is content"; // Replace with logic to get email body text

  // Prepare email parameters
  const params = {
    Destination: {
      ToAddresses: [sender],
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
  };

  // await axios.post("https://google.com");

  try {
    const command = new SendEmailCommand(params);
    const response = await client.send(command);
    console.log("Email sent successfully");
    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      statusCode: 500,
      body: "Failed to send email",
    };
  }
};

export { handler };
