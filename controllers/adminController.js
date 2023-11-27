const User = require("../model/User");
const Admin = require("../model/Admin")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const Transactions = require("../model/Transactions");
const Investments = require("../model/Investments");
const WalletDB = require("../model/Wallet");
// const otpGenerator = require("otp-generator");

module.exports.register = async (req, res) => {
  const { name, username, password, email } = req.body;
  try {
    if (!username || !name || !password || !email) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for Duplicate
    const duplicate = await Admin.findOne({ email }).lean().exec();

    if (duplicate) {
      return res.status(409).json({ message: "Duplicate Email" });
    }

    // Hash Password
    const hashedPwd = await bcrypt.hash(password, 10); // salt rounds keep password secured

    const userObject = { name, username, email, password: hashedPwd };

    // Create & Store User
    const user = await Admin.create(userObject);

    if (user) {
      res.status(201).json({ message: `New user ${name} created` });
    } else {
      res.status(400).json({ message: "Invalid user data received" });
    }
  } catch (error) {
    return res.status(500).send(error);
  }
};

module.exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await Admin.findOne({ email });

    if (!existingUser)
      return res.status(404).json({ message: "User doesn't exist" });

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Invalid Credentials" });

    // Jwt

    const token = jwt.sign(
      {
        userId: existingUser._id,
        email: existingUser.email,
        username: existingUser.username,
        name: existingUser.name,
      },
      process.env.ACCESS_TOKEN_SECRET, // Change to ACCESS_TOKEN_SECRET
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports.populateDashboard = async function (req, res) {
  const {adminEmail, adminUsername} = req.params
  if(adminEmail, adminUsername){
    const isAdmin = await Admin.findOne({$and: [{email: adminEmail}, {username: adminUsername}]})
    if(isAdmin){
      let users = await User.find().sort({entryDate: -1}).limit(4).exec()
      let transactions = await Transactions.find().sort({entryDate: -1}).limit(4).exec()
      let investments = await Investments.find().sort({entryDate: -1}).limit(4).exec()
      if(!Array.isArray(investments)){
        investments = []
      }

      if(!Array.isArray(users)){
        users = []
      }
      
      if(!Array.isArray(transactions)){
        transactions = []
      }

      res.status(200).json({
        users,
        transactions,
        investments
      })
    }else{
      res.status(200).json('Page is only accessible by admin')
    }
  }else{
    res.status(200).json('All Fields are required')
  }
}

module.exports.acceptTransaction = async function (req, res) {
  const {id, type, email, username} = req.params
  //console.log('Accept')
  if(id, type, email, username){
    //console.log('Accept2')
    try{
      if(type === 'deposit'){
        //console.log('Accept3')
        const transaction = await Transactions.findById(id)
        //console.log(transaction)
        transaction.transactionStatus = 'Success'
        //console.log(email, username)
        const wallet = await WalletDB.findOne({$and: [{ownerUsername: username}, {ownerEmail: email}]})
        //console.log(wallet)
        // res.status(200).send('Hello')
        if(wallet){
          if(transaction.currency === 'USDC'){
            //console.log(transaction.currency)
            wallet.usdc += transaction.amount
            wallet.save()
          }else if(transaction.currency ==='USDT'){
            wallet.usdt += transaction.amount
            wallet.save()
          }else if(transaction.currency == 'BTC'){
            wallet.btc += transaction.amount
            wallet.save()
          }else if(transaction.currency == 'LTC'){
            wallet.ltc += transaction.amount
            wallet.save()
          }else if(transaction.currency == 'ETH'){
            wallet.eth += transaction.amount
            wallet.save()
          }else if(transaction.currency == 'XRP'){
            wallet.xrp += transaction.amount
            wallet.save()
          }else{
            res.status(400).json('Invalid currency')
          }
          if(transaction.save()){
            res.status(200).json('Deposited Successfully')
          }
        }else{
          res.status(400).json('No user wallet found')
        }
      }else if(type === 'withdraw'){
        const transaction = await Transactions.findById(id)
        //console.log(transaction)
        transaction.transactionStatus = 'Success'
        transaction.save()
        res.status(200).json('Withdrawn Successfully')
      }
    }catch(err){
      //console.log(err)
      res.status(404).json(err)
    }
  }else(
    res.status(404).json('Invalid Transaction')
  )
}

module.exports.rejectTransaction = async function (req, res) {
  const {id, type, email, username} = req.params
  //console.log('Accept')
  if(id, type, email, username){
    //console.log('Accept2')
    try{
      if(type === 'withdraw'){
        //console.log('Accept3')
        const transaction = await Transactions.findById(id)
        //console.log(transaction)
        transaction.transactionStatus = 'Failed'
        //console.log(email, username)
        const wallet = await WalletDB.findOne({$and: [{ownerUsername: username}, {ownerEmail: email}]})
        //console.log(wallet)
        // res.status(200).send('Hello')
        if(wallet){
          if(transaction.currency === 'USDC'){
            //console.log(transaction.currency)
            wallet.usdc += transaction.amount
            wallet.save()
          }else if(transaction.currency ==='USDT'){
            wallet.usdt += transaction.amount
            wallet.save()
          }else if(transaction.currency == 'BTC'){
            wallet.btc += transaction.amount
            wallet.save()
          }else if(transaction.currency == 'LTC'){
            wallet.ltc += transaction.amount
            wallet.save()
          }else if(transaction.currency == 'ETH'){
            wallet.eth += transaction.amount
            wallet.save()
          }else if(transaction.currency == 'XRP'){
            wallet.xrp += transaction.amount
            wallet.save()
          }else{
            res.status(400).json('Invalid currency')
          }
          if(transaction.save()){
            res.status(200).json('Deposited Successfully')
          }
        }else{
          res.status(400).json('No user wallet found')
        }
      }else if(type === 'deposit'){
        const transaction = await Transactions.findById(id)
        //console.log(transaction)
        transaction.transactionStatus = 'Failed'
        transaction.save()
        res.status(200).json('Withdrawn Successfully')
      }
    }catch(err){
      //console.log(err)
      res.status(404).json(err)
    }
  }else(
    res.status(404).json('Invalid Transaction')
  )
}

module.exports.fetchUsers = async (req, res) => {
  const {adminEmail, adminUsername} = req.params
  if(adminEmail && adminUsername){
    const admin = await Admin.findOne({$and: [{email: adminEmail}, {username: adminUsername}]})
    if(admin){
      const allUsers = await User.find().sort({entryDate: -1})
      res.status(200).json(allUsers)
    }else{
      res.status(404).json('Only admins can access this page')
    }
  }else{
    res.status(404).json('All fields are required')
  }
}

module.exports.fetchInvestments = async (req, res) => {
  const {adminEmail, adminUsername} = req.params
  if(adminEmail && adminUsername){
    const admin = await Admin.findOne({$and: [{email: adminEmail}, {username: adminUsername}]})
    if(admin){
      const allUsers = await Investments.find().sort({entryDate: -1})
      res.status(200).json(allUsers)
    }else{
      res.status(404).json('Only admins can access this page')
    }
  }else{
    res.status(404).json('All fields are required')
  }
}

module.exports.blockUser = async (req, res) => {
  const {adminEmail, adminUsername, username} = req.params
  if(adminEmail && adminUsername){
    const admin = await Admin.findOne({$and: [{email: adminEmail}, {username: adminUsername}]})
    if(admin){
      await User.findOneAndDelete({username})
      await Transactions.find({TransactorUsername: username}).deleteMany()
      await WalletDB.findOneAndDelete({ownerUsername: username})
      await Investments.find({investorUsername: username}).deleteMany()
      res.status(200).json('User Blocked')
    }else{
      res.status(404).json('Only admins can access this page')
    }
  }else{
    res.status(404).json('All fields are required')
  }
}

module.exports.getAllPendingTransations = async (req, res) => {
  if(req.params.type && req.params.email && req.params.username) {
    try{
      Admin.findOne({$and: [{username: req.params.username}, {email: req.params.email}]}).then(async (admin) => {
        if(admin){
          const AllTransactions = [] 
          await Transactions.find({$and: [{transactionStatus: 'Pending'}, {transactionType: req.params.type}]}).sort({entryDate: -1}).then((transactions) => {
            transactions.forEach(transaction => {
              AllTransactions.push({transaction_id: transaction._id, transaction_type: transaction.transactionType, amount: transaction.amount, username: transaction.TransactorUsername, email: transaction.TransactorEmailAddress, status: transaction.transactionStatus.toLocaleLowerCase(), currency: transaction.currency, walletAddress: transaction.TransactorWalletAddress, proofOfDeposit: transaction.proofOfDeposit})
            })
          })
          //console.log(admin.username);
          res.status(200).json(AllTransactions);
        }else{
          res.status(404).json('Only admins can access this Page');
        }  
      }).catch((err) => {
        res.status(500).json('Server error: '+err.message)
      })
    }catch(err){
      res.status(500).json('Server error: '+err.message)
    }
  }else{
    res.status(404).json('Input a valid parameter')
  }
};

module.exports.fetchUserBalance = async (req,res) => {
  const {adminEmail, adminUsername, username} = req.params
  if(adminEmail && adminUsername){
    const admin = await Admin.findOne({$and: [{email: adminEmail}, {username: adminUsername}]})
    if(admin){
      const balance = await WalletDB.findOne({ownerUsername: username})
      if(balance) {
        res.status(200).json(balance.usdt)
      }else{
        res.status(404).json('0.00')
      }
    }else{
      res.status(404).json('Only admins can access this page')
    }
  }else{
    res.status(404).json('All fields are required')
  }
}

module.exports.setBalance = async (req,res) => {
  const {adminEmail, adminUsername, username} = req.params
  if(adminEmail && adminUsername){
    const admin = await Admin.findOne({$and: [{email: adminEmail}, {username: adminUsername}]})
    if(admin){
      const balance = await WalletDB.findOne({ownerUsername: username})
      if(balance) {
        balance.usdt = req.body.amount
        if(balance.save()){
          res.status(200).json('Balance Updated')
        }else{
          res.status(404).json('Server Error')
        }
      }else{
        res.status(404).json('No wallet Found')
      }
    }else{
      res.status(404).json('Only admins can access this page')
    }
  }else{
    res.status(404).json('All fields are required')
  }
}