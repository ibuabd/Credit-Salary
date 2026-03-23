import express from 'express';
import  verify  from 'jsonwebtoken';
import bodyParser from 'body-parser';
import startSalaryWorkflow from './temporalClient.js';
import { config } from './constants.js';
const app = express();
app.use(bodyParser.json());

// Middleware for JWT authentication + role check
function authorizeRoles(allowedRoles) {
  return (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send('Token required');

    try {
      const decoded = verify(token.replace('Bearer ', ''), config.authentication_secret_key);
      req.user = decoded;

      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).send('Access denied: insufficient role');
      }

      next();
    } catch (err) {
      return res.status(401).send('Invalid token');
    }
  };
}

// Credit Salary API (only HR or ADMIN can access)
app.post('/api/payroll/credit-salary', authorizeRoles(['HR', 'ADMIN']), async (req, res) => {
  const { userId, salaryMonth, basic, hra, allowance, deductions } = req.body;

  if (!userId || !salaryMonth) {
    return res.status(400).send('Missing required fields');
  }

  try {
    await startSalaryWorkflow({
      userId,
      salaryMonth,
      basic,
      hra,
      allowance,
      deductions
    });

    res.status(200).send({ message: 'Salary credit initiated' });
  } catch (error) {
    res.status(500).send({ error: 'Workflow failed to start' });
  }
});

app.listen(3000, () => console.log('Payroll API running on port 3000'));