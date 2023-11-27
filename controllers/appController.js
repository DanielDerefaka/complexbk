const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const otpGenerator = require("otp-generator");
const Transactions = require("../model/Transactions");
const WalletDB = require("../model/Wallet");
const multer = require('multer');
const Admin = require("../model/Admin");
const Investments = require("../model/Investments");

module.exports.register = async (req, res) => {
  const { name, username, password, email, referrer } = req.body;
  try {
    if (!username || !name || !password || !email) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for Duplicate
    const duplicate = await User.findOne({ email }).lean().exec();

    if (duplicate) {
      return res.status(409).json({ message: "Duplicate Email" });
    }

    // Hash Password
    const hashedPwd = await bcrypt.hash(password, 10); // salt rounds keep password secured
    if(referrer === ''){
      const walletObject = { ownerUsername: username, ownerEmail: email}
      const wallet = await WalletDB.create(walletObject);

      await wallet.save()

      const userObject = { name, username, email, password: hashedPwd };
      const user = await User.create(userObject);

      if (user) {
        res.status(201).json({ message: `New user ${name} created` });
      } else {
        res.status(400).json({ message: "Invalid user data received" });
      }
    }else{
      // //console.log('Working')
      const walletObject = {ownerUsername: username, ownerEmail: email}
      const wallet = await WalletDB.create(walletObject);

      await wallet.save()

      const userObject = { name, username, email, password: hashedPwd, referee: referrer };
      const user = await User.create(userObject);

      if (user) {
        res.status(201).json({ message: `New user ${name} created` });
      } else {
        res.status(400).json({ message: "Invalid user data received" });
      }
    }
  } catch (error) {
    return res.status(500).send(error);
  }
};

module.exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

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

// // Implement the actual logic for the other routes
// module.exports.getUserD = async (req, res) => {
//   // Implement logic

//   try {
//     const users = await User.find().select("-password").lean();
//     if (!users?.length) {
//       return res.status(400).json({ message: "No User Found" });
//     }

//     res.json(users);
//   } catch (error) {
//     return res.status(404).json({ message: "Cannot Find User" });
//   }
// };

module.exports.getUser = async (req, res) => {
  const { email } = req.params;

  try {
    if (!email) {
      return res.status(400).json({ error: "Invalid Email" });
    }

    const user = await User.findOne({ email }).select('-password').exec();

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports.getReferrals = async (req, res) => {
  //console.log("Attemting to fetch referrals");
  const { email } = req.params;
  //console.log(email);
  try{
    if (!email) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const referrals = await User.find({ referee: email }).sort({entryDate: -1})
    //console.log(referrals)
    res.status(200).json(referrals);
  }catch{
    res.status(401).json({ message: "Server Error" });
  }
};

module.exports.updateUser = async (req, res) => {
    try {
      // Ensure req.user contains the user information
      if (!req.user || !req.user.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
  
      const userId = req.user.userId; // Use req.user.userId
  
      const { name, email, password, username } = req.body;
  
      const user = await User.findById(userId).exec();
  
      if (!user) {
        return res.status(400).json({ message: "User Not Found" });
      }
  
      // Check for Duplicate
      const duplicate = await User.findOne({ email }).lean().exec();
  
      // Allow updates
      if (duplicate && duplicate._id.toString() !== userId) {
        return res.status(409).json({ message: "Duplicate Email" });
      }
  
     // Update user fields if provided
     if (name) user.name = name;
     if (email) user.email = email;
     if (username) user.username = username;
     if (password) {
       // Hash and update password if provided
       user.password = await bcrypt.hash(password, 10);
     }
      const updatedUser = await user.save();
  
      res.json({ message: `${updatedUser.name} updated` });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
};

module.exports.generateOTP = asyncHandler(async (req, res) => {
  
   req.app.locals.OTP = await otpGenerator.generate(6, {lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false})
   res.status(201).json({code: req.app.locals.OTP})
});

module.exports.verifyOTP = asyncHandler(async (req, res) => {
    
    const {code} = req.query;

    if(parseInt(req.app.locals.OTP) === parseInt(code)){
        req.app.locals.OTP = null;
        req.app.locals.resetSession = true; 
        return res.status(201).json({message: 'Verify Successfully'})
    }

    return res.status(400).json({message: "Invalid Otp"})
});

module.exports.createResetSession = asyncHandler(async (req, res) => {
  
    if(req.app.locals.resetSession){
        req.app.locals.resetSession = false; // allow access to this route once 
        return res.status(201).json({message: "Access Granted"})
    }

    return res.status(440).json({message: "Session Expired!"})
});

module.exports.resetPassword = asyncHandler(async (req, res) => {
  
    try {

        if(!req.app.locals.resetSession) return res.status(440).json({message: "Session Expired!"});

        const {email, password} = req.body;

        try {
            
            const foundUser = await User.findOne({email})

            if(foundUser) {

               if (password) {
                // Hash and update password if provided
                foundUser.password = await bcrypt.hash(password, 10);
              }

               const updatedUser = await foundUser.save();

               req.app.locals.resetSession = false; // allow access to this route once 

               return res.status(201).json({message: "Record Updated"})
               
            }
            
            if(!foundUser) return res.status(200).json({message: "Email Not Found"})
            
        } catch (error) {
            return res.status(500).json({error})
        }
        
    } catch (error) {
        return res.status(401).json({error})
    }
});

// Endpoint to handle the transaction data along with the file
module.exports.initializeTransaction = async (req, res) => {
  // Access other transaction details sent from the frontend
  const {
    transactionType,
    transactionStatus,
    amount,
    currency,
    TransactorWalletAddress,
    TransactorEmailAddress,
    TransactorUsername
  } = req.body;

  //console.log(proofOfDepositFile);
  //console.log("TransactionType: " + transactionType);
  //console.log("TransactionStatus: " + transactionStatus);
  //console.log("amount: " + amount);
  //console.log("currency: " + currency);
  //console.log("TransactorWalletAddress: " + TransactorWalletAddress);
  //console.log("TransactionEmailAddress: " + TransactorEmailAddress);
  //console.log("TransactionUsername: " + TransactorUsername);

  if(transactionStatus, transactionType, amount, currency, TransactorWalletAddress, TransactorEmailAddress, TransactorUsername){
    try{
      if(transactionType === 'deposit'){
        const newTransaction = await Transactions.create({transactionType, transactionStatus, amount, currency, TransactorWalletAddress, TransactorEmailAddress, TransactorUsername});
        await newTransaction.save()

        res.status(201).json(newTransaction)
      }else{
        const wallet = await WalletDB.findOne({ownerUsername: TransactorUsername, ownerEmail: TransactorEmailAddress})
        if(currency == 'USDC'){
          if(wallet.usdc > amount){
            wallet.usdc -= amount
            wallet.save()
          }else{
            throw new Error('Insufficient funds')
          }
        }else if(currency == 'USDT'){
          if(wallet.usdt > amount){
            wallet.usdt -= amount
            wallet.save()
          }else{
            throw new Error('Insufficient funds')
          }
        }else if(currency == 'BTC'){
          if(wallet.btc > amount){
            wallet.btc -= amount
            wallet.save()
          }else{
            throw new Error('Insufficient funds')
          }
        }else if(currency == 'LTC'){
          if(wallet.ltc > amount){
            wallet.ltc -= amount
            wallet.save()
          }else{
            throw new Error('Insufficient funds')
          }
        }else if(currency == 'ETH'){
          if(wallet.eth > amount){
            wallet.eth -= amount
            wallet.save()
          }else{
            throw new Error('Insufficient funds')
          }
        }else if(currency == 'XRP'){
          if(wallet.xrp > amount){
            wallet.xrp -= amount
            wallet.save()
          }else{
            throw new Error('Insufficient funds')
          }
        }else{
          res.status(400).json('Invalid currency')
        }
        const newTransaction = await Transactions.create({transactionType, transactionStatus, amount, currency, TransactorWalletAddress, TransactorEmailAddress, TransactorUsername});
        await newTransaction.save()

        res.status(201).json(newTransaction)
      }
    }catch(error){
      //console.log(error.message);
      res.status(500).json('Unable to make transaction:' + error.message)
    }
  }else{
    res.status(404).json('All fields are required')
  }
}

module.exports.getUserTransations = async (req, res) => {
  if(req.params.type && req.params.email && req.params.username) {
    try{
      const AllTransactions = [] 
      await Transactions.find({$and: [{transactionType: req.params.type}, {TransactorEmailAddress: req.params.email}, {TransactorUsername: req.params.username}]}).sort({entryDate: -1}).then((transactions) => {
        transactions.forEach(transaction => {
          AllTransactions.push({transaction_id: transaction._id, transaction_type: transaction.transactionType, amount: transaction.amount, status: transaction.transactionStatus.toLocaleLowerCase(), currency: transaction.currency})
        })
      })
      //console.log(AllTransactions);
      res.status(200).json(AllTransactions);
    }catch(err){
      res.status(500).json('Server error: '+err.message)
    }
  }else{
    res.status(404).json('Input a valid parameter')
  }
};

module.exports.getAllUserTransations = async (req, res) => {
  if(req.params.email && req.params.username) {
    try{
      const AllTransactions = [] 
      await Transactions.find({$and: [{TransactorEmailAddress: req.params.email}, {TransactorUsername: req.params.username}]}).limit(5).sort({entryDate: -1}).then((transactions) => {
        transactions.forEach(transaction => {
          AllTransactions.push(transaction)
        })
      })
      //console.log(AllTransactions);
      res.status(200).json(AllTransactions);
    }catch(err){
      res.status(500).json('Server error: '+err.message)
    }
  }else{
    res.status(404).json('Input a valid parameter')
  }
};

module.exports.getWalletBalance = async function(req, res) {
  const {username, email} = req.params
  if(username && email){
    try{
      WalletDB.findOne({$and: [{ownerUsername: username}, {ownerEmail: email}]}).then(result => {
        if(result){
          // //console.log(result);
          const walletBalance = [{
            accountName: result.ownerUsername + 'Account',
            accountBalance: (result.usdt).toString() + " USD",
            coins: [
                // {
                //     name: 'BTC',
                //     balance: (parseFloat((result.btc).toString()).toFixed(2))
                // },
                // {
                //     name: 'LTC',
                //     balance: (parseFloat((result.ltc).toString()).toFixed(2))
                // },
                // {
                //     name: 'XRP',
                //     balance: (parseFloat((result.xrp).toString()).toFixed(2))
                // },
                // {
                //     name: 'ETH',
                //     balance: (parseFloat((result.eth).toString()).toFixed(2))
                // },
                // {
                //     name: 'USDT',
                //     balance: (parseFloat((result.usdt).toString()).toFixed(2))
                // },
                {
                    name: 'USDT',
                    balance: (parseFloat((result.usdt).toString()).toFixed(2))
                }
            ]
        }]
        //console.log(walletBalance)
          res.status(200).json(walletBalance)
        }else{
          res.status(404).json('No Wallet Available')
        }
      })
    }catch(err){

    }
  }
}

module.exports.investNow = async function (req, res) {
  const {name, investorEmail, investorUsername, amountInvested} = req.body
  if(name && investorEmail && investorUsername && amountInvested){
    const wallet = await WalletDB.findOne({$and: [{ownerUsername: investorUsername}, {ownerEmail: investorEmail}]})
    if(wallet){
      if(wallet.usdt > amountInvested){
        wallet.usdt -= amountInvested
        if(wallet.save()){
          const investment = await Investments.create({name, investorEmail, investorUsername, amountInvested})
          if(investment.save()){
            res.status(200).json(req.body)
          }else{
            res.status(404).json("Investment not made...")
          }
        }else{
          res.status(404).json("Investment not made...")
        }
      }else{
        res.status(404).json("Insufficient Balance")
      }
    }else{
      res.status(404).json("No wallet found")
    }
    
  }else{
    res.status(404).json("Investment not made...")
  }
}

