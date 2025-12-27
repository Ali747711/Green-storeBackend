import Order from "../models/order.js";
import Product from "../models/product.js";
import stripe from "stripe";
import User from "../models/user.js";
import Address from "../models/address.js";

// Place order COD: /api/order/cod
export const placeOrderCOD = async (req, res) => {
  try {
    const { userId, items, address } = req.body;
    console.log("userId: ", userId);
    console.log("Items: ", items);
    console.log("address", address);
    if (!address || items.length === 0) {
      return res.json({ success: false, message: "Invalid data" });
    }

    // Calculate Amount Using Items
    let amount = await items.reduce(async (acc, item) => {
      const product = await Product.findById(item.product); // NEED to check req coming from frontend to know about item.product
      return (await acc) + product.offerPrice * item.quantity;
    }, 0);

    // Add Tax Charge (2%)
    amount += Math.floor(amount * 0.02);

    await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "COD",
    });

    return res.json({ success: true, message: "Order Placed Successfully" });
  } catch (error) {
    res.json({
      success: true,
      message: `Error in placeOrderCOD API: ${error.message}`,
    });
    console.log(`Error in placeOrderCOD API: ${error.message}`);
  }
};

// Place order COD: /api/orders/stripe
export const placeOrderStripe = async (req, res) => {
  try {
    const { userId, items, address } = req.body;

    const { origin } = req.headers;

    if (!address || items.length === 0) {
      return res.json({ success: false, message: "Invalid data" });
    }

    let productData = [];

    // Calculate Amount Using Items
    let amount = await items.reduce(async (acc, item) => {
      const product = await Product.findById(item.product); // NEED to check req coming from frontend to know about item.product
      productData.push({
        name: product.name,
        price: product.offerPrice,
        quantity: item.quantity,
      });
      return (await acc) + product.offerPrice * item.quantity;
    }, 0);

    // Add Tax Charge (2%)
    amount += Math.floor(amount * 0.02);

    const order = await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "Online",
    });

    // Stripe gateway Initialize
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    // Create line items for stripe

    const line_items = productData.map((item) => {
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: Math.floor(item.price + item.price * 0.02) * 100,
        },
        quantity: item.quantity,
      };
    });

    // Create session

    const session = await stripeInstance.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${origin}/loader?next=my-orders`,
      cancel_url: `${origin}/cart`,
      metadata: {
        orderId: order._id.toString(),
        userId,
      },
    });

    return res.json({ success: true, url: session.url });
  } catch (error) {
    res.json({
      success: true,
      message: `Error in placeOrderCOD API: ${error.message}`,
    });
    console.log(`Error in placeOrderCOD API: ${error.message}`);
  }
};

// Stripe Webhook to verify Payments actions: /stripe

export const stripeWebhooks = async (req, res) => {
  // Stripe gateway Initialize
  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_KEY
    );
  } catch (error) {
    res.status(400).send(`Webhook Error: ${error.message}`);
  }

  // handle event

  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      // getting session Meta data

      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      const { orderId, userId } = session.data[0].metadata;

      // Mark payment as Paid

      await Order.findByIdAndUpdate(orderId, { isPaid: true });

      // Clear user cart
      await User.findByIdAndUpdate(userId, { cartItems: {} });
      break;
    }
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      // getting session Meta data

      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      const { orderId } = session.data[0].metadata;
      await Order.findByIdAndDelete(orderId);
      break;
    }

    default:
      console.error(`Unhandled event type ${event.type}`);
      break;
  }
  res.json({ received: true });
};

// Get Orders by User ID: /api/order/user

export const getUserOrders = async (req, res) => {
  try {
    const id = req.user.id;
    const orders = await Order.find({
      userId: id,
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.json({
      success: false,
      message: `Error in get user orders API: ${error.message}`,
    });
    console.log(`Error in get user orders API: ${error.message}`);
  }
};

// Get All Orders (for seller / admin): api/order/seller
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });
    // const orders = await Order.aggregate([{
    //     $match: {paymentType: 'COD'}
    // }, {
    //     $lookup: {
    //     from: 'addresses',         // The foreign collection to join (MongoDB automatically pluralizes model names, but here we use the exact collection name)
    //     localField: 'address',  // The field from the input documents (posts)
    //     foreignField: '_id',   // The field from the "from" collection (users) to match the localField against
    //     as: 'address'      // The name of the new array field to add to the input documents
    //     }
    // }])

    console.log("Orders: ", orders);
    res.json({ success: true, orders });
  } catch (error) {
    res.json({
      success: true,
      message: `Error in get user orders API: ${error.message}`,
    });
    console.log(`Error in get user orders API: ${error.message}`);
  }
};
// .populate("items.product address").sort({createdAt: -1})
