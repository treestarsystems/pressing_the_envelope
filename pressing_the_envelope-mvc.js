//#!/usr/bin/env node
/*
Purpose: Initial MVC to generate emails for mail system load testing.
ToDo:
*/

var argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');

//Core variables and functions
//Source: https://learnersbucket.com/examples/javascript/how-to-validate-json-in-javascript/
function validateJSON (obj) {
 let o = JSON.stringify(obj);
 try{
  JSON.parse(o);
 } catch (e) {
  return false;
 }
 return true;
}

//Generate a random alphanumeric string with special characters of length x
function genSpecial(x) {
 var specialchar = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%_-(),;:.*"
 var text = "";
 for (var i = 0; i < x; i++)
  text += specialchar.charAt(Math.floor(Math.random() * specialchar.length));
  return text;
}

//Generate a random number within defined range
function getRandomInt(min, max) {
 return Math.round(Math.random() * (max - min) + min);
}

function defaultErrorHandler (error) {
 let returnObj = {"status": "","message": "","payload": ""};
 //This is done just incase you use the "throw" keyword to produce your own error.
 let errorMessage = ((error.message) ? error.message:error);
 returnObj.status = "failure";
 returnObj.message = `Function: ${arguments.callee.caller.name} - Error: ${errorMessage}`;
 returnObj.payload = error;
 return returnObj;
}

//App Specific variables and functions
const helpMenu = `\nHelp Menu:
-f: name of account in json file
-t: name of account in json file
-b: email body file
-e: encryption yes or no
-j: json file with email
-n: number of emails to generate (default:100)
-m: maximum number of emails to send per queue flush (default:10)
-D: inline delay between messages (in secs)
-H: inline email headers string
-F: inline from email address
-T: inline to email address
-S: inline subject
-B: inline body
`;

async function generateEmails () {
 let returnObj = {"status": "","message": "","payload": ""};
 try {
  if (argv.n > 1000) throw 'Hey man calm down...no more than 1000';
  let ge = [];
  let a = (argv.n ? argv.n:100);
  let S = (argv.S ? argv.S:genSpecial(10));
  let B = (argv.B ? argv.B:genSpecial(100));
  for (let i = 0; i < a; i++) {
   let e = {
    subject: S.replace(/[\\$'"]/g, "\\$&"),
    body: B.replace(/[\\$'"]/g, "\\$&"),
    headers: {
     'x-my-key': 'header value',
     'x-another-key': 'another value'
     }
   }
   ge.push(e);
  }
  returnObj.status = "success";
  returnObj.message = "success";
  returnObj.payload = ge;
  return returnObj;
 } catch (e) {
  console.log(defaultErrorHandler(e));
 }
}

async function searchForAccountName (file,searchString) {
 /*Todo:
  validate json file
 */
 try {
  let accountData = require(argv.j);
  for (let name in accountData) {
   if (name == searchString) {
    return accountData[name];
   }
  }
 } catch (e) {
  console.log(defaultErrorHandler(e));
 }
}

(async () => {
 try {
  //Help Menu
  if (argv.h) {
   console.log(helpMenu);
   return;
  }
  //Conduct tests
  if (!argv.j) {
   if (argv.F && argv.T) {
    if (argv.f || argv.t) console.log('\nNOTE: -f & -t are ignored when using -F & -T');
    console.log(argv.F);
    console.log(argv.T);
   } else {
    throw '\nNOTE: Please include a email file or use -F and -T triggers together.';
   }
  } else {
   if (!argv.f && !argv.T) {
    throw '\nNOTE: When using -j. Please include account key using -f and -t triggers together.';
   }
   let emails = await generateEmails();
   if (emails.status == 'failure') throw emails
   let fromAccountObj = await searchForAccountName(argv.j,argv.f);
   let toAccountObj = await searchForAccountName(argv.j,argv.t);
   console.log(`From:\n ${JSON.stringify(fromAccountObj)}\nTo:\n ${JSON.stringify(toAccountObj)}\nAmount:\n ${JSON.stringify(emails.payload.length)}`);
   console.log(`Messages:\n ${JSON.stringify(emails.payload)}\n`);
  }
 } catch (e) {
  console.log(defaultErrorHandler(e));
 }
})();
