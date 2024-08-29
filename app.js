const express = require('express');
const session = require('express-session');
const path = require('path');
const mysql2 = require('mysql');
const mysql = require('mysql2/promise');
const multer = require('multer');
const io = require('socket.io-client');
require('dotenv').config();
const axios = require('axios');
const { Console } = require('console');
const crypto = require('crypto');
const app = express();
const PORT = process.env.PORT || 1001;
const cors = require('cors');
const MySQLStore = require('express-mysql-session')(session);
// Connect to the Socket.IO server
const socket = io.connect('https://run.crmsoftware.ae/');

const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;

const db = mysql2.createConnection({
    host: dbHost,
    user: dbUser,
    password: dbPassword,
    database: dbName,
});

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// const domainCheck = async (req, res, next) => {
//      const domain = req.headers['x-forwarded-host'];
//     // First check if configuration is already stored in session
//     if (req.session && req.session.config && req.session.config.domain === domain) {
//         req.config = req.session.config;
//     //    console.log('Using cached configuration:', req.config);
//         return next();
//     }

//     console.log(`Fetching configuration for domain: ${domain}`);
//     try {
//         const [rows] = await pool.query('SELECT * FROM domain_config WHERE domain = ? GROUP BY domain', [domain]);
//         if (rows.length > 0) {
//             req.config = rows[0];
//             // Store the configuration in session
//             if (req.session) {
//                 req.session.config = req.config;
//             }
//           //  console.log('Configuration fetched and stored for Domain:', req.config);
//             next();
//         } else {
//             //console.error(`No configuration found for domain: ${domain}`);
//             res.status(404).send('Configuration not found for this domain. Please contact your administrator.');
//         }
//     } catch (error) {
//         console.error('Database error when fetching domain configuration:', error);
//         res.status(500).send(`Internal Server Error: ${error.message}`);
//     }
// };


const domainCheck = async (req, res, next) => {
    const domain = req.headers['x-forwarded-host'];
    if (req.session && req.session.config && req.session.config.domain === domain) {
        req.config = req.session.config;
        return next();
    }

    console.log(`Fetching configuration for domain: ${domain}`);
    try {
        const [rows] = await pool.query('SELECT * FROM domain_config WHERE domain = ? GROUP BY domain', [domain]);
        if (rows.length > 0) {
            req.config = rows[0];
            if (req.session) {
                req.session.config = req.config;
            }
            next();
        } else {
            console.error(`No configuration found for domain: ${domain}`);
            res.status(404).send('Configuration not found for this domain. Please contact your administrator.');
        }
    } catch (error) {
        console.error('Database error when fetching domain configuration:', {
            message: error.message,
            stack: error.stack,
        });
        res.status(500).send('Internal Server Error: Unable to fetch configuration.');
    }
};



// Attach middleware to the Express application
app.use(domainCheck);

// Reconfigure application settings based on domain
app.use((req, res, next) => {
           
    if (req.config) {
 //console.log(req.config);
        locationId = req.config.location_id;
        V_locationId = req.config.v_location_id;
        logoUrl = req.config.logo_url;
        emcode1 = req.config.emcode;
        companyfileview = req.config.cfv;
                userfileview = req.config.cvv;
        back = req.config.background;
        darkback = req.config.dark_back;
        sidedark = req.config.side_dark_back;
        sideback = req.config.side_back;
        gridback = req.config.grid_back;
        darkgrid = req.config.dark_grid_back;
        gridtext = req.config.text_light;
        gridtextdark = req.config.text_dark;
       baicon = req.config.icon_button_back;
       bbt = req.config.button_bottom_border;
        companiname = req.config.company_name;
       companiaddress = req.config.company_address;
        headingcolor = req.config.heading_color;
        
    }
    next();
});

// // Encryption function
// function encrypt(text, secretKey) {
//     const cipher = crypto.createCipher('aes-256-cbc', secretKey);
//     let encrypted = cipher.update(text, 'utf8', 'hex');
//     encrypted += cipher.final('hex');
//     return encrypted;
// }

function encrypt(text, secretKey) {
    // URL encode the text to handle special characters
    const encodedText = encodeURIComponent(text);

    const cipher = crypto.createCipher('aes-256-cbc', secretKey);
    let encrypted = cipher.update(encodedText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
   // console.log(encrypted);
    return encrypted;
}


// Decryption function
// function decrypt(encryptedText, secretKey) {
//     const decipher = crypto.createDecipher('aes-256-cbc', secretKey);
//     let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
//     decrypted += decipher.final('utf8');
//     return decrypted;
// }
function decrypt(encryptedText, secretKey) {
    const decipher = crypto.createDecipher('aes-256-cbc', secretKey);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    // URL decode the decrypted text to get the original text
    const decodedText = decodeURIComponent(decrypted);
 //  const decodedText = decrypted;
    //console.log(decodedText);
    return decodedText;
}


const nodemailer = require('nodemailer');
const OTP_LENGTH = 6; // Length of OTP

// Configure Nodemailer transporter
// const transporter = nodemailer.createTransport({
//     host: 'smtp.netxsites.com',
//     port: 587, // SMTP port
//     secure: false, // true for 465, false for other ports
//     auth: {
//       user: 'no-reply@netxsites.com',
//         pass: 'My991a2f0'
//     }
// });


const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'info@netxsites.com',
        pass: 'owzj irlm qdoz qppn'
    }
});

// Function to generate OTP
function generateOTP() {
    let otp = '';
    for (let i = 0; i < OTP_LENGTH; i++) {
        otp += Math.floor(Math.random() * 10); // Generate random digits
    }
    return otp;
}



const sharedData = {}; // Shared in-memory object for storing Socket.IO data

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
//const sessionStore = new MySQLStore({}, db);
const sessionStore = new MySQLStore({
  expiration: 86400000, // 1 day
  clearExpired: true,
  checkExpirationInterval: 900000 // 15 minutes
}, db);
app.use(express.static('public', { debug: true }));
app.use(express.urlencoded({ extended: true }));
app.use(
    session({
         store: sessionStore,
        secret: 'your_secret_key',
        resave: true,
        saveUninitialized: true,
        cookie: { secure: false }, // Set to true in production if using HTTPS
    })
);


// Middleware to check session
const sessionCheck = (req, res, next) => {
    if (req.session.user) {
        console.log(req.session.user);
        return next();
    }
    res.redirect('/');
};

//admin session check


// Store generated OTPs mapped to email addresses
let otpMap = new Map();

// Function to send OTP email and trigger webhook
async function sendOTPEmailAndTriggerWebhook(username, otp,namo,phon) {
    //  await axios.get('https://app.crmsoftware.ae/api/message.php', {
    //         params: {
    //             agent: '+971562559270',
    //             client: '+971551745764',
    //             country: 'AE',
    //             message: 'Hi there, OTP email sent. OTP: ' + otp
    //         }
    //     });
    
    console.log(namo);
    //SEE REPLACE haris.khan5117@gmail.com with username
    const mailOptions = {
        from: `${companiname} <no-reply@netxsites.com>`,
        //to: 'haris.khan5117@gmail.com',
      to: username,    
        subject: `${companiname} Login OTP ${otp}`,
      html:`<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
  <div style="margin:50px auto;width:70%;padding:20px 0">
    <div style="border-bottom:1px solid #eee">
      <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">${companiname} Portal</a>
    </div>
    <p style="font-size:1.1em">Hi,</p>
    <p>Thank you for choosing ${companiname}. Use the following OTP to complete your Sign In procedures.</p>
    <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
    <p style="font-size:0.9em;">Regards,<br />${companiname} powered by <a href="https://netxsites.com/">Netxsite</a></p>
    <hr style="border:none;border-top:1px solid #eee" />
    <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
      <p>${companiname}</p>
      <p>${phon}</p>
      <p>${companiaddress}</p>
      <p>United Arab Emirates</p>
    </div>
  </div>
</div>`,
      
       // html: `Your OTP for login is: ${otp}`
    };

    try {
        // Send mail with defined transport object
          await axios.get('https://app.crmsoftware.ae/api/message.php', {
            params: {
                agent: '971562559270',
                client: `${phon}`,
                country: 'AE',
                message: `Hi there *${namo}*, Your ${companiname} Portal Login OTP is *${otp}* please dont share this OTP with anyone`
            }
        });
        
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);

        // Trigger webhook
         // Trigger webhook
      
        
       

        return true; // Email sent and webhook triggered successfully
    } catch (error) {
        console.error('Error occurred:', error.message);
        return false; // Error occurred while sending email or triggering webhook
    }
    
    
    
    
}

app.get('/', (req, res) => {
      const query = req.query.error;
    
    if (req.session.user) {
        res.redirect('/dashboard');
    } else {
        res.render('login', { logo: logoUrl,message:query,emcod:emcode1 });
    }
});

app.post('/login', async (req, res) => {
    const { username } = req.body;
    
        const otp = generateOTP();
        otpMap.set(username, otp); // Store OTP in map

 socket.emit('contact', {
            query1: username,
            query2: locationId,
            query3: 10,
        });
      
        socket.once('searchResult',  (data) => {
            if (data.error) {
                console.error('Socket.IO Error:', data.error);
                res.status(500).send('An error occurred.');
            } else {
                var a = data.contacts;
                if(!a || a.length === 0){
                      res.redirect('/?error=No Data Found');
                    
                }else{
//console.log(data.contacts[0]);
//contactName
           var email=data.contacts[0].email; 
            var namo=data.contacts[0].contactName; 
            var phon=data.contacts[0].phone;
            //console.log(namo)
            if (username === email) {
                
                
           const emailAndWebhookStatus =  sendOTPEmailAndTriggerWebhook(email, otp,namo,phon);
        if (emailAndWebhookStatus) {
            res.render('otp', { username:username,logo: logoUrl,namo:namo,emcod:emcode1 }); // Render page to enter OTP
        } else {
            res.send('Error occurred while sending OTP.');
        }
         
              console.log(a);
            } 
            
            
            else {
        //res.send('Invalid username or password');
      res.redirect('/?error=Invalid Email Kindly use Correct Email');
        
    }
              
           
           
                }
           
           
            }
        })



        // Send OTP email and trigger webhook
      

});

app.post('/verifyOTP', (req, res) => {
    const { username, otp,namo } = req.body;
    if (otpMap.has(username) && otpMap.get(username) === otp) {
        req.session.user = username;
        req.session.namo = namo; 
        otpMap.delete(username); // Remove OTP from map after successful verification
        res.redirect('/dashboard');
    } else {
       // res.send('Invalid OTP');
     res.redirect('/?error=Invalid OTP Please re-enter your registered email');
        
    }
});



// Add a new route to handle the resend OTP request
app.post('/resendOTP', async (req, res) => {
    const { username } = req.body;
    if (otpMap.has(username)) {
        const otp = otpMap.get(username);
        const emailAndWebhookStatus = await sendOTPEmailAndTriggerWebhook(username, otp);
        if (emailAndWebhookStatus) {
            res.send('OTP has been resent.'); // Send a response indicating OTP has been resent
        } else {
            res.status(500).send('Error occurred while resending OTP.');
        }
    } else {
        res.status(400).send('No OTP found for this user.');
    }
});










function getValueByKey(responseArray, keyToMatch) {
    // Variable to store the matched value
    var matchedValue = null;

    // Iterate through the response array
    for (var i = 0; i < responseArray.length; i++) {
        // Check if the fieldKey matches the desired key
        if (responseArray[i].fieldKey === keyToMatch) {
            // Get the data type of the field
            var dataType = responseArray[i].dataType;

            // Check data type and return value accordingly
            switch (dataType) {
                case 'MULTIPLE_OPTIONS':
                case 'SINGLE_OPTIONS':
                    matchedValue = responseArray[i].value;
                    break;
                case 'NUMERICAL':
                    matchedValue = parseFloat(responseArray[i].value); // Convert to numerical value
                    break;
                case 'DATE':
                    matchedValue = new Date(responseArray[i].value);// Convert to Date object
                    const dateString = matchedValue.toLocaleDateString();
                    matchedValue=dateString;
                    break;
                case 'FILE_UPLOAD':
                    matchedValue = responseArray[i].value; // Return the object as it is
                   // console.log(matchedValue);
                    break;
                default:
                    // Unsupported data type
                    console.error("Unsupported data type:", dataType);
            }
            // No need to continue looping once the match is found
            break;
        }
    }

    // Return the matched value
    return matchedValue;
}


function formatFiles(responseArray, keyToMatch, Label) {
 const arr = [];
    // Find the object with the specified key
    const matchedObject = responseArray.find(obj => obj.fieldKey === keyToMatch);

    // If the object with the specified key is found and its data type is 'FILE_UPLOAD'
    if (matchedObject && matchedObject.dataType === 'FILE_UPLOAD') {
        const name =matchedObject.name;
        const id =matchedObject.id;
        const files = matchedObject.value;
        let formattedResult = '';

        // Iterate over each file
        for (const fileId in files) {
            if (Object.prototype.hasOwnProperty.call(files, fileId)) {
                const file = files[fileId];

var del=file.meta.deleted;
//check if file is deleted
if(del != true){
arr.push(file.url);
    
}
                // Check if the current file is a folder or a file
                // if (typeof file === 'object' && file.meta) {
                //     // If it's a folder, add a button to show its contents
                 
                // }
            }
        }
      //  console.log( arr);
      if(arr.length === 0){
formattedResult = `
             <tr>
        <td class="border border-slate-200 dark:border-slate-600 p-2 pl-8 text-slate-500 dark:text-slate-400">${Label}</td>
        <td class="border border-slate-200 dark:border-slate-600 p-2 pr-8 text-slate-500 dark:text-slate-400 items-end text-right">No file Available</td>
      </tr>

`;


      }else{
formattedResult = `
               <tr>
        <td class="border border-slate-200 dark:border-slate-600 p-2 pl-8 text-slate-500 dark:text-slate-400">${Label}</td>
        <td class="border border-slate-200 dark:border-slate-600 p-2 pr-8 text-slate-500 dark:text-slate-400 text-right items-end"><button onclick="showFolder(this)" data='${arr}' title="${Label}" class="h-8 px-4 text-sm text-indigo-100 transition-colors duration-150 ${baicon} rounded-lg cursor-pointer focus:shadow-outline ">
  <i class="text-lg fas fa-download"></i>
 </button></td>
      </tr>
                    
                `;
        
        
    }
        return formattedResult || ``;
    } else {
        return  ` `;
    }
}
// Function to display file in SweetAlert modal

// Function to display files in SweetAlert modal







 function generateHtmlContent(contacts) {
  
    let htmlContent = '';
 htmlContent += `
          <div class="p-4 w-full md:w-1/2 lg:w-1/2">
              <div class="flex flex-col dark:${darkgrid} flex rounded-lg h-full ${gridback} dark:${gridtextdark} p-8 sm:p-4 xl:flex-col sm:flex-wrap">
                  <div class="items-center mb-3 p-1">
        <h2 class="text-gray-900 text-lg title-font font-medium dark:${gridtextdark}">Guide Video</h2>
   

        
        <video classname="h-full w-full rounded-lg" controls loop="" autoplay="" muted="">
<source src="https://storage.googleapis.com/msgsndr/CaUsaDHBNHw2z2ThM8DV/media/6661efc61b84650803a2a27d.mp4" type="video/mp4">
Your browser does not support the video tag.
</video>
        
                  </div>
                 
              </div>
          </div>`;

    for (const contact of contacts) {
        var keyin = "contact.license_expiry_date";
       var authy="contact.authority";
     //  console.log(contact.customFields);
        var la=getValueByKey(contact.customFields, keyin);
        var auth= getValueByKey(contact.customFields, authy);

  
          htmlContent += `
          <div class="p-4 w-full md:w-1/2 lg:w-1/2">
              <div class="flex flex-col dark:${darkgrid} flex rounded-lg h-full ${gridback} dark:${gridtextdark} p-8 sm:p-4 xl:flex-col sm:flex-wrap">
                  <div class="flex items-center mb-3 p-1 border-b-2" >
                      <div class="w-8 h-8 mr-3 inline-flex items-center justify-center rounded-full ${baicon} text-white flex-shrink-0">
                          <svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="w-5 h-5" viewBox="0 0 24 24">
                              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                              <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                      </div>
                      <h2 class="text-gray-900 text-lg title-font font-medium dark:${gridtextdark}">${contact.companyName} | 
                      <span class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">${auth}</span></h2>
                  </div>
                  <div class="flex-grow p-1">
                      <p class="leading-relaxed text-base">Name: ${contact.contactName} <br> Email: ${contact.email} <br>Phone: ${contact.phone}<br>Expire On: <span class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">${la}</span></p>
                  
                  <div class="mt-5">  
                      <a href="/company?id=${contact.id}" class=" ${bbt} ${baicon}  text-white font-bold py-2 px-4 border border-blue-700 rounded">Open Company File
                       
                      </a>
                  </div>
                  
                  
                  </div>
              </div>
          </div>`;
        }

    return htmlContent;

}






 function visasfile(contacts) {
  
    let htmlContent = '';


    for (const contact of contacts) {
        //var keyin = "contact.license_expiry_date";
       var authy="contact.authority";
     //  var aem="contact.applicant_email";
     //  console.log(contact.customFields);
        //var la=getValueByKey(contact.customFields, keyin);
        var auth= getValueByKey(contact.customFields, authy);
              //   aem= getValueByKey(contact.customFields, aem);

          htmlContent += `
          <div class="p-4 w-full md:w-1/2 lg:w-1/2">
              <div class="flex flex-col dark:${darkgrid} flex rounded-lg h-full ${gridback} dark:${gridtextdark} p-8 sm:p-4 xl:flex-col sm:flex-wrap">
                  <div class="flex items-center mb-3 p-1 border-b-2">
                      <div class="w-8 h-8 mr-3 inline-flex items-center justify-center rounded-full ${baicon} text-white flex-shrink-0">
                          <svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="w-5 h-5" viewBox="0 0 24 24">
                              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                              <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                      </div>
                      <h2 class="text-gray-900 text-lg title-font font-medium dark:${gridtextdark}">${contact.companyName} | 
                      <span class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">${auth}</span></h2>
                  </div>
                  <div class="flex-grow p-1">
                      <p class="leading-relaxed text-base">Applicant Name: ${contact.contactName} <br> Email: ${contact.email} <br> ApplicantPhone: ${contact.phone}</p>
                 
                  <div class="mt-5">  
                      <a href="/single?id=${contact.id}" class=" ${bbt} ${baicon}  text-white font-bold py-2 px-4 border border-blue-700 rounded">Open Visa File <i class="fas fa-sign-out-alt"></i>
                       
                      </a>
                  </div>
                  
                  
                  </div>
              </div>
          </div>`;
        }

    return htmlContent;

}

const setKeysAndTitles = (data) => {
  if (!Array.isArray(data)) {
    throw new TypeError('Expected an array for data');
  }
  return data.map(item => {
    return { key: item.key, title: item.title };
  });
};
// const parseCompanyFileView = (dataString) => {
//   const dataArray = dataString.split('},{').map(item => {
//     item = item.replace(/^{|}$/g, ''); // Remove leading '{' and trailing '}'
//     const [key, title] = item.split(', ').map(part => part.split(': ')[1].replace(/'/g, ''));
//     return { key, title };
//   });
//   return dataArray;
// };


// Function to parse the companyfileview string into an array of objects
// const parseCompanyFileView = (dataString) => {
//   // Remove leading and trailing braces and split the string into individual items
//   const items = dataString.replace(/^\s*{|\}\s*$/g, '').split(/\s*},\s*{/);

//   // Map each item to an object
//   const dataArray = items.map(item => {
//     // Remove leading and trailing braces if present
//     item = item.replace(/^{|}$/g, '');

//     // Split the key-value pairs and trim any extra whitespace
//     const [key, title] = item.split(',').map(part => part.split(': ')[1].replace(/'/g, '').trim());
    
//     return { key, title };
//   });

//   return dataArray;
// };


const parseCompanyFileView = (dataString) => {
  if (!dataString || dataString.trim().length === 0) {
    return [];
  }
  
  // Remove leading and trailing braces and split the string into individual items
  const items = dataString.replace(/^\s*{|\}\s*$/g, '').split(/\s*},\s*{/);

  // Map each item to an object
  const dataArray = items.map(item => {
    // Remove leading and trailing braces if present
    item = item.replace(/^{|}$/g, '');

    // Split the key-value pairs and trim any extra whitespace
    const [key, title] = item.split(',').map(part => part.split(': ')[1].replace(/'/g, '').trim());
    
    return { key, title };
  });

  return dataArray;
};

//Company single file
function generatesinglehtml(jj) {
  
    let htmlContent = '';
var contact=jj;
//console.log(contact);
//    for (const contact of jj) {
        var keyin = "contact.license_expiry_date";
       var authy="contact.authority";
        var vq="contact.visa_quotas";
        //var aform="contact.upload_application_form";
       // var bl="contact.upload_license";
        
   
        // Array of key-title pairs
const keysAndTitles = setKeysAndTitles(parseCompanyFileView(companyfileview));
        let allFormattedResults = '';

// Loop through each key-title pair, format, and accumulate the results
keysAndTitles.forEach(pair => {
    const output = formatFiles(contact.customFields, pair.key, pair.title);
    allFormattedResults += output + "\n";  // Concatenate each result with a newline for separation
});
        
        vq=getValueByKey(contact.customFields, vq);
        
       
        var la=getValueByKey(contact.customFields, keyin);
        var auth= getValueByKey(contact.customFields, authy);

let allvisas="wohoo";

var companyName2=encodeURI(contact.companyName);
var e=encrypt(companyName2,"667766");
//console.log("Harry with push",JSON.stringify(allvisas));
  
          htmlContent += `
          <div class="p-4 w-full md:w-1/2 lg:w-1/2">
              <div class="flex rounded-lg h-full dark:${darkgrid} ${gridback} dark:${gridtextdark} p-8 flex-col">
                  <div class="items-center mb-3">
                                       <h2 class="font-extrabold ${headingcolor} text-lg title-font font-medium dark:${gridtextdark}">${contact.companyName}  
                    </h2>  <span class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Expired On: ${la}</span>
                  </div>
                  <div class="flex-grow">
                      <p class="leading-relaxed text-base">Name: ${contact.fullNameLowerCase} <br> Email: ${contact.email} <br>Phone: ${contact.phone}</p>
                  
                   
                    
              </div>
          </div>
          </div>
          
          
            <div class="p-4 w-full md:w-1/2 lg:w-1/2">
              <div class="flex rounded-lg h-full dark:${darkgrid} ${gridback} dark:${gridtextdark} p-8 flex-col">
                 
                  <div class="flex-grow">
                        <h2 class="font-extrabold ${headingcolor} text-lg title-font font-medium dark:${gridtextdark}">Company Visa Quota
                      </h2><p class="leading-relaxed text-base mb-3">Number of Visas: <b>${vq}</b></p><a href="/visas?company=${e}&auth=${auth}&cem=${contact.email}&cphone=${contact.phone}&belongs_to=${companiname}" data='${companyName2}' class="${bbt} ${baicon}  text-white font-bold py-2 px-4 border border-blue-700 rounded">Open Visas File</a>
                      <div class="mt-3 block w-64 bg-red-600 text-red-100 py-1 px-3 rounded-full font-bold" style="font-size: 9px">To Apply Visa Kindly Click on Open Visa File</div>
                        <h2 class=" mt-2 mb-1 text-lg title-font font-medium  dark:${gridtextdark}">Authority:    <p class="leading-relaxed text-base">
                   ${auth}</p>
                   </h2></div>
          </div>
  </div>
<div class="p-4 w-full">
  <div class="p-4 rounded m-1 dark:${darkgrid} ${gridback} dark:${gridtextdark} -m-1.5 overflow-x-auto">
  <h2 class="font-extrabold ${headingcolor} text-lg title-font font-medium dark:${gridtextdark} text-center">Download Documents 
                    </h2>
                    
                    <p class="leading-relaxed text-base mb-3 text-center">You can download all of your company documents</p>
                    
    <div class="p-1.5 min-w-full inline-block align-middle">
      <div class="border rounded-xl overflow-hidden dark:border-neutral-700">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
          <thead class="${baicon} text-white dark:bg-neutral-700">
      <tr class="${baicon} text-white">
        <th class="border tex-white dark:border-slate-600 font-medium p-4 pl-8 pt-3 pb-3  dark:text-slate-200 text-left">Filename</th>
        <th class=" items-end tex-white text-right border dark:border-slate-600 font-medium p-4 pr-8 pt-3 pb-3  dark:text-slate-200">Downloads</th>
      </tr>
    </thead>
    <tbody class="bg-white dark:bg-slate-800">

      ${allFormattedResults}
    </tbody>
          </table>
      </div>
    </div>
  </div>
</div>`;
//   }

    return htmlContent;

}



function generatesinglehtmlvisa(jj) {
  
    let htmlContent = '';
var contact=jj;
//console.log(contact);
//    for (const contact of jj) {
        var keyin = "contact.visa_expiry_date";
       var authy="contact.authority";
        var vq="contact.resident_status";
        //var aform="contact.upload_application_form";
       // var bl="contact.upload_license";
        
   
        // Array of key-title pairs
const keysAndTitles = setKeysAndTitles(parseCompanyFileView(userfileview));
        let allFormattedResults = '';

// Loop through each key-title pair, format, and accumulate the results
keysAndTitles.forEach(pair => {
    const output = formatFiles(contact.customFields, pair.key, pair.title);
    allFormattedResults += output + "\n";  // Concatenate each result with a newline for separation
});
        
        vq=getValueByKey(contact.customFields, vq);
        
       
        var la=getValueByKey(contact.customFields, keyin);
        var auth= getValueByKey(contact.customFields, authy);

let allvisas="wohoo";

var companyName2=encodeURI(contact.companyName);
var e=encrypt(companyName2,"667766");
//console.log("Harry with push",JSON.stringify(allvisas));
  
          htmlContent += `
          <div class="p-4 w-full md:w-1/2 lg:w-1/2">
              <div class="flex rounded-lg h-full dark:${darkgrid} ${gridback} dark:${gridtextdark} p-8 flex-col">
                  <div class="items-center mb-3">
                                       <h2 class="font-extrabold ${headingcolor} text-lg title-font font-medium dark:${gridtextdark}">${contact.companyName}  
                    </h2>  <span class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Expired On: ${la}</span>
                  </div>
                  <div class="flex-grow">
                      <p class="leading-relaxed text-base">Name: ${contact.fullNameLowerCase} <br> Email: ${contact.email} <br>Phone: ${contact.phone}</p>
                  
                   
                    
              </div>
          </div>
          </div>
          
          
            <div class="p-4 w-full md:w-1/2 lg:w-1/2">
              <div class="flex rounded-lg h-full dark:${darkgrid} ${gridback} dark:${gridtextdark} p-8 flex-col">
                 
                  <div class="flex-grow">
                        <h2 class="font-extrabold ${headingcolor} text-lg title-font font-medium dark:${gridtextdark}">Company Visa Quota
                      </h2><p class="leading-relaxed text-base mb-3">Resident Status: <b>${vq}</b></p>
                    
                        <h2 class=" mt-2 mb-1 text-lg title-font font-medium  dark:${gridtextdark}">Authority:    <p class="leading-relaxed text-base">
                   ${auth}</p>
                   </h2></div>
          </div>
  </div>
          
          
          
          
     
<div class="p-4 w-full">
  <div class="p-4 rounded m-1 dark:${darkgrid} ${gridback} dark:${gridtextdark} -m-1.5 overflow-x-auto">
  <h2 class="font-extrabold ${headingcolor} text-lg title-font font-medium dark:${gridtextdark} text-center">Download Documents 
                    </h2>
                    
                    <p class="leading-relaxed text-base mb-3 text-center">You can download all of your company documents</p>
                    
    <div class="p-1.5 min-w-full inline-block align-middle">
      <div class="border rounded-xl overflow-hidden dark:border-neutral-700">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
          <thead class="${baicon} text-white dark:bg-neutral-700">
      <tr class="${baicon} text-white">
        <th class="border tex-white dark:border-slate-600 font-medium p-4 pl-8 pt-3 pb-3  dark:text-slate-200 text-left">Filename</th>
        <th class=" items-end tex-white text-right border dark:border-slate-600 font-medium p-4 pr-8 pt-3 pb-3  dark:text-slate-200">Downloads</th>
      </tr>
    </thead>
    <tbody class="bg-white dark:bg-slate-800">

      ${allFormattedResults}
    </tbody>
          </table>
      </div>
    </div>
  </div>
</div>`;




        
 //   }

    return htmlContent;

}






function navigatebar(loginuser, domain2) {
    let htmlContent = "";
    
   // const url = `https://portal.crmsoftware.ae/allpages?domain=${domain2}`;
        const url = `https://${domain2}/allpages?domain=${domain2}`;

    // Returning the Axios promise directly
    return axios.get(url)
        .then(response => {
            const pages = response.data;
 
            // Loop through each page object in the array
            pages.forEach(page => {
                const cpage = encrypt(page.landing_page_url,"667766"); 
                htmlContent += `
                    <a href="/addon/${cpage}" class="menlink px-4 py-3 flex dark:text-white items-center space-x-4 rounded-md text-gray-500 group">
                        ${page.icon}
                        <span>${page.title}</span>
                    </a>
                `;
            });

            // Conditional content for specific users
            if (loginuser === "it@ebmsbusiness.com") {
                htmlContent += `
                    <a href="/add-page" class="menlink px-4 py-3 flex dark:text-white items-center space-x-4 rounded-md text-gray-500 group">
                        <i class="fas fa-gear"></i>
                        <span>Settings</span>
                    </a>
                `;
            }

            return htmlContent;  // Ensure HTML content is returned here
        })
        .catch(error => {
            console.error('Error fetching pages: ', error);
            return `<p>Error loading navigation bar.</p>`;  // Return error message or similar
        });
}





//admin dashboard setting for addon pages
function allpages(loginuser, domain2) {
    let htmlContent = `
       <div class="p-1.5 min-w-full inline-block align-middle">
      <div class="border rounded-xl overflow-hidden dark:border-neutral-700">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
          <thead class="${baicon} text-white dark:bg-neutral-700">
      <tr class="${baicon} text-white">
        <th class="border tex-white dark:border-slate-600 font-medium p-4 pl-8 pt-3 pb-3  dark:text-slate-200 text-left">Title</th>
                <th class="border tex-white dark:border-slate-600 font-medium p-4 pl-8 pt-3 pb-3  dark:text-slate-200 text-left">Domain</th>
        <th class=" items-end tex-white text-right border dark:border-slate-600 font-medium p-4 pr-8 pt-3 pb-3  dark:text-slate-200">URL</th>
                <th class=" items-end tex-white text-right border dark:border-slate-600 font-medium p-4 pr-8 pt-3 pb-3  dark:text-slate-200">Action</th>
      </tr>
    </thead>
    <tbody class="bg-white dark:bg-slate-800"> `;
   // const url = `https://portal.crmsoftware.ae/allpages?domain=${domain2}`;
 const url = `https://${domain2}/allpages?domain=${domain2}`;
    // Returning the Axios promise directly
    return axios.get(url)
        .then(response => {
            const pages = response.data;

            // Loop through each page object in the array
            pages.forEach(page => {
                htmlContent += `
                            <tr>
        <td class="border border-slate-200 dark:border-slate-600 p-2 pl-8 text-slate-500 dark:text-slate-400">   ${page.icon} ${page.title}</td>
                <td class="border border-slate-200 dark:border-slate-600 p-2 pl-8 text-slate-500 dark:text-slate-400">   ${page.domain}</td>
        <td class="border border-slate-200 dark:border-slate-600 p-2 pr-8 text-slate-500 dark:text-slate-400 items-end text-right">${page.landing_page_url}</td>
        <td class="border border-slate-200 dark:border-slate-600 p-2 pr-8 text-slate-500 dark:text-slate-400 items-end text-right">
        <form action="/delete-page" method="get"><input type="hidden" value="${page.id}" name="id"><input type="submit" class="mb-3 inline-block bg-red-600 text-white font-bold py-2 px-4 border border-red-700 rounded" value="Delete"></form>
        <a href="/edit-addonpage/${page.id}" class="mb-3 inline-block ${bbt} ${baicon}  text-white font-bold py-2 px-4 border border-blue-700 rounded">Edit</a>
        <a href="/page/page-clone/${page.id}" class="mb-3 inline-block ${bbt} ${baicon}  text-white font-bold py-2 px-4 border border-blue-700 rounded">Clone</a></td>
      </tr>
                `;
            });

htmlContent+=`  </tbody>
          </table>
      </div>
    </div>
`;
            return htmlContent;  // Ensure HTML content is returned here
        })
        .catch(error => {
            console.error('Error fetching pages: ', error);
            return `<p>Error loading navigation bar.</p>`;  // Return error message or similar
        });
}




//admin dashboard setting for addon pages
function addonfront(loginuser,domain2) {
    let htmlContent = ``;
 //   const url = `https://portal.crmsoftware.ae/allpages?domain=${domain2}`;
   const url = `https://${domain2}/allpages?domain=${domain2}`;
    // Returning the Axios promise directly
    return axios.get(url)
        .then(response => {
            const pages = response.data;

            // Loop through each page object in the array
            pages.forEach(page => {
                   const cpage = encrypt(page.landing_page_url,"667766"); 
                htmlContent += `
                
                  <div class="xl:w-1/3 md:w-1/2 p-4" id="${page.id}">
        <div class="dark:${darkgrid} ${gridback} dark:${gridtextdark} p-6 rounded-lg">
          <img class="h-50 rounded w-full object-cover object-center mb-6" src="${page.feature_image_url}" alt="content">
          <h3 class="tracking-widest text-indigo-500 text-xs font-medium title-font">Addon Services</h3>
          <h2 class="dark:${gridtextdark} text-lg text-gray-900 font-medium title-font mb-4">${page.title}</h2>
       
          
          
          <div class="mt-5">
          <a href="/addon/${cpage}" class="${bbt} ${baicon}  text-white font-bold py-2 px-4 border border-blue-700 rounded">Get Best Offer
                       
                      </a></div>
          
        </div>
      </div>
                
                
                `;
            });

htmlContent+=``;
            return htmlContent;  // Ensure HTML content is returned here
        })
        .catch(error => {
            console.error('Error fetching pages: ', error);
            return `<p>Error loading navigation bar.</p>`;  // Return error message or similar
        });
}




//admin dashboard setting for addon pages
function alldomains(domain2) {
    let htmlContent = `
       <div class="p-1.5 min-w-full inline-block align-middle">
      <div class="border rounded-xl overflow-hidden dark:border-neutral-700">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
          <thead class="${baicon} bg-black text-white">
      <tr class="${baicon} ">
        <th class="border dark:border-slate-600 font-medium p-4 pl-8 pt-3 pb-3  dark:text-slate-200 text-left">Title</th>
                <th class="border dark:border-slate-600 font-medium p-4 pl-8 pt-3 pb-3  dark:text-slate-200 text-left">Domain</th>
        <th class=" items-end text-right border dark:border-slate-600 font-medium p-4 pr-8 pt-3 pb-3  dark:text-slate-200">Logo URL</th>
                <th class=" items-end text-right border dark:border-slate-600 font-medium p-4 pr-8 pt-3 pb-3  dark:text-slate-200">Action</th>
      </tr>
    </thead>
    <tbody class="bg-white dark:bg-slate-800"> `;
    //const url = `https://portal.crmsoftware.ae/all_domains`;
 const url = `https://${domain2}/all_domains`;
    // Returning the Axios promise directly
    return axios.get(url)
        .then(response => {
            const pages = response.data;

            // Loop through each page object in the array
            pages.forEach(page => {
                htmlContent += `
                            <tr>
        <td class="border border-slate-200 dark:border-slate-600 p-2 pl-8 text-slate-500 dark:text-slate-400">   ${page.company_name}</td>
                <td class="border border-slate-200 dark:border-slate-600 p-2 pl-8 text-slate-500 dark:text-slate-400">   ${page.domain}</td>
        <td class="border border-slate-200 dark:border-slate-600 p-2 pr-8 text-slate-500 dark:text-slate-400 items-end text-right">${page.logo_url}</td>
        <td class="border border-slate-200 dark:border-slate-600 p-2 pr-8 text-slate-500 dark:text-slate-400 items-end text-right"><form action="/setup_endpoint_delete" method="post"><input type="hidden" value="${page.id}" name="id"><input class="inline-block bg-red-600 mb-3 text-white font-bold py-2 px-4 border border-blue-700 rounded" type="submit" value="Delete"></form><a class="mb-3 inline-block ${bbt} ${baicon}  text-white font-bold py-2 px-4 border border-blue-700 rounded" href="/setup/edit/${page.id}">Edit</a><br><a class="mb-3 inline-block ${bbt} ${baicon}  text-white font-bold py-2 px-4 border border-blue-700 rounded" href="/setup/clone/${page.id}">Clone Portal Settings</a></td>
      </tr>
                `;
            });

htmlContent+=`  </tbody>
          </table>
      </div>
    </div>
`;
            return htmlContent;  // Ensure HTML content is returned here
        })
        .catch(error => {
            console.error('Error fetching pages: ', error);
            return `<p>Error loading navigation bar.</p>`;  // Return error message or similar
        });
}








//get all pages in json that will fecth all pages base on requirement
app.get('/allpages',(req,res) =>{
 //   const domain2 = req.query.domain;
 const domain2 = req.headers['x-forwarded-host'];
        //domain query is not empty then run this code
        const sql = 'SELECT * FROM pages WHERE domain = ?';
        db.query(sql, [domain2], (err, results) => {
        if (err) {
            return res.status(500).send('Error retrieving pages');
        } else {
       
            // Uncomment the next line if you need to send the results as a JSON response.
             res.json(results);
        
    }
});
});



app.get('/page/page-clone/:id', sessionCheck, (req, res) => {
    const { id } = req.params;

    const selectQuery = `INSERT INTO pages (domain,icon, title, feature_image_url, landing_page_url, created_at, updated_at)
SELECT
   domain, 
icon, 
title, 
feature_image_url, 
landing_page_url, 
created_at, 
updated_at
FROM pages
WHERE id = ?`;
    db.query(selectQuery, [id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Failed to retrieve domain configuration.');
        }
        if (results.length === 0) {
            return res.status(404).send('Configuration not found.');
        }

        const config = results[0];
        res.redirect('/add-page');
    });
});






app.get('/pages',(req,res) => {
       const sql = 'SELECT * FROM pages';
    db.query(sql, (err, results) => {
        if (err) {
        return res.status(500).send('Error retrieving pages');
        } 
        else {
               res.json(results);
        
        }
    });
})


app.get('/all_domains',(req,res) => {
       const sql = 'SELECT * FROM domain_config';
    db.query(sql, (err, results) => {
        if (err) {
        return res.status(500).send('Error retrieving pages');
        } 
        else {
               res.json(results);
        
        }
    });
})


app.get('/add-page',sessionCheck, async(req,res) => {
    
    //new page added html
 var addform=`
     <h2 class="text-2xl font-semibold mb-4 dark:text-gray-700">Add New Page</h2>
  <form id="pageForm" method="POST" action="/add-page" class="space-y-4">
                <div>
                    <label for="domain" class="block text-sm font-medium text-gray-700">Domain</label>
                    <input type="text" id="domain" name="domain" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:text-gray-700 sm:text-sm">
                </div>
                   <div>
                    <label for="icon" class="block text-sm font-medium text-gray-700">Icon <a href="https://fontawesome.com/search?m=free&o=r" target="_blank">Check Icons from here</a> Click on any icon and just copy the code and paste it here</label>
                    <input type="text" id="icon" name="icon" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:text-gray-700 sm:text-sm">
                </div>
                <div>
                    <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
                    <input type="text" id="title" name="title" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:text-gray-700 sm:text-sm">
                </div>
                <div>
                    <label for="featureImageUrl" class="block text-sm font-medium text-gray-700">Feature Image URL</label>
                    <input type="text" id="featureImageUrl" name="featureImageUrl" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:text-gray-700 sm:text-sm">
                </div>
                <div>
                    <label for="landingPageUrl" class="block text-sm font-medium text-gray-700">Landing Page URL</label>
                    <input type="url" required id="landingPageUrl" name="landingPageUrl" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:text-gray-700 sm:text-sm">
                </div>
                <div>
                    <button type="submit" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${baicon} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Add Page</button>
                </div>
            </form>
 `;
    
    
    
    // const domain2 = req.hostname;
     const domain2 = req.headers['x-forwarded-host'];
    const sql = 'SELECT * FROM pages';
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).send('Error retrieving pages');
        }else {
         console.log(results);
        //res.json(results);
      }
    });
       // console.log(results);
    
const loginuser=req.session.user;
let htmlContent="Yoo this page hold all addon services";
try {
    const allout= await allpages(req.session.user, domain2);
    const sidy = await navigatebar(req.session.user, domain2);
         res.render('settings', {
                    title: 'Pages Setting',
                    user: req.session.user,
                    logo: logoUrl,
                    theme: req.client.theme,
                    contacts: htmlContent,
                    background:back,
                    darkback:darkback,
                    sidedark:sidedark,
                    sideback:sideback,
                    butico:baicon,
                    namo:req.session.namo,
                    sidy:sidy,
                    allout:allout,
                    addform:addform,
                    emcod:emcode1
                });
} catch (error) {
                console.error('Failed to generate navigation bar:', error);
                res.status(500).send('Failed to load page settings.');
            }
    
})






// Edit page route
app.get('/edit-addonpage/:id', sessionCheck, async (req, res) => {
    
    const pageId = req.params.id;
 //   const domain2 = req.hostname;
    const domain2 = req.headers['x-forwarded-host'];
    const sql = 'SELECT * FROM pages WHERE id = ?';  // Query to get the specific page by ID

   try {
         const allout= await allpages(req.session.user, domain2);
    const sidy = await navigatebar(req.session.user, domain2);
          db.query(sql, [pageId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Failed to retrieve domain configuration.');
        }
        if (results.length === 0) {
            return res.status(404).send('Configuration not found.');
        }

        const page = results[0];
       // res.render('setup_edit', { config });
 
        
        
      //  const results = await db.query(sql, [pageId]);
        // if (results[0].length > 0) {
        //     const page = results[0][0];  // Assuming only one row is returned

            // Form with pre-filled values for editing
            var editForm = `
              <h2 class="text-2xl font-semibold mb-4 dark:text-gray-700">Edit Page <a href="/add-page" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${baicon} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Back To Add Page</a></h2>
            <form id="pageForm" method="post" action="/update-page" class="space-y-4">
                <div>
                    <label for="domain" class="block text-sm font-medium text-gray-700">Domain</label>
                       <input type="hidden" id="id" name="id" value="${pageId}" required>
                    <input type="text" id="domain" name="domain" value="${page.domain}" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:text-gray-700 sm:text-sm">
                </div>
                <div>
                    <label for="icon" class="block text-sm font-medium text-gray-700">Icon <a href="https://fontawesome.com/search?m=free&o=r" target="_blank">Check Icons from here</a> Click on any icon and just copy the code and paste it here</label>
                    <textarea name="icon"  required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:text-gray-700 sm:text-sm">${page.icon}</textarea>
                </div>
                <div>
                    <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
                    <input type="text" id="title" name="title" value="${page.title}" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:text-gray-700 sm:text-sm">
                </div>
                <div>
                    <label for="featureImageUrl" class="block text-sm font-medium text-gray-700">Feature Image URL</label>
                    <input type="text" id="featureImageUrl" name="featureImageUrl" value="${page.feature_image_url}" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:text-gray-700 sm:text-sm">
                </div>
                <div>
                    <label for="landingPageUrl" class="block text-sm font-medium text-gray-700">Landing Page URL</label>
                    <input type="url" required id="landingPageUrl" name="landingPageUrl" value="${page.landing_page_url}" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:text-gray-700 sm:text-sm">
                </div>
                <div>
                    <button type="submit" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Update Page</button>
                </div>
            </form>
            `;

            res.render('settings', {
                title: 'Edit Page',
                user: req.session.user,
                logo: logoUrl,
                theme: req.client.theme,
                contacts: "Edit existing page details",
                background: back,
                darkback: darkback,
                sidedark: sidedark,
                sideback: sideback,
                butico: baicon,
                namo: req.session.namo,
                sidy:  sidy,
                allout:  allout,
                addform: editForm,
                emcod:emcode1
            });
        // } else {
        //     res.status(404).send('Page not found');
        // }
          });
    } catch (error) {
        console.error('Failed to retrieve page for editing:', error);
        res.status(500).send('Failed to load edit form.');
    }
});





// app.get('/update-page', express.urlencoded({ extended: true }), sessionCheck, (req, res) => {
//     const {
//         id, domain, icon, title, featureImageUrl, landingPageUrl
//     } = req.query;

//     const updateQuery = `
//       UPDATE pages SET domain=?,icon=?,title=?,feature_image_url=?,landing_page_url=?WHERE id=?
//     `;
//     const params = [
//       domain, icon, title, featureImageUrl, landingPageUrl,id
//     ];

//     db.query(updateQuery, params, (err, result) => {
//         if (err) {
//             console.error('Database error:', err);
//             return res.status(500).send('Failed to update domain configuration.');
//         }
//         res.redirect('/add-page');
//     });
// });


// Route to handle form submissions for updating a page
app.post('/update-page', express.urlencoded({ extended: true }), sessionCheck, (req, res) => {
    const { id, domain, icon, title, featureImageUrl, landingPageUrl } = req.body;

    if (!id) {
        return res.status(400).send("No page ID provided.");
    }

    const updateQuery = `
        UPDATE pages 
        SET domain = ?, 
            icon = ?, 
            title = ?, 
            feature_image_url = ?, 
            landing_page_url = ? 
        WHERE id = ?
    `;
    const params = [domain, icon, title, featureImageUrl, landingPageUrl, id];

    db.query(updateQuery, params, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Failed to update the page details.');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send("No page found with the given ID.");
        }
        res.redirect('/add-page');  // Redirect to a page list or confirmation page
    });
});



//code end here for edit page-------------------------













app.get('/addon/:page',sessionCheck, async(req,res) => {
    const addonpage = decrypt(req.params.page,"667766");
    
    // Define the additional query parameters
// Define the additional query parameters
const additionalParams = {
  full_name: req.session.namo,
  email: req.session.user
};

// Check if the URL already contains query parameters
let separator = addonpage.includes('?') ? '&' : '?';

// Convert additionalParams to query string
const additionalQueryString = Object.entries(additionalParams)
  .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
  .join('&');

// Combine the URL and additional query string
const updatedAddonpage = addonpage + separator + additionalQueryString;
console.log(updatedAddonpage);
    
   const domain2 = req.headers['x-forwarded-host'];
  //  const domain2 = req.hostname;
    const sql = 'SELECT * FROM pages';
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).send('Error retrieving pages');
        }else {
         console.log(results);
        //res.json(results);
      }
    });
       // console.log(results);
    
const loginuser=req.session.user;
let htmlContent="Yoo this page hold all addon services";
try {
    const allout= await allpages(req.session.user, domain2);
    const sidy = await navigatebar(req.session.user, domain2);
         res.render('addon', {
                    title: 'Addon Services',
                    user: req.session.user,
                    logo: logoUrl,
                    theme: req.client.theme,
                    contacts: htmlContent,
                    background:back,
                    darkback:darkback,
                    sidedark:sidedark,
                    sideback:sideback,
                    butico:baicon,
                    namo:req.session.namo,
                    sidy:sidy,
                    allout:allout,
                    addonpage:updatedAddonpage,
                    emcod:emcode1
                });
} catch (error) {
                console.error('Failed to generate navigation bar:', error);
                res.status(500).send('Failed to load page settings.');
            }
    
})








// Route to add a new page
app.post('/add-page', express.json(), sessionCheck, (req, res) => {
    const { domain, icon, title, featureImageUrl, landingPageUrl } = req.body;
    const sql = 'INSERT INTO pages (domain, icon, title, feature_image_url, landing_page_url) VALUES (?, ?, ?, ?, ?)';
    const params = [domain, icon, title, featureImageUrl, landingPageUrl];
    
    db.query(sql, params, (err, result) => {
        if (err) {
            return res.status(500).send('Error adding new page');
        }
        //res.status(201).send('Page added successfully');
     res.redirect('/add-page');
        
    });
});



app.post('/setup', express.json(), sessionCheck, (req, res) => {
    const {
        domain, location_id, v_location_id, logo_url, background, dark_back, side_dark_back, side_back,
        grid_back, dark_grid_back, text_light, text_dark, icon_button_back, button_bottom_border,
        company_name, company_address, heading_color,emcode,cfv
    } = req.body;

    const insertQuery = `
        INSERT INTO domain_config (
            domain, location_id, v_location_id, logo_url, background, dark_back, side_dark_back, side_back,
            grid_back, dark_grid_back, text_light, text_dark, icon_button_back, button_bottom_border,
            company_name, company_address, heading_color,emcode,cfv
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)
    `;
    const params = [
        domain, location_id, v_location_id, logo_url, background, dark_back, side_dark_back, side_back,
        grid_back, dark_grid_back, text_light, text_dark, icon_button_back, button_bottom_border,
        company_name, company_address, heading_color,emcode,cfv
    ];

    db.query(insertQuery, params, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Failed to save domain configuration.');
        }
        res.redirect('/domain-setup');
    });
});







// Route to delete a page
app.get('/delete-page', sessionCheck, (req, res) => {
    const pageId = req.query.id;
    
    db.query('DELETE FROM pages WHERE id = ?', [pageId], (error, results) => {
        if (error) {
            return res.status(500).send(error);
        }
        res.redirect('/add-page');
    });
});

// Route to edit a page (this is a simple example, you'll need a form to edit the page)
app.post('/edit-page/:id', sessionCheck, (req, res) => {
    const pageId = req.params.id;
    const { domain,icon, title, featureImageUrl, landingPageUrl } = req.body;
    
    pool.query('UPDATE pages SET domain = ?,icon = ?, title = ?, feature_image_url = ?, landing_page_url = ? WHERE id = ?', [domain, title, featureImageUrl, landingPageUrl, pageId], (error, results) => {
        if (error) {
            return res.status(500).send(error);
        }
        res.redirect('/add-page');
    });
});


app.get('/dashboard', sessionCheck,  async(req, res) => {
       const domain2 = req.headers['x-forwarded-host'];
      //  const domain2 = req.hostname;
   sharedData['latest']
   // if (!sharedData['latest']) {
        socket.emit('contact', {
            query1: req.session.user,
            query2: locationId,
            query3: 10,
        });
      
        socket.once('searchResult',  async(data) => {
            if (data.error) {
                console.error('Socket.IO Error:', data.error);
                res.status(500).send('An error occurred.');
            } else {
                sharedData['latest'] = data.contacts;
                // Generate HTML content with the new data
                let htmlContent =  generateHtmlContent(sharedData['latest']);
//let sidy=navigatebar(req.session.user,domain2);
    let sidy=navigatebar(req.session.user,domain2);
    console.log(sidy);
    try {
    const sidy = await navigatebar(req.session.user, domain2);
    const addony= await addonfront(req.session.user, domain2);
                res.render('dashboard', {
                    title: 'Dashboard',user: req.session.user,logo: logoUrl,lid: locationId,theme: req.client.theme,contacts: htmlContent,background:back,darkback:darkback,sidedark:sidedark,sideback:sideback,butico:baicon,namo:req.session.namo,sidy:sidy,addony:addony,emcod:emcode1 
                });
    } catch (error) {
                console.error('Failed to generate navigation bar:', error);
                res.status(500).send('Failed to load page settings.');
            }
                
            }
        });
   
});





//company File
app.get('/company', sessionCheck, async(req, res) => {
   const domain2 = req.headers['x-forwarded-host'];
  //  const domain2 = req.hostname;
     sharedData['qw'];
    const companyid = req.query.id;  // Assuming 'id' is the query string parameter
        socket.emit('contactid', {
            query1: companyid,
            query2: locationId,
         
        });
        socket.once('searchResult', async (data) => {
           var compan=data.contact.companyName;
            if (data.error) {
                console.error('Socket.IO Error:', data.error);
                res.status(500).send('An error occurred.');
               // console.log()
            } else {
                sharedData['qw'] = data.contact;
                let htmlContent = generatesinglehtml(sharedData['qw']);
try {
    const sidy = await navigatebar(req.session.user, domain2);
                res.render('company', 
                {
                    title: compan+' | Company',
                    user: req.session.user,
                    logo: logoUrl,
                    lid: locationId,  // Use locationId extracted from query string
                    theme: req.client.theme,
                    contacts: htmlContent,
                    companyid:compan,
                    background:back,
                    darkback:darkback,
                    sidedark:sidedark,
                    sideback:sideback,
                    butico:baicon,
                    namo:req.session.namo,
                    sidy:sidy,
                    emcod:emcode1
                });
} catch (error) {
                console.error('Failed to generate navigation bar:', error);
                res.status(500).send('Failed to load page settings.');
            }
            }
        });
});





//single visa File
app.get('/single', sessionCheck, async(req, res) => {
   const domain2 = req.headers['x-forwarded-host'];
  //  const domain2 = req.hostname;
     sharedData['qw'];
    const companyid = req.query.id;  // Assuming 'id' is the query string parameter
        socket.emit('contactid', {
            query1: companyid,
            query2: V_locationId,
         
        });
        socket.once('searchResult', async (data) => {
           var compan=data.contact.companyName;
            if (data.error) {
                console.error('Socket.IO Error:', data.error);
                res.status(500).send('An error occurred.');
               // console.log()
            } else {
                sharedData['qw'] = data.contact;
                let htmlContent = generatesinglehtmlvisa(sharedData['qw']);
try {
    const sidy = await navigatebar(req.session.user, domain2);
                res.render('single', 
                {
                    title: compan+' | Visa',
                    user: req.session.user,
                    logo: logoUrl,
                    lid: locationId,  // Use locationId extracted from query string
                    theme: req.client.theme,
                    contacts: htmlContent,
                    companyid:compan,
                    background:back,
                    darkback:darkback,
                    sidedark:sidedark,
                    sideback:sideback,
                    butico:baicon,
                    namo:req.session.namo,
                    sidy:sidy,
                    emcod:emcode1
                });
} catch (error) {
                console.error('Failed to generate navigation bar:', error);
                res.status(500).send('Failed to load page settings.');
            }
            }
        });
});











// app.get('/visas', sessionCheck, async(req, res) => {
//   const domain2 = req.headers['x-forwarded-host'];
//   //  const domain2 = req.hostname;
//      sharedData['vis'];
     
//     const companyid = decrypt(req.query.company,"667766"); 
// var decodedURI = decodeURIComponent(companyid);
// var decodedURI2 = encodeURIComponent(decodedURI);
// console.log(decodedURI2,decodedURI);
// //console.log(companyid);
//       socket.emit('contact', {
//             query1: decodedURI2,
//             query2: V_locationId,
//             query3: 10,
//         });
//         socket.once('searchResult',  async(data) => {
//             if (data.error) {
//                 console.error('Socket.IO Error:', data.error);
//                 res.status(500).send('An error occurred.');
//             } else {
//                 sharedData['vis'] = data.contacts;
//               // if(data.contacts.length===0){}
                
                
// const cpn=data.contacts[0].companyName;
// const cna=data.contacts[0].contactName;
// const cph=req.query.cphone;
// const cem=req.query.cem;
// const cauth=req.query.auth;
// //belongs_to
// const belongs_to=req.query.belongs_to;
//                 // Generate HTML content with the new data
//                 let htmlContent =  visasfile(sharedData['vis']);
//                 try {
//     const sidy = await navigatebar(req.session.user, domain2);
//                 res.render('visas', {
//                     title: 'visas',
//                     user: req.session.user,
//                     logo: logoUrl,
//                     lid: locationId,
//                     theme: req.client.theme,
//                     contacts: htmlContent,
//                     background:back,
//                     darkback:darkback,
//                     sidedark:sidedark,
//                     sideback:sideback,
//                     butico:baicon,
//                     namo:req.session.namo,
//                     companyid:decodedURI,
//                     sidy:sidy,
//                     cpn:cpn,
//                     cna:cna,
//                     cph:cph,
//                     cem:cem,
//                     cauth:cauth,
//                     belongs_to:belongs_to,
//                     emcod:emcode1
//                 });
//                 } catch (error) {
//                 console.error('Failed to generate navigation bar:', error);
//                 res.status(500).send('Failed to load page settings.');
//             }
//             }
//         });
// });

app.get('/visas', sessionCheck, async(req, res) => {
   const domain2 = req.headers['x-forwarded-host'];
   //  const domain2 = req.hostname;
   sharedData['vis'];
     
   const companyid = decrypt(req.query.company, "667766"); 
   var decodedURI = decodeURIComponent(companyid);
   var decodedURI2 = encodeURIComponent(decodedURI);
   console.log(decodedURI2, decodedURI);
   // console.log(companyid);
   socket.emit('contact', {
       query1: decodedURI2,
       query2: V_locationId,
       query3: 10,
   });
   socket.once('searchResult', async(data) => {
       if (data.error) {
           console.error('Socket.IO Error:', data.error);
           res.status(500).send('An error occurred.');
       } else if (!data.contacts || data.contacts.length === 0) {
          // res.status(404).send('No contacts found.');
        res.status(404).render('404');
           
       } else {
           sharedData['vis'] = data.contacts;
           const cpn = data.contacts[0].companyName;
           const cna = data.contacts[0].contactName;
           const cph = req.query.cphone;
           const cem = req.query.cem;
           const cauth = req.query.auth;
           const belongs_to = req.query.belongs_to;
           // Generate HTML content with the new data
           let htmlContent = visasfile(sharedData['vis']);
           try {
               const sidy = await navigatebar(req.session.user, domain2);
               res.render('visas', {
                   title: 'visas',
                   user: req.session.user,
                   logo: logoUrl,
                   lid: locationId,
                   theme: req.client.theme,
                   contacts: htmlContent,
                   background: back,
                   darkback: darkback,
                   sidedark: sidedark,
                   sideback: sideback,
                   butico: baicon,
                   namo: req.session.namo,
                   companyid: decodedURI,
                   sidy: sidy,
                   cpn: cpn,
                   cna: cna,
                   cph: cph,
                   cem: cem,
                   cauth: cauth,
                   belongs_to: belongs_to,
                   emcod: emcode1
               });
           } catch (error) {
               console.error('Failed to generate navigation bar:', error);
               res.status(500).send('Failed to load page settings.');
           }
       }
   });
});




// Setup Route to render setup page
// app.get('/setup',(req, res) => {
    
//      const domain = req.hostname;
//   // console.log(`Domain: ${domain}`);

//     try {
//         const [rows] = await pool.query('SELECT * FROM domain_config WHERE domain = ?', [domain]);
//         if (rows.length > 0) {
//           res.redirect('/');
//           // req.config = rows[0];
//       //     console.log('Configuration for Domain:', req.config);
//         } else {
//             console.error(`No configuration found for domain: ${domain}`);
//           // res.redirect('/setup');
//              const domain = req.query.domain || '';
//     res.render('setup', { domain });
//         }
    
   

    
    
// });
//Check the configuration
app.get('/setup-basic', async (req, res) => {
    const domain2 = req.headers['x-forwarded-host'];
   // const domain = req.hostname;
    try {
        const [rows] = await pool.query('SELECT * FROM domain_config WHERE domain = ?', [domain]);
        if (rows.length > 0) {
            res.redirect('/');
        } else {
            console.error(`No configuration found for domain: ${domain}`);
            const queryDomain = req.query.domain || '';
            res.render('setup', { domain: queryDomain });
        }
    } catch (error) {
        console.error(`Error querying the database: ${error.message}`);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/domain-setup',sessionCheck, async (req, res) => {
const domain2 = req.headers['x-forwarded-host'];
               try {
                   // const sidy = await navigatebar(req.session.user, domain2);
                   var alldom= await alldomains(domain2);
                   res.render('domain-setup', { 
                       alldomains:alldom,
                        user: req.session.user,
                    logo: logoUrl,
                    theme: req.client.theme,
                    background:back,
                    darkback:darkback,
                    sidedark:sidedark,
                    sideback:sideback,
                    butico:baicon,
                    namo:req.session.namo,
                    emcod:emcode1
                    });
                   
               }
               catch (error) {
                console.error('Failed to generate navigation bar:', error);
                res.status(500).send('Failed to load page settings.'+error);
            }

});

//domain CRUD
app.get('/setup/edit/:id', sessionCheck, (req, res) => {
    const { id } = req.params;

    const selectQuery = 'SELECT * FROM domain_config WHERE id = ?';
    db.query(selectQuery, [id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Failed to retrieve domain configuration.');
        }
        if (results.length === 0) {
            return res.status(404).send('Configuration not found.');
        }

        const config = results[0];
        res.render('setup_edit', { config });
    });
});



app.get('/setup/clone/:id', sessionCheck, (req, res) => {
    const { id } = req.params;

    const selectQuery = `INSERT INTO domain_config (domain, location_id,v_location_id,logo_url,background,dark_back,side_dark_back,side_back,grid_back,dark_grid_back,text_light,text_dark,icon_button_back,button_bottom_border, company_name,company_address,heading_color,emcode,cfv,cvv)
SELECT
    CONCAT('random_', domain),
    location_id,
    v_location_id,
    logo_url,
    background,
    dark_back,
    side_dark_back,
    side_back,
    grid_back,
    dark_grid_back,
    text_light,
    text_dark,
    icon_button_back,
    button_bottom_border,
    company_name,
    company_address,
    heading_color,
    emcode,cfv,cvv
FROM domain_config
WHERE id = ?`;
    db.query(selectQuery, [id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Failed to retrieve domain configuration.');
        }
        if (results.length === 0) {
            return res.status(404).send('Configuration not found.');
        }

        const config = results[0];
        res.redirect('/domain-setup');
    });
});




app.post('/setup_endpoint_edit', express.urlencoded({ extended: true }), sessionCheck, (req, res) => {
    const {
        id, domain, location_id, v_location_id, logo_url, background, dark_back, side_dark_back, side_back,
        grid_back, dark_grid_back, text_light, text_dark, icon_button_back, button_bottom_border,
        company_name, company_address, heading_color,emcode,cfv,cvv
    } = req.body;

    const updateQuery = `
        UPDATE domain_config 
        SET domain = ?, location_id = ?, v_location_id = ?, logo_url = ?, background = ?, dark_back = ?, 
            side_dark_back = ?, side_back = ?, grid_back = ?, dark_grid_back = ?, text_light = ?, 
            text_dark = ?, icon_button_back = ?, button_bottom_border = ?, company_name = ?, 
            company_address = ?, heading_color = ?,emcode=?,cfv=?,cvv=?
        WHERE id = ?
    `;
    const params = [
        domain, location_id, v_location_id, logo_url, background, dark_back, side_dark_back, side_back,
        grid_back, dark_grid_back, text_light, text_dark, icon_button_back, button_bottom_border,
        company_name, company_address, heading_color,emcode,cfv,cvv, id
    ];

    db.query(updateQuery, params, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Failed to update domain configuration.');
        }
        res.redirect('/domain-setup');
    });
});

app.post('/setup_endpoint_delete', express.urlencoded({ extended: true }), sessionCheck, (req, res) => {
    const {
        id
    } = req.body;

    const updateQuery = `
        delete from domain_config WHERE id = ?
    `;
    const params = [
        id
    ];

    db.query(updateQuery, params, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Failed to update domain configuration.');
        }
        res.redirect('/domain-setup');
    });
});

app.get('/logout', sessionCheck, async (req, res) => {
    const domain2 = req.headers['x-forwarded-host'];

    // Clear the session
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Could not log out.');
        }

        // Clear cookies
        res.clearCookie('connect.sid'); // Assuming 'connect.sid' is your session cookie

        // Redirect to domain2
        res.redirect(`https://${domain2}`);
    });
});



//404 render
app.get('/404', (req, res) => {
    // Render the 404.ejs view
    res.status(404).render('404');
});

app.use(cors({
  origin: '*'
}));
//Port is running
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
