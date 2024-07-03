import twilio from "twilio";

//sms (twilio)
app.get("/sms", async (req, res) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const client = twilio(accountSid, authToken);

  try {
    await client.messages.create({
      body: "¡Wassup Dough! Este es un SMS de prueba, loco.",
      from: process.env.TWILIO_SMS_NUMBER,
      to: "+525522203242",
    });
    res.send("SMS enviado correctamente.");
  } catch (error) {
    logger.info(error);
    res.status(500).send("Hubo un error al enviar el SMS.");
  }
});

export default client;