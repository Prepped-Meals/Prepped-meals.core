import {
  Admin,
  Customer,
  Meal,
  Cart,
  Order,
  Payment,
  Feedback,
} from "../Models/index.js";

const seedDatabase = async () => {

  try {
    // Seed Admin
    let admin = await Admin.findOne();
    if (!admin) {
      admin = await Admin.create({
        admin_id: "A1",
        username: "admin",
        password: "admin123",
      });
      console.log("Admin Created");
    }

    // Seed Customer
    let customer = await Customer.findOne();
    if (!customer) {
      customer = await Customer.create({
        cus_id: "C1",
        username: "john_doe",
        f_name: "John",
        l_name: "Doe",
        email: "john@example.com",
        password: "123456",
        contact_no: "1234567890",
      });
      console.log("Customer Created");
    }

    // Seed Meal
    let meal = await Meal.findOne();
    if (!meal) {
      meal = await Meal.create({
        meal_id: "M1",
        meal_name: "Pizza",
        meal_description: "Cheese Pizza",
        meal_price: 10.99,
        calorie_count: 300,
        admin: admin._id,
      });
      console.log("Meal Created");
    }

        // Seed Cart
        let cart = await Cart.findOne();

if (!cart) {
    const customer = await Customer.findOne();
    const meal = await Meal.findOne();
    const payment = await Payment.findOne();

    if (!customer || !meal) {
        console.error("Cannot create cart: Missing customer or meal");
    } else {
        const quantity = 2;
        const meal_price = meal.meal_price;
        const total_price = quantity * meal_price;

        cart = await Cart.create({
            cart_id: "CART1",
            customer: customer._id,
            meals: [
                {
                    meal: meal._id,
                    meal_name: meal.meal_name,
                    meal_price: meal_price,
                    quantity: quantity,
                    total_price: total_price
                }
            ]
        });

        console.log(" Cart Created:", cart.cart_id);
    }

    // Seed Order
    // Seed Order
    if (!(await Order.findOne())) {
      await Order.create({
        order_id: "O1",
        customer: customer._id,
        payment: payment._id,
        cart_items: [
          {
            meal_id: meal._id,
            meal_name: meal.name,
            quantity: 2,
            meal_price: meal.price,
            total_price: meal.price * 2,
          },
        ],
        order_received_date: new Date(),
        order_status: "Pending",
      });
      console.log("Order Created");
    }

    // Seed Payment
    if (!(await Payment.findOne())) {
      // Seed Payment (CashOnDelivery)
      await Payment.create({
        payment_id: "P1",
        customer: customer._id,
        payment_amount: 50.0,
        payment_type: "CashOnDelivery",
        address: "123 Main Street, Ratnapura , SG",
        phone_number: "1234567890",
      });

      // Seed Payment (CardPayment)
      await Payment.create({
        payment_id: "P2",
        customer: customer._id,
        payment_amount: 100.0,
        payment_type: "CardPayment",
        address: "123 Main Street, Colombo, WP",
        phone_number: "0778282273",
        card_details: {
          cardholder_name: "John Doe",
          card_number: "4111111111111111",
          cvv: "123",
          exp_date: "12/26",
        },
      });
      console.log("Payment Created");
    }

    // Seed Feedback
    if (!(await Feedback.findOne())) {
      await Feedback.create({
        feedback_id: "F1",
        customer: customer._id,
        feedback_description: "Great food!",
      });
      console.log("Feedback Created");
    }
}

    console.log("Database Seeding Completed");
  } catch (error) {
    console.error("Database Seeding Error:", error);
  }

};


export default seedDatabase;
