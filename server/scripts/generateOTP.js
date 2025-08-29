const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

console.log('=== OTP Generator for Testing ===\n');

rl.question('Enter your email: ', (email) => {
  rl.question('Enter your name: ', (name) => {
    const otp = generateOTP();
    
    console.log('\n=== Generated OTP ===');
    console.log(`Email: ${email}`);
    console.log(`Name: ${name}`);
    console.log(`OTP Code: ${otp}`);
    console.log(`Valid for: 10 minutes`);
    console.log('\nCopy the OTP code and use it in the application.');
    console.log('Note: In production, this would be sent via email.');
    
    // Store in global for testing (in real app, this would be in database/memory store)
    console.log('\n=== For Development Testing ===');
    console.log('You can now use this OTP in the voting application.');
    
    rl.close();
  });
});

rl.on('close', () => {
  console.log('\nOTP generation completed.');
  process.exit(0);
});