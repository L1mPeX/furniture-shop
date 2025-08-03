const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const PRODUCTS_FILE = path.join(__dirname, "data", "products.json");
const ORDERS_FILE = path.join(__dirname, "data", "orders.json");

// Чтение продуктов
function readProducts() {
  try {
    const data = fs.readFileSync(PRODUCTS_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Работа с корзиной
function getCart(req) {
  return req.cookies.cart ? JSON.parse(req.cookies.cart) : [];
}

function saveCart(res, cart) {
  res.cookie("cart", JSON.stringify(cart), {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });
}

// Просмотр корзины
exports.view = (req, res) => {
  const cart = getCart(req);
  const products = readProducts();

  const cartItems = cart.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    return {
      ...item,
      product,
      total: product ? product.price * item.quantity : 0,
    };
  });

  const total = cartItems.reduce((sum, item) => sum + item.total, 0);

  res.render("cart", {
    cartItems,
    total,
  });
};

// Подтверждение заказа
exports.confirm = (req, res) => {
  const cart = getCart(req);
  const products = readProducts();

  if (cart.length === 0) {
    return res.redirect("/cart");
  }

  const orderId = uuidv4();

  // Сохраняем заказ (если нужно)
  const order = {
    id: orderId,
    date: new Date().toISOString(),
    userId: req.session.user?.id || null,
    items: cart.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        productId: item.productId,
        name: product?.name || "Неизвестный товар",
        quantity: item.quantity,
        price: product?.price || 0,
      };
    }),
    total: cart.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId);
      return sum + (product?.price || 0) * item.quantity;
    }, 0),
  };

  saveOrder(order);

  // Очищаем корзину
  saveCart(res, []);

  // Перенаправляем на главную с ID заказа
  res.redirect("/?orderSuccess=" + orderId);
};

// Сохранение заказа
function saveOrder(order) {
  try {
    let orders = [];
    if (fs.existsSync(ORDERS_FILE)) {
      orders = JSON.parse(fs.readFileSync(ORDERS_FILE, "utf8"));
    }
    orders.push(order);
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
  } catch (err) {
    console.error("Ошибка сохранения заказа:", err);
  }
}

function getCart(req) {
  return req.cookies.cart ? JSON.parse(req.cookies.cart) : [];
}

function saveCart(res, cart) {
  res.cookie("cart", JSON.stringify(cart), {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });
}

exports.view = (req, res) => {
  const cart = getCart(req);
  const products = readProducts();

  const cartItems = cart
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        ...item,
        product,
        total: product ? product.price * item.quantity : 0,
      };
    })
    .filter((item) => item.product);

  const total = cartItems.reduce((sum, item) => sum + item.total, 0);

  res.render("cart", {
    cartItems,
    total,
  });
};

exports.add = (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const cart = getCart(req);
  const existingItem = cart.find((item) => item.productId === productId);

  if (existingItem) {
    existingItem.quantity += parseInt(quantity);
  } else {
    cart.push({ id: uuidv4(), productId, quantity: parseInt(quantity) });
  }

  saveCart(res, cart);
  res.redirect("/cart");
};

exports.remove = (req, res) => {
  const { itemId } = req.body;
  let cart = getCart(req);

  cart = cart.filter((item) => item.id !== itemId);
  saveCart(res, cart);

  res.redirect("/cart");
};

exports.update = (req, res) => {
  const { itemId, quantity } = req.body;
  const cart = getCart(req);
  const item = cart.find((item) => item.id === itemId);

  if (item) {
    item.quantity = parseInt(quantity);
    saveCart(res, cart);
  }

  res.redirect("/cart");
};

exports.clear = (req, res) => {
  saveCart(res, []);
  res.redirect("/cart");
};
