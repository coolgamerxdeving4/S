const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');

// Initialize express app
const app = express();
const port = 3000;

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Serve static files (CSS, JS) directly from memory
app.use(express.static('public'));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTML page with embedded CSS and JS
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Doggeria - Coder & Designer</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f9; color: #333; }
        header { background-color: #4CAF50; color: white; text-align: center; padding: 2rem; }
        .intro { display: flex; justify-content: space-between; padding: 2rem; }
        .intro-text { width: 60%; }
        .animation { width: 30%; display: flex; justify-content: center; align-items: center; }
        .animation-box { width: 100px; height: 100px; background-color: #4CAF50; animation: bounce 2s infinite; }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-50px); } }
        .order { padding: 2rem; background-color: white; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1); margin: 2rem; }
        form { display: flex; flex-direction: column; }
        label { margin-top: 1rem; }
        input, textarea { padding: 0.5rem; margin: 0.5rem 0; border: 1px solid #ccc; border-radius: 5px; }
        button { padding: 1rem; background-color: #4CAF50; color: white; border: none; cursor: pointer; border-radius: 5px; font-size: 1rem; }
        button:hover { background-color: #45a049; }
        footer { background-color: #333; color: white; text-align: center; padding: 1rem; }
      </style>
    </head>
    <body>
      <header>
        <h1>Welcome to Doggeria's Website!</h1>
        <p>I'm Doggeria, a Coder and Designer. Let's make something amazing together!</p>
      </header>
    
      <section class="intro">
        <div class="intro-text">
          <h2>About Me</h2>
          <p>I specialize in coding and design. From websites to software, I make it all!</p>
        </div>
        <div class="animation">
          <div class="animation-box"></div>
        </div>
      </section>
    
      <section class="order">
        <h2>Place Your Order</h2>
        <form id="orderForm" enctype="multipart/form-data">
          <label for="name">Your Name:</label>
          <input type="text" id="name" name="name" required>

          <label for="email">Your Email:</label>
          <input type="email" id="email" name="email" required>

          <label for="file">Attach a file (optional):</label>
          <input type="file" id="file" name="file">

          <label for="orderDetails">Order Details:</label>
          <textarea id="orderDetails" name="orderDetails" required></textarea>

          <button type="submit">Submit Order</button>
        </form>
      </section>
    
      <footer>
        <p>&copy; 2024 Doggeria</p>
      </footer>
    
      <script>
        document.getElementById('orderForm').addEventListener('submit', function(event) {
          event.preventDefault();
          const formData = new FormData(this);
          fetch('/submit-order', {
            method: 'POST',
            body: formData
          })
          .then(response => response.json())
          .then(data => {
            alert('Your order has been submitted!');
            document.getElementById('orderForm').reset();
          })
          .catch(error => {
            console.error('Error:', error);
            alert('Something went wrong. Please try again.');
          });
        });
      </script>
    </body>
    </html>
  `);
});

// Handle order form submission
app.post('/submit-order', upload.single('file'), (req, res) => {
  const { name, email, orderDetails } = req.body;
  const file = req.file;

  // Set up email with Nodemailer
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'your-email@gmail.com',  // Replace with your email address
      pass: 'your-email-password',    // Replace with your email password or app password
    },
  });

  const mailOptions = {
    from: 'your-email@gmail.com',
    to: 'recipient-email@gmail.com',  // Replace with your email address
    subject: `New Order from ${name}`,
    text: `
      Name: ${name}
      Email: ${email}
      Order Details: ${orderDetails}
    `,
    attachments: file ? [{
      filename: file.originalname,
      path: path.join(__dirname, file.path),
    }] : [],
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      return res.status(500).send('Error sending email');
    }
    console.log('Email sent: ' + info.response);
    res.json({ message: 'Order submitted successfully!' });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
