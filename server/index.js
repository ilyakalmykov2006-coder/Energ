const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("./db");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

/* ===============================
   MULTER (загрузка изображений)
================================= */
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage });

app.use("/uploads", express.static(uploadDir));

/* ===============================
   REGISTER
================================= */
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userCheck = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: "Email уже зарегистрирован" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1,$2,$3) RETURNING id,name,email,is_admin",
      [name, email, hashedPassword]
    );

    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

/* ===============================
   LOGIN
================================= */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Пользователь не найден" });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ message: "Неверный пароль" });
    }

    const token = jwt.sign(
      { id: user.id, is_admin: user.is_admin },
      process.env.JWT_SECRET || "supersecretkey",
      { expiresIn: "30d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.is_admin ? "admin" : "user",
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

/* ===============================
   GET CATEGORIES
================================= */
app.get("/categories", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM categories ORDER BY id"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("CATEGORIES ERROR:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

/* ===============================
   GET ALL PRODUCTS (для каталога)
================================= */
app.get("/products", async (req, res) => {
  try {
    const productsRes = await pool.query(
      "SELECT * FROM products ORDER BY id DESC"
    );

    const products = [];

    for (const product of productsRes.rows) {
      const specsRes = await pool.query(
        "SELECT name, value FROM product_specs WHERE product_id=$1 ORDER BY id",
        [product.id]
      );

      const imagesRes = await pool.query(
        "SELECT id, path FROM product_images WHERE product_id=$1 ORDER BY id",
        [product.id]
      );

      products.push({
        ...product,
        specs: specsRes.rows,
        images: imagesRes.rows,
      });
    }

    res.json(products);
  } catch (err) {
    console.error("PRODUCTS ERROR:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

/* ===============================
   GET ONE PRODUCT (карточка)
================================= */
app.get("/product/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const productRes = await pool.query(
      "SELECT * FROM products WHERE id=$1",
      [id]
    );

    if (productRes.rows.length === 0) {
      return res.status(404).json({ message: "Продукт не найден" });
    }

    const specsRes = await pool.query(
      "SELECT name, value FROM product_specs WHERE product_id=$1 ORDER BY id",
      [id]
    );

    const imagesRes = await pool.query(
      "SELECT id, path FROM product_images WHERE product_id=$1 ORDER BY id",
      [id]
    );

    res.json({
      ...productRes.rows[0],
      specs: specsRes.rows,
      images: imagesRes.rows,
    });
  } catch (err) {
    console.error("PRODUCT ERROR:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

/* ===============================
   ADD PRODUCT (ADMIN)
================================= */
app.post("/admin/product", upload.array("images", 10), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Нет токена" });

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "supersecretkey"
    );

    const userRes = await pool.query(
      "SELECT * FROM users WHERE id=$1",
      [decoded.id]
    );

    if (!userRes.rows[0]?.is_admin) {
      return res.status(403).json({ message: "Нет доступа" });
    }

    const { name, description, category_id, specs } = req.body;

    const result = await pool.query(
      "INSERT INTO products (name, description, category_id) VALUES ($1,$2,$3) RETURNING id",
      [name, description, Number(category_id)]
    );

    const productId = result.rows[0].id;

    // характеристики
    if (specs) {
      const specsArray = JSON.parse(specs);
      for (const s of specsArray) {
        if (s.name && s.value) {
          await pool.query(
            "INSERT INTO product_specs (product_id, name, value) VALUES ($1,$2,$3)",
            [productId, s.name, s.value]
          );
        }
      }
    }

    // изображения
    if (req.files) {
      for (const file of req.files) {
        await pool.query(
          "INSERT INTO product_images (product_id, path) VALUES ($1,$2)",
          [productId, file.filename]
        );
      }
    }

    res.json({ message: "Товар добавлен", productId });
  } catch (err) {
    console.error("ADD PRODUCT ERROR:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

/* ===============================
   DELETE PRODUCT
================================= */
app.delete("/admin/product/:id", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Нет токена" });

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "supersecretkey"
    );

    const userRes = await pool.query(
      "SELECT * FROM users WHERE id=$1",
      [decoded.id]
    );

    if (!userRes.rows[0]?.is_admin) {
      return res.status(403).json({ message: "Нет доступа" });
    }

    const productId = Number(req.params.id);

    await pool.query("DELETE FROM product_specs WHERE product_id=$1", [productId]);
    await pool.query("DELETE FROM product_images WHERE product_id=$1", [productId]);
    await pool.query("DELETE FROM products WHERE id=$1", [productId]);

    res.json({ message: "Товар удален" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// ===== GET COMPARE LIST =====
/* ===============================
   GET COMPARE LIST
================================= */
app.get("/compare", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Нет токена" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const result = await pool.query(
      `SELECT p.*
       FROM user_comparison uc
       JOIN products p ON p.id = uc.product_id
       WHERE uc.user_id = $1`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("COMPARE GET ERROR:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

/* ===============================
   ADD TO COMPARE
================================= */
app.post("/compare/:productId", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Нет токена" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const productId = Number(req.params.productId);

    await pool.query(
      `INSERT INTO user_comparison (user_id, product_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, product_id) DO NOTHING`,
      [userId, productId]
    );

    res.json({ message: "Добавлено в сравнение" });
  } catch (err) {
    console.error("COMPARE ADD ERROR:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

/* ===============================
   REMOVE FROM COMPARE
================================= */
app.delete("/compare/:productId", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Нет токена" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const productId = Number(req.params.productId);

    await pool.query(
      "DELETE FROM user_comparison WHERE user_id=$1 AND product_id=$2",
      [userId, productId]
    );

    res.json({ message: "Удалено из сравнения" });
  } catch (err) {
    console.error("COMPARE REMOVE ERROR:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});