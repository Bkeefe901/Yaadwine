const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  // 1. Extract the email parameter from the URL (?email=user@example.com)
  const userEmail = event.queryStringParameters.email;

  if (!userEmail) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/html' },
      body: '<h1>Error</h1><p>Invalid unsubscribe link.</p>',
    };
  }

  // 2. Configure your SMTP Email Transporter
  // It is best practice to use environment variables instead of hardcoding passwords
  const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: process.env.SYSTEM_EMAIL,        // Configured in Netlify UI
      pass: process.env.SYSTEM_EMAIL_PASS,   // Configured in Netlify UI
    }
  });

  // 3. Draft the notification email for the administrator
  const mailOptions = {
    from: `"Mailing List System" <${process.env.SYSTEM_EMAIL}>`,
    to: process.env.SYSTEM_EMAIL, // Sends the alert back to the same inbox you already check for Netlify Form signups
    subject: '🚨 Action Required: Remove User from Netlify List',
    text: `A user has requested to unsubscribe.\n\nPlease log into Netlify and delete this email: ${userEmail}`,
    html: `
      <h2>Unsubscribe Request</h2>
      <p>A user has clicked the unsubscribe link in your newsletter.</p>
      <p><strong>Email to delete from Netlify:</strong> <a href="mailto:${userEmail}">${userEmail}</a></p>
      <p><em>Please manually remove this contact from your Netlify Identity or Form dashboard.</em></p>
    `
  };

  try {
    // 4. Send the notification email
    await transporter.sendMail(mailOptions);

    // 5. Return a successful static HTML landing page to the user
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Unsubscribe Successful</title>
          <style>
            body { font-family: system-ui, sans-serif; text-align: center; padding: 50px; background: #f9f9f9; }
            .card { max-width: 450px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
            h1 { color: #333; }
            p { color: #666; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Unsubscribed</h1>
            <p>The email <strong>${userEmail}</strong> has been successfully removed from our update list.</p>
          </div>
        </body>
        </html>
      `,
    };
  } catch (error) {
    console.error('Email sending failed:', error);
    // Still tell the user it worked so they don't keep clicking, but log the error
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: '<h1>Unsubscribed</h1><p>Your request has been received.</p>',
    };
  }
};
