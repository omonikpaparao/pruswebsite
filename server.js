
const path=require("path");
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const nodemailer = require('nodemailer');
const { ObjectId } = require('mongodb');
const os = require("os");
// App setup
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // or wherever your HTML is

// MongoDB URI and client
const uri = "mongodb+srv://v647414:223344vinay@cluster0.lus5rot.mongodb.net/";

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'v647414@gmail.com',
    pass: 'lmct pwez mopo vfzv'
  }
});


// Connect to MongoDB and define routes inside
client.connect()
  .then(() => {
    console.log('✅ Connected to MongoDB');
    const db = client.db('ecommerce');
    

    // Home route
    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'index.html'));

    });
    app.get('/api/products', async (req, res) => {
  try {
    const raw = await db.collection('products').find({}).toArray();
    const products = raw.map(p => ({ ...p, _id: p._id.toString() }));
    res.json({ success: true, products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
});

    app.get('/api/products/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const product = await db.collection('products').findOne({ _id: new ObjectId(id) });
        if (!product) {
          return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, product });
      } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch product' });
      }
    });

    app.get('/products', async (req, res) => {
      res.sendFile(path.join(__dirname, 'products.html'));
    });

    app.get('/product/:id', async (req, res) => {
      res.sendFile(path.join(__dirname, 'product.html'));
    });
    app.get("/rec",(req,res)=>{
    res.sendFile(path.join(__dirname,"recommendation-demo.html"));
    });
    app.get("/loginpage",(req,res)=>{
        res.sendFile(path.join(__dirname, 'login.html'));
    });
    app.get("/about",(req,res)=>{
        res.sendFile(path.join(__dirname, 'about.html'));
    });
    app.get("/signuppage",(req,res)=>{
        res.sendFile(path.join(__dirname, 'signup.html'));
    });
    app.get("/cart",(req,res)=>{
        res.sendFile(path.join(__dirname, 'cart.html'));
    });
    app.get("/orders",(req,res)=>{
        res.sendFile(path.join(__dirname, 'orders.html'));
    });
    app.get("/cart",(req,res)=>{
        res.sendFile(path.join(__dirname, 'cart.html'));
    });
    
    app.get("/seller-dashboard",(req,res)=>{
        res.sendFile(path.join(__dirname, 'seller-dashboard.html'));
    });
    app.post("/verify", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).send("❌ All fields are required");
    }

    const usersCollection = db.collection('users');

    // Check if email already exists
    const existingUser = await usersCollection.findOne({ email });

    if (existingUser) {
      return res.status(409).send("⚠️ Email already registered. Please use a different email.");
    }

    // Insert new user
    await usersCollection.insertOne({ name, email, password });

    // Redirect to home page
    res.redirect('/');
    
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Error processing registration");
  }
});



    app.post('/login', async (req, res) => {
      try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
          return res.status(400).json({ success: false, message: "❌ Email and password are required" });
        }

        const usersCollection = db.collection('users');

        // Check if user exists with provided email and password
        const user = await usersCollection.findOne({ email, password });

        if (!user) {
          return res.status(401).json({ success: false, message: "❌ Invalid email or password" });
        }

        // Login successful
        res.status(200).json({ 
          success: true, 
          message: "✅ Login successful",
          user: { email: user.email, name: user.name }
        });
        
      } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "❌ Error processing login" });
      }
    });

    // Add to cart endpoint
    app.post('/add-to-cart', async (req, res) => {
  try {
    const { email, productId, productName, productImage, productPrice, sellerEmail,quantity } = req.body;

    const cartCollection = db.collection('cart');
    await cartCollection.insertOne({
      email,
      productId,
      productName,
      productImage,
      productPrice,
      quantity: quantity,
      sellerEmail // ✅ make sure this is included
    });

    res.json({ success: true, message: 'Added to cart!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error adding to cart' });
  }
});


    // Get cart items for a user
    app.get('/get-cart/:email', async (req, res) => {
      try {
        const { email } = req.params;
        const cartCollection = db.collection('cart');
        
        const cartItems = await cartCollection.find({ email }).toArray();
        const totalAmount = cartItems.reduce((sum, item) => {
          const price = parseFloat(item.productPrice) || 0;
          const quantity = parseInt(item.quantity) || 1;
          return sum + price * quantity;
        }, 0);

        
        res.status(200).json({
          success: true,
          cartItems,
          totalAmount: totalAmount.toFixed(2)
        });
      } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "❌ Error fetching cart items" });
      }
    });
    // Get products uploaded by a specific seller
app.get('/sellerproducts', async (req, res) => {
  const sellerEmail = req.query.email;

  if (!sellerEmail) {
    return res.status(400).json({ success: false, message: '❌ Seller email is required' });
  }

  try {
    const productsCollection = db.collection('products');
    const products = await productsCollection.find({ email: sellerEmail }).toArray();

    res.status(200).json({
      success: true,
      products
    });
  } catch (err) {
    console.error('Error fetching seller products:', err);
    res.status(500).json({ success: false, message: '❌ Error fetching seller products' });
  }
}); 


// DELETE product by _id
app.delete('/deleteproduct/:id', async (req, res) => {
  const productId = req.params.id;

  try {
    const result = await db.collection('products').deleteOne({ _id: new ObjectId(productId) });

    if (result.deletedCount === 1) {
      res.json({ message: 'Product deleted successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});
    // Delete item from cart
    app.delete('/remove-from-cart/:email/:productId', async (req, res) => {
      try {
        const { email, productId } = req.params;
        const cartCollection = db.collection('cart');
        
        // Decode the productId from URL
        const decodedProductId = decodeURIComponent(productId);
        
        console.log('Delete request received:', { 
          email, 
          originalProductId: productId, 
          decodedProductId: decodedProductId 
        });
        
        // First, let's check if the item exists
        const existingItem = await cartCollection.findOne({ email, productId: decodedProductId });
        console.log('Existing item found:', existingItem);
        
        if (!existingItem) {
          console.log('Item not found in cart');
          return res.status(404).json({ success: false, message: "❌ Item not found in cart" });
        }
        
        const result = await cartCollection.deleteOne({ email, productId: decodedProductId });
        
        console.log('Delete result:', result);
        
        if (result.deletedCount === 0) {
          return res.status(404).json({ success: false, message: "❌ Item not found in cart" });
        }
        
        console.log('Item successfully deleted');
        res.status(200).json({ 
          success: true, 
          message: "✅ Item removed from cart successfully" 
        });
        
      } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ success: false, message: "❌ Error removing item from cart" });
      }
    });

    // Process payment and create order
    app.post('/process-payment', async (req, res) => {
      try {
        const { email, paymentMode, totalAmount ,address, deliveryotp} = req.body;
        
        if (!email || !paymentMode || !totalAmount) {
          return res.status(400).json({ success: false, message: "❌ All payment details are required" });
        }

        const cartCollection = db.collection('cart');
        const ordersCollection = db.collection('orders');
        
        // Get cart items
        const cartItems = await cartCollection.find({ email }).toArray();
        
        if (cartItems.length === 0) {
          return res.status(400).json({ success: false, message: "❌ Cart is empty" });
        }

        // Create order
        const order = {
          email,
          items: cartItems,
          totalAmount: parseFloat(totalAmount),
          paymentMode,
          address:address,
          deliveryotp:deliveryotp,
          orderDate: new Date(),
          status: 'Confirmed',
          deliveryStatus: 'Processing'
        };

        const result = await ordersCollection.insertOne(order);
        const orderId = result.insertedId;
        
        // Create seller-specific order entries
        // Group cart items by seller
        const sellerItems = {};
        
        cartItems.forEach(item => {
          if (!sellerItems[item.sellerEmail]) {
            sellerItems[item.sellerEmail] = [];
          }
          sellerItems[item.sellerEmail].push(item);
        });
        
        // Create seller-specific order records
        const sellerOrderPromises = Object.keys(sellerItems).map(sellerEmail => {
          const sellerCartItems = sellerItems[sellerEmail];
          const sellerTotalAmount = sellerCartItems.reduce((sum, item) => {
            const price = parseFloat(item.productPrice) || 0;
            const quantity = parseInt(item.quantity) || 1;
            return sum + price * quantity;
          }, 0);
          
          // Create seller-specific order entry
          const sellerOrder = {
            orderId: orderId,
            userEmail: email,
            sellerEmail: sellerEmail,
            items: sellerCartItems,
            totalAmount: sellerTotalAmount,
            paymentMode,
            address,
            deliveryotp,
            orderDate: new Date(),
            status: 'Confirmed',
            deliveryStatus: 'Processing'
          };
          
          return ordersCollection.insertOne(sellerOrder);
        });
        
        // Wait for all seller order entries to be created
        await Promise.all(sellerOrderPromises);


        // Clear cart
        await cartCollection.deleteMany({ email });
        var picpath="https://res.cloudinary.com/dg8c2ki0u/image/upload/v1754297638/emkf1fa9jz2yvgnesnu4.jpg";
        // Send email notifications
        const mailOptions = {
          from: 'v647414@gmail.com',
          to: [email, 'v647414@gmail.com'],
          subject: 'Order Confirmed - DeLux Mart',
          html: `
            <img src="${picpath}" alt="Logo" />
            <h2>🎉 Order Confirmed!</h2>
            <p>Dear Customer,</p>
            <p>Your order has been successfully placed with DeLux Mart.</p>
            <h3>Order Details:</h3>
            <ul>
              <li><strong>Order-ID: </strong>${orderId}</li>
              <li><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</li>
              <li><strong>Payment Mode:</strong> ${paymentMode}</li>
              <li><strong>Total Amount:</strong> $${totalAmount}</li>
              <li><strong>Delivery OTP is:</strong>${deliveryotp}</li>
              <li><strong>Status:</strong> Confirmed</li>
            </ul>
            <h3>Items Ordered:</h3>
            <ul>
              ${cartItems.map(item => `<li>${item.productName} - $${item.productPrice}</li>`).join('')}
            </ul>
            <p>Thank you for shopping with DeLux Mart!</p>
            <p>Best regards,<br>DeLux Mart Team</p>
          `
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Email error:', error);
          } else {
            console.log('Email sent:', info.response);
          }
        });

        res.status(200).json({
          success: true,
          message: "✅ Order placed successfully! Check your email for confirmation."
        });
        
      } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "❌ Error processing payment" });
      }
    });

    // Get orders for a user
    app.get('/get-orders/:email', async (req, res) => {
      try {
        const { email } = req.params;
        const ordersCollection = db.collection('orders');
        
        // Get main orders (those with items array)
        const mainOrders = await ordersCollection.find({ 
          email: email,
          items: { $exists: true }
        }).sort({ orderDate: -1 }).toArray();
        
        // For each main order, get all related seller orders to check their status
        const ordersWithSellerInfo = await Promise.all(mainOrders.map(async (order) => {
          // Get all seller-specific orders for this main order
          const sellerOrders = await ordersCollection.find({
            orderId: order._id
          }).toArray();
          
          // Check if any items are marked as cancelled directly
          const hasDirectlyCancelledItems = order.items.some(item => item.cancelled === true);
          
          // Add seller order information to the main order
          return {
            ...order,
            sellerOrders: sellerOrders,
            // If any seller has cancelled or any item is directly marked as cancelled
            hasCancellations: sellerOrders.some(sellerOrder => sellerOrder.deliveryStatus === 'Cancelled') || hasDirectlyCancelledItems,
            // Count how many sellers are involved
            totalSellers: sellerOrders.length,
            // Count how many sellers have cancelled
            cancelledSellers: sellerOrders.filter(sellerOrder => sellerOrder.deliveryStatus === 'Cancelled').length
          };
        }));
        
        res.status(200).json({
          success: true,
          orders: ordersWithSellerInfo
        });
      } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "❌ Error fetching orders" });
      }
    });
    app.get("/seller-login",(req,res)=>{
      res.sendFile(path.join(__dirname, 'seller-login.html'));
    });
    //app.get("/sellerproducts",(req,res)=>{})
    // Seller login endpoint
    app.post('/seller-login', async (req, res) => {
      try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
          return res.status(400).json({ success: false, message: "❌ Email and password are required" });
        }

        // Check if it's the admin/seller account
        const sellersCollection = db.collection('sellers');
        console.log(email);
         const seller = await sellersCollection.findOne({ email, password });
          if (!seller) {
          return res.status(401).json({ success: false, message: "❌ Invalid seller credentials" });
        }
        
          res.status(200).json({ 
            success: true, 
            message: "✅ Seller login successful",
            user: { email: email, name: 'Seller' }
          });
        
        
      } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "❌ Error processing seller login" });
      }
    });
    app.post('/seller/upload-product', async (req, res) => {
  try {
    const { name, image, email, price, cat, desc } = req.body;

    if (!name || !image || !email || !price) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const newProduct = {
      name: name,
      image,
      email,
      price: parseFloat(price),
      category: cat || '',       // correctly stored
      description: desc || '',  // correctly stored
      uploadedAt: new Date()
    };

    const productCollection = db.collection('products');
    await productCollection.insertOne(newProduct);

    res.json({ success: true, message: 'Product uploaded successfully' });
  } catch (error) {
    console.error('Upload product error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

//     app.post('/seller/upload-product', async (req, res) => {
//       try {
//     const {  image, email, price, cat, desc } = req.body;
//     console.log(cat,desc);
//     const name=req.body.name+"jii";

//     if (!name || !image || !email || !price) {
//       return res.status(400).json({ success: false, message: 'Missing required fields' });
//     }

//     const newProduct = {
//       name,
//       image,
//       email,
//       price: parseFloat(price),
//       category: cat || '',
//       description: desc || '',
//       uploadedAt: new Date()
//     };

//     console.log('Uploading product:', newProduct);

//     const cartCollection = db.collection('products');
//     await cartCollection.insertOne(newProduct);

//     res.json({ success: true });
//   } catch (error) {
//     console.error('Upload product error:', error.message);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// });




    // Get all orders for seller
    app.get('/seller/orders', async (req, res) => {
      const sellerEmail = req.query.sellerEmail;

  if (!sellerEmail) {
    return res.status(400).json({ success: false, message: '❌ Seller email missing' });
  }
try {
  const ordersCollection=db.collection("orders");
    // Find orders where sellerEmail matches the requested seller
    const orders = await ordersCollection.find({
      sellerEmail: sellerEmail
    })
    .sort({ orderDate: -1 })
    .toArray();

    res.json({ success: true, orders });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ success: false, message: '❌ Server error' });
  }
});

    // Update order status (seller accepting orders)
    /*app.put('/seller/update-order/:orderId', async (req, res) => {
      try {
        const { orderId } = req.params;
        const { status } = req.body;
        
        const ordersCollection = db.collection('orders');
        
        const result = await ordersCollection.updateOne(
          { _id: new require('mongodb').ObjectId(orderId) },
          { $set: { deliveryStatus: status } }
        );
        
        if (result.modifiedCount === 0) {
          return res.status(404).json({ success: false, message: "❌ Order not found" });
        }
        
        res.status(200).json({ 
          success: true, 
          message: "✅ Order status updated successfully" 
        });
        
      } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "❌ Error updating order status" });
      }
    });*/
    // Update order status
app.get("/sellersignup",(req,res)=>
{
  res.sendFile(path.join(__dirname, 'sellerinsert.html'));
});
app.post("/sellerverify",async (req,res)=>{
try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).send("❌ All fields are required");
    }

    const usersCollection = db.collection('sellers');

    // Check if email already exists
    const existingUser = await usersCollection.findOne({ email });

    if (existingUser) {
      return res.status(409).send("⚠️ Email already registered. Please use a different email.");
    }

    // Insert new user
    await usersCollection.insertOne({ name, email, password });

    // Redirect to home page
    res.redirect('/');
    
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Error processing registration");
  }

});
app.put('/seller/update-order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const sellerEmail = req.query.sellerEmail || req.body.sellerEmail;
    const ordersCollection = db.collection('orders');
    
    console.log('Update order request:', { orderId, status, sellerEmail });

    if (!sellerEmail) {
      return res.status(400).json({ success: false, message: '❌ Seller email is required' });
    }

    // Find the seller-specific order first to get details before updating
    const sellerOrder = await ordersCollection.findOne({
      _id: new ObjectId(orderId),
      sellerEmail: sellerEmail
    });
    
    if (!sellerOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    console.log('Found seller order before update:', sellerOrder);
    
    // Update the seller-specific order
    const result = await ordersCollection.updateOne(
      { 
        _id: new ObjectId(orderId),
        sellerEmail: sellerEmail
      },
      { $set: { deliveryStatus: status } }
    );
    
    console.log('Update result:', result);

    // Handle special case for cancellation
    if (status === 'Cancelled') {
      try {
        // Get the main order to update its items and total amount
        const mainOrder = await ordersCollection.findOne({
          _id: sellerOrder.orderId
        });
        
        if (mainOrder) {
          console.log('Found main order for cancellation update:', mainOrder._id);
          
          // Calculate the amount to subtract from the main order
          const cancelledAmount = sellerOrder.totalAmount;
          
          // Mark the items as cancelled in the main order instead of removing them
          // This way they still appear in the order history but are marked as cancelled
          const updatedItems = mainOrder.items.map(item => {
            if (item.sellerEmail === sellerEmail) {
              return {
                ...item,
                cancelled: true
              };
            }
            return item;
          });
          
          // Calculate new total amount (only include non-cancelled items)
          const newTotalAmount = updatedItems
            .filter(item => item.cancelled !== true)
            .reduce((sum, item) => {
              const price = parseFloat(item.productPrice) || 0;
              const quantity = parseInt(item.quantity) || 1;
              return sum + (price * quantity);
            }, 0);
          
          // Check if all items in the order are now cancelled
          const allItemsCancelled = updatedItems.every(item => item.cancelled === true);
          
          // Update object for the main order
          const updateObj = { 
            items: updatedItems,
            totalAmount: newTotalAmount > 0 ? newTotalAmount : 0
          };
          
          // If all items are cancelled, update the main order status to Cancelled
          if (allItemsCancelled) {
            updateObj.deliveryStatus = 'Cancelled';
            console.log('All items cancelled, updating main order status to Cancelled');
          }
          
          // Update the main order with the updated items and total
          const mainOrderUpdateResult = await ordersCollection.updateOne(
            { _id: sellerOrder.orderId },
            { $set: updateObj }
          );
          
          console.log('Main order partial cancellation update result:', mainOrderUpdateResult);
        }
      } catch (error) {
        console.error('Error updating main order for cancellation:', error);
      }
    } 
    // For non-cancellation status updates
    else if (status === 'Delivered' || status === 'Accepted') {
      try {
        if (sellerOrder && sellerOrder.orderId) {
          // Get the main order to update its items with the new status
          const mainOrder = await ordersCollection.findOne({
            _id: sellerOrder.orderId
          });
          
          if (mainOrder) {
            console.log('Found main order for status update:', mainOrder._id);
            
            // Update the items in the main order to reflect the new status for this seller's items
            const updatedItems = mainOrder.items.map(item => {
              if (item.sellerEmail === sellerEmail) {
                return {
                  ...item,
                  status: status // Add status to each item
                };
              }
              return item;
            });
            
            // Update the main order with the updated items
            await ordersCollection.updateOne(
              { _id: sellerOrder.orderId },
              { $set: { items: updatedItems } }
            );
            
            // For non-cancellation updates, we need to check if all seller orders have the same status
            // to update the main order status accordingly
            
            // Get all seller orders for this main order
            const allSellerOrders = await ordersCollection.find({
              orderId: sellerOrder.orderId
            }).toArray();
            
            // Check if all seller orders have the same status
            const allSameStatus = allSellerOrders.every(order => order.deliveryStatus === status);
            
            if (allSameStatus) {
              // If all seller orders have the same status, update the main order
              console.log('All seller orders have status:', status, 'Updating main order');
              
              const mainOrderResult = await ordersCollection.updateOne(
                { _id: sellerOrder.orderId },
                { $set: { deliveryStatus: status } }
              );
              
              console.log('Main order update result:', mainOrderResult);
            } else {
              console.log('Not all seller orders have the same status. Main order status not updated.');
            }
          }
        }
      } catch (error) {
        console.error('Error updating main order:', error);
      }
    }

    if (result.modifiedCount > 0) {
      res.json({ success: true, message: 'Order status updated.' });
    } else {
      res.json({ success: false, message: 'Order not found or already updated.' });
    }
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});



    // Verify delivery OTP and mark order as delivered
    app.post('/seller/verify-delivery-otp/:orderId', async (req, res) => {
      try {
        const { orderId } = req.params;
        const { otp, sellerEmail } = req.body;
        
        if (!orderId || !otp || !sellerEmail) {
          return res.status(400).json({ success: false, message: '❌ Missing required information' });
        }
        
        const ordersCollection = db.collection('orders');
        
        // Find the seller-specific order
        const sellerOrder = await ordersCollection.findOne({
          _id: new ObjectId(orderId),
          sellerEmail: sellerEmail
        });
        
        if (!sellerOrder) {
          return res.status(404).json({ success: false, message: '❌ Order not found' });
        }
        
        // Find the main order to get the OTP
        const mainOrder = await ordersCollection.findOne({
          _id: sellerOrder.orderId
        });
        
        if (!mainOrder) {
          return res.status(404).json({ success: false, message: '❌ Main order not found' });
        }
        
        // Verify the OTP
        if (mainOrder.deliveryotp != otp) {
          return res.status(400).json({ success: false, message: '❌ Invalid OTP. Please try again.' });
        }
        
        // Update the seller order status to Delivered
        await ordersCollection.updateOne(
          { _id: new ObjectId(orderId) },
          { $set: { deliveryStatus: 'Delivered' } }
        );
        
        // Update the items in the main order to reflect the new status for this seller's items
        const updatedItems = mainOrder.items.map(item => {
          if (item.sellerEmail === sellerEmail) {
            return {
              ...item,
              status: 'Delivered'
            };
          }
          return item;
        });
        
        // Update the main order with the updated items
        await ordersCollection.updateOne(
          { _id: sellerOrder.orderId },
          { $set: { items: updatedItems } }
        );
        
        // Check if all seller orders are now delivered
        const allSellerOrders = await ordersCollection.find({
          orderId: sellerOrder.orderId
        }).toArray();
        
        const allDelivered = allSellerOrders.every(order => order.deliveryStatus === 'Delivered');
        
        if (allDelivered) {
          // If all seller orders are delivered, update the main order status
          await ordersCollection.updateOne(
            { _id: sellerOrder.orderId },
            { $set: { deliveryStatus: 'Delivered' } }
          );
        }
        
        res.status(200).json({
          success: true,
          message: '✅ OTP verified successfully. Order marked as delivered.'
        });
        
      } catch (error) {
        console.error('Error verifying delivery OTP:', error);
        res.status(500).json({ success: false, message: '❌ Server error' });
      }
    });
    
    // Add product rating
    app.post('/add-rating', async (req, res) => {
      try {
        const { email, productId, productName, rating, review } = req.body;

        if (!email || !productId || !productName || !rating) {
          return res.status(400).json({ success: false, message: "❌ All rating details are required" });
        }

        const ratingsCollection = db.collection('ratings');
        
        // Check if user already rated this product
        const existingRating = await ratingsCollection.findOne({ email, productId });
        
        if (existingRating) {
          // Update existing rating
          await ratingsCollection.updateOne(
            { email, productId },
            { $set: { rating, review, updatedAt: new Date() } }
          );
        } else {
          // Add new rating
          await ratingsCollection.insertOne({
            email,
            productId,
            productName,
            rating: parseFloat(rating),
            review: review || '',
            createdAt: new Date()
          });
        }

        res.status(200).json({ 
          success: true, 
          message: "✅ Rating added successfully" 
        });
        
      } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "❌ Error adding rating" });
      }
    });
    app.get("/sellerproducts",(req,res)=>
    {
      
    
    });
    // Get product ratings
    app.get('/get-ratings/:productId', async (req, res) => {
      try {
        const { productId } = req.params;
        const ratingsCollection = db.collection('ratings');
        
        const ratings = await ratingsCollection.find({ productId }).sort({ createdAt: -1 }).toArray();
        
        const averageRating = ratings.length > 0 
          ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
          : 0;
        
        res.status(200).json({
          success: true,
          ratings,
          averageRating
        });
      } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "❌ Error fetching ratings" });
      }
    });

    app.post('/add-comment', async (req, res) => {
      try {
        const { email, productId, comment } = req.body;
        if (!email || !productId || !comment) {
          return res.status(400).json({ success: false, message: '❌ All comment details are required' });
        }
        const commentsCollection = db.collection('comments');
        await commentsCollection.insertOne({ email, productId, comment, createdAt: new Date() });
        res.status(200).json({ success: true, message: '✅ Comment added successfully' });
      } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: '❌ Error adding comment' });
      }
    });

    app.get('/get-comments/:productId', async (req, res) => {
      try {
        const { productId } = req.params;
        const commentsCollection = db.collection('comments');
        const comments = await commentsCollection.find({ productId }).sort({ createdAt: -1 }).toArray();
        res.status(200).json({ success: true, comments });
      } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: '❌ Error fetching comments' });
      }
    });

    // app.listen(PORT, () => {
    //   console.log(`🚀 Server running on http://localhost:${PORT}`);
    // });
    app.listen(PORT, '0.0.0.0', () => {
  // find your local network IP
  const nets = os.networkInterfaces();
  let networkIP = "Unknown";

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) {
        networkIP = net.address;
      }
    }
  }

  console.log(`🚀 Server running:`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Network: http://${networkIP}:${PORT}`);
});
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
  });
