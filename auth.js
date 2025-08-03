const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const USERS_FILE = path.join(__dirname, "data", "users.txt");

function readUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, "utf8");
    return data
      .split("\n")
      .filter((line) => line)
      .map((line) => JSON.parse(line));
  } catch (err) {
    return [];
  }
}

function writeUsers(users) {
  const data = users.map((user) => JSON.stringify(user)).join("\n");
  fs.writeFileSync(USERS_FILE, data);
}

exports.loginForm = (req, res) => {
  res.render("login", { error: null });
};

exports.login = (req, res) => {
  const { username, password } = req.body;
  const users = readUsers();
  const user = users.find((u) => u.username === username);

  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.user = { id: user.id, username: user.username };
    res.redirect("/");
  } else {
    res.render("login", { error: "Неверное имя пользователя или пароль" });
  }
};

exports.registerForm = (req, res) => {
  res.render("register", { error: null });
};

exports.register = (req, res) => {
  const { username, password, confirmPassword } = req.body;
  const users = readUsers();

  if (password !== confirmPassword) {
    return res.render("register", { error: "Пароли не совпадают" });
  }

  if (users.some((u) => u.username === username)) {
    return res.render("register", { error: "Пользователь уже существует" });
  }

  const hashedPassword = bcrypt.hashSync(password, 8);
  const newUser = {
    id: uuidv4(),
    username,
    password: hashedPassword,
  };

  users.push(newUser);
  writeUsers(users);

  req.session.user = { id: newUser.id, username: newUser.username };
  res.redirect("/");
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect("/");
};
