

import { SESAPIDataServiceProvider } from "./sesApiDataServiceProvider";
import { emailConfig } from "../../config/emailConfig";
import ejs from "ejs";
import { OverDueEmailData } from "../../types/app.types";

const sesApiDataServiceProvider = new SESAPIDataServiceProvider();
const sendEmailToResetPassword = async (email: string, link: string) => {
  const html = `<html><head></head><body><p>Hello,</p>Please click the Link below to reset the password <br/> ${link}.</p></body></html>`;

  let emailSubject = "Reset Password";

  const toEmails = [email];
  var mailOptions = {
    from: emailConfig.labsquire_from_mail,
    to: toEmails,
    cc: [],
    subject: emailSubject,
    html
  };

  return await sesApiDataServiceProvider.sendEmail(mailOptions);

};

const sendEmail = async (emailRecepients: string[], emailSubject: string, emailContent: OverDueEmailData, emailTemplate: any, ccList = []) => {

  const emailBody = ejs.render(emailTemplate, emailContent);

  const toEmails = emailRecepients;
  const ccEmails = ccList;

  var mailOptions = {
    from: emailConfig.labsquire_from_mail,
    to: toEmails,
    cc: ccEmails,
    subject: emailSubject,
    html: emailBody,
  };

  return await sesApiDataServiceProvider.sendEmail(mailOptions);

};

export { sendEmailToResetPassword, sendEmail };