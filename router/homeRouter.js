const express = require("express");
const axios = require("axios");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(
  "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"
);
const router = express.Router();

router.post("/newsletter", async function (req, res) {
  const { email } = req.body;
  // console.log(email);
  const config = {
    headers: {
      "content-type": "application/json",
      authorization:
        "Bearer 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",
    },
  };

  body = {
    list_ids: ["7d7c95e8-6543-4265-8eb3-38bd1f7aa2a4"],
    contacts: [
      {
        email: `${email}`,
      },
    ],
  };
  const { data } = await axios.put(
    "https://api.sendgrid.com/v3/marketing/contacts",
    body,
    config
  );
  // console.log(data);
  res.json({
    success: "Thankyou for Subscribe",
  });
});

router.post("/createTailwind", async function (req, res) {
  const { email } = req.body;
  try {
    const config = {
      headers: {
        "content-type": "application/json",
        authorization:
          "Bearer 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",
      },
    };

    body = {
      list_ids: ["9c100f5c-3556-4044-b073-5c6967a5bbec"],
      contacts: [
        {
          email: `${email}`,
        },
      ],
    };
    await axios.put(
      "https://api.sendgrid.com/v3/marketing/contacts",
      body,
      config
    );
    res.json({
      success: "Thankyou for Subscribe",
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
    });
  }
});

router.post("/sendEmail", async function (req, res) {
  const { to, from, message, name } = req.body;

  const msg = {
    to: to, // Change to your recipient
    from: "contact@pfolio.me", // Change to your verified sender
    subject: `${name} send you message from ${from}`,
    text: `hey!  ${name} send you this message "${message}"`,
  };
  sgMail
    .send(msg)
    .then(() => {
      return res.json({
        message: "Email sent!",
      });
    })
    .catch((error) => {
      return res.json({
        message: "error ! try again later",
      });
    });
});

module.exports = router;
