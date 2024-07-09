import { PMDB } from "../dao/productManagerDB.js";
import { Router } from "express";
import { productModel } from "../dao/models/productModel.js";
import { CMDB } from "../dao/cartManagerDB.js";
import { cartModel } from "../dao/models/cartModel.js";
import { auth, authLogged } from "../middlewares/auth.js";

const router = Router();

router.get("/form", (req, res) => {
  res.render("form", { csrfToken: req.csrfToken() });
});

router.get("/realTimeProducts", auth, async (req, res) => {
  let { limit } = req.query;

  try {
    let products = await PMDB.getProducts();

    if (!limit) {
      res.status(200).render("realTimeProducts", {
        products: products,
        style: "styles.css",
      });

      return;
    }

    let productsLimited = products.slice(0, limit);

    res.status(200).render("realTimeProducts", {
      products: productsLimited,
      style: "styles.css",
    });
  } catch (error) {
    console.error(error.message);
  }
});

router.get("/products", auth, async (req, res) => {
  const { page } = req.query;

  try {
    const options = {
      page: page ? page : 1,
      limit: 10,
      lean: true,
    };

    const result = await productModel.paginate({}, options);

    if (!result) {
      return res.status(400).render("errorPage", {});
    }

    return res.status(200).render("products", {
      style: "styles.css",
      user: req.session.user,
      products: result.docs,
      previousPage: result.hasPrevPage ? result.prevPage : result.page,
      nextPage: result.hasNextPage ? result.nextPage : result.page,
    });
  } catch (error) {
    console.error(error.message);
  }
});

router.get("/carts/:cartid", auth, async (req, res) => {
  const cartId = req.params.cartid;

  try {
    const result = await cartModel
      .findOne({ _id: cartId })
      .populate("products.product")
      .lean();
    console.log(result.products);

    if (!result) {
      return res.status(400).render("errorPage", {});
    }

    return res.status(200).render("cart", {
      style: "styles.css",
      products: result.products,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).render("errorPage", {});
  }
});

router.get("/cookies", auth, (req, res) => {
  res.status(200).render("cookies", {
    style: "styles.css",
  });
});

router.get("/login", authLogged, (req, res) => {
  res.render("login", {
    style: "styles.css",
    failedLogin: req.session.failedLogin ?? false,
  });
});

router.get("/register", authLogged, (req, res) => {
  res.render("register", {
    style: "styles.css",
    failedRegister: req.session.failedRegister ?? false,
  });
});

router.get("/", (req, res) => {
  res.render("home", {
    style: "styles.css",
  });
});

router.get("/profile", auth, (req, res) => {
  res.render("profile", {
    style: "styles.css",
    user: req.session.user,
  });
});

export default router;
