import { proxyActivities } from '@temporalio/workflow';

const { storeSalaryRecord, sendEmailNotification } = proxyActivities({
  startToCloseTimeout: '1 minute',
});

export default async function salaryWorkflow(salaryData) {
  // Store salary in MongoDB
  await storeSalaryRecord(salaryData);

  // Send email notification
  await sendEmailNotification(salaryData.userId, salaryData.salaryMonth);

  return 'Salary credited successfully';
}
