const express = require('express');
const router = express.Router();
const usersControllers = require('../controllers/appController');
const {registerMail, contactFormMailler} = require('../controllers/mailer')
const Auth = require('../middleware/auth');
const localVariables = require('../middleware/localVariables');
const coinbaseapi = require('../coinbase_pay/payment')
const adminControl = require('../controllers/adminController');
const multer = require('multer');
const path = require('path');
const Investments = require('../model/Investments');

// POST Methods
router.route('/register').post(usersControllers.register);
router.route('/admin/register').post(adminControl.register);
router.route('/registerMail').post(registerMail);
router.route('/login').post(usersControllers.login);
router.route('/admin/login').post(adminControl.login);
router.route('/deposit').post(coinbaseapi.deposit)
router.route('/webhook').post(coinbaseapi.webhook)
router.route('/contactUsMail').post(contactFormMailler)


// GET Methods
router.route('/user/:email').get(usersControllers.getUser);
router.route('/generateOTP').get( localVariables, usersControllers.generateOTP);
router.route('/verifyOTP').get(usersControllers.verifyOTP);
router.route('/createResetSession').get(usersControllers.createResetSession);
router.route('/referrals/:email').get(usersControllers.getReferrals);
router.route('/updateuser').put(Auth, usersControllers.updateUser);
router.route('/resetPassword').put(usersControllers.resetPassword);
router.route('/getTransactions/:email/:username/:type').get(usersControllers.getUserTransations);
router.route('/getAllTransactions/:email/:username').get(usersControllers.getAllUserTransations);
router.route('/getAllPendingTransactions/:email/:username/:type').get(adminControl.getAllPendingTransations);
router.route('/walletBalance/:email/:username').get(usersControllers.getWalletBalance)
router.route('/acceptTransaction/:type/:email/:username/:id').get(adminControl.acceptTransaction)
router.route('/rejectTransaction/:type/:email/:username/:id').get(adminControl.rejectTransaction)
router.route('/fetchUsers/:adminEmail/:adminUsername/').get(adminControl.fetchUsers)
router.route('/fetchInvestments/:adminEmail/:adminUsername/').get(adminControl.fetchInvestments)
router.route('/blockUser/:adminEmail/:adminUsername/:username').get(adminControl.blockUser)
router.route('/populateDashboard/:adminEmail/:adminUsername').get(adminControl.populateDashboard)
router.route('/fetchUserBalance/:adminEmail/:adminUsername/:username').get(adminControl.fetchUserBalance)
router.route('/makeInvestment').post(usersControllers.investNow)
router.route('/setUserBalance/:adminEmail/:adminUsername/:username').post(adminControl.setBalance)

// router.use(express.json())
// router.route('/insertData').post(async (req, res) => {
//   const investment = await Investments.create(req.body)
//   investment.save()
//   res.status(200).json(req.body)
// })

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, '../complextrading_frontend/public/assets/uploads/'); // Save uploaded files to the 'uploads' directory
//     },
//     filename: function (req, file, cb) {
//         // Access the username from the request body or wherever it's available
//         const { TransactorUsername } = req.body;

//         // Generate a unique random number (in this case, a timestamp)
//         const uniqueRandomNumber = Date.now();
//       cb(null, `${TransactorUsername}_${uniqueRandomNumber}${path.extname(file.originalname)}`); // Keep the original file name
//     }
// });
  
// const upload = multer({ storage: storage });
router.use(express.urlencoded({extended: true}));
router.post('/makeDeposit', usersControllers.initializeTransaction)
router.post('/makeWithdrawal', usersControllers.initializeTransaction)

module.exports = router;
