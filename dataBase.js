import { MongoClient } from 'mongodb';
import { createTransport } from 'nodemailer';
const config = require('./constants.js');
const client = new MongoClient('mongodb://localhost:27017');
const dbName = 'payrollDB';

async function storeSalaryRecord(salaryData) {
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection('salaries');

  await collection.insertOne({
    ...salaryData,
    status: 'CREDITED',
    createdAt: new Date()
  });
}

async function sendEmailNotification(userId, salaryMonth) {
  // Example: fetch user email from DB
  const db = client.db(dbName);
  const users = db.collection('users');
  const user = await users.findOne({ userId });

  if (!user || !user.email) throw new Error('User email not found');

  const transporter = createTransport({
    service: config.email_service,
    auth: { user: config.user_email, pass: config.user_password } 
  });

  await transporter.sendMail({
    from: config.payroll_mail,
    to: user.email,
    subject: 'Salary Credited',
    text: `Your salary for ${salaryMonth} has been credited successfully.`
  });
}

export default { storeSalaryRecord, sendEmailNotification };
