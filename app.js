const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const session = require("express-session");
const fs = require("fs");
const auth = require("./auth");
const cart = require("./cart");

const app = express();

// Настройки
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(
  "/css",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/css"))
);
app.use(
  "/js",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/js"))
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// Делаем user доступным во всех шаблонах
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

// Вспомогательные функции
function getProducts() {
  const productsPath = path.join(__dirname, "data", "products.json");
  return JSON.parse(fs.readFileSync(productsPath, "utf8"));
}

function getCategories() {
  const products = getProducts();
  return [...new Set(products.map((p) => p.category))];
}

// Маршруты
app.get("/", (req, res) => {
  res.render("index", {
    popularProducts: getProducts().slice(0, 4),
    categories: getCategories(),
    orderSuccess: req.query.orderSuccess,
  });
});

app.get("/catalog", (req, res, next) => {
  try {
    const products = getProducts();
    const category = req.query.category;
    const filteredProducts = category
      ? products.filter((p) => p.category === category)
      : products;

    res.render("catalog", {
      products: filteredProducts,
      currentCategory: category,
      categories: getCategories(),
    });
  } catch (err) {
    next(err);
  }
});

app.get("/product/:id", (req, res, next) => {
  try {
    const product = getProducts().find((p) => p.id === req.params.id);
    if (!product) {
      return res.status(404).render("error", {
        message: "Товар не найден",
      });
    }
    res.render("product", { product });
  } catch (err) {
    next(err);
  }
});

app.get("/sales", (req, res, next) => {
  try {
    res.render("sales");
  } catch (err) {
    next(err);
  }
});

app.get("/contacts", (req, res, next) => {
  try {
    res.render("contacts");
  } catch (err) {
    next(err);
  }
});

app.get("/delivery", (req, res, next) => {
  try {
    res.render("delivery");
  } catch (err) {
    next(err);
  }
});

app.get("/history", (req, res, next) => {
  try {
    res.render("history");
  } catch (err) {
    next(err);
  }
});

app.get("/staff", (req, res, next) => {
  try {
    res.render("staff");
  } catch (err) {
    next(err);
  }
});

// Обработка оплаты
app.post("/process-payment", (req, res, next) => {
  try {
    res.redirect("/");
  } catch (err) {
    next(err);
  }
});

app.get("/payment/success", (req, res, next) => {
  try {
    res.render("payment-success");
  } catch (err) {
    next(err);
  }
});

// Специальный роут для ошибок оплаты
app.get("/payment/error", (req, res, next) => {
  try {
    res.status(400).render("error", {
      message:
        "Произошла ошибка при обработке платежа. Пожалуйста, попробуйте еще раз или свяжитесь с поддержкой.",
    });
  } catch (err) {
    next(err);
  }
});

app.get("/privacy-policy", (req, res) => {
  res.render("privacy-policy");
});

// Авторизация
app.get("/login", auth.loginForm);
app.post("/login", auth.login);
app.get("/register", auth.registerForm);
app.post("/register", auth.register);
app.get("/logout", auth.logout);

// Корзина
app.get("/cart", cart.view);
app.post("/cart/add", cart.add);
app.post("/cart/remove", cart.remove);
app.post("/cart/update", cart.update);
app.get("/cart/clear", cart.clear);
app.post("/cart/confirm", cart.confirm);

// Обработка ошибок
app.use((req, res) => {
  res.status(404).render("error", {
    message: "Страница не найдена",
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
