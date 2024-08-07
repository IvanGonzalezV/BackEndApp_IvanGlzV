import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github";
import jwt from "jwt-simple";
import userModel from "../dao/models/userModel.js";
import express from "express";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import csurf from "csurf";
import dotenv from "dotenv";
import config from "../../src/config/config.js";
import upload from "../middlewares/multerConfig.js";

const GITHUB_CLIENT_ID = config.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = config.GITHUB_CLIENT_SECRET;
const JWT_SECRET = config.JWT_SECRET;
const DB_USERNAME = config.DB_USERNAME;
const DB_PASSWORD = config.DB_PASSWORD;
const router = express.Router();

const csrfProteccion = csurf({ cookie: true });
router.use(csrfProteccion);

function generateToken(user) {
  const payload = { userId: user.id };
  const token = jwt.encode(payload, JWT_SECRET);
  return token;
}

export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; // asumira que el token se envia dentro del encabezado de autorizacion como 'Bearer {token}'

    await BlacklistedToken.create({ token });

    const decoded = jwt.decode(token, JWT_SECRET);
    const user = await userModel.findById(decoded.userId);
    if (user) {
      user.last_connection = new Date();
      await user.save();
    }

    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    res.status(500).json({ error: "Error al Cerrar Sesion" });
  }
};

passport.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:8080/auth/github/callback",
    },
    async function (accessToken, refreshToken, profile, cb) {
      try {
        let user = await userModel.findOne({ githubId: profile.id });
        if (!user) {
          user = await userModel.create({
            githubId: profile.id,
            username: profile.username,
            accessToken: accessToken,
          });
        } else {
          user.accessToken = accessToken; // actualiza el token de acceso
          await user.save();
        }

        user.last_connection = new Date();
        await user.save();

        const token = generateToken(user);
        user.jwt = token;
        await user.save();

        res.cookie("jwt", token, {
          httpOnly: true, // aqui config cookie para que se accese solo a traves de https, no mediante JScript
          secure: true, // esta config la cookie para que solo se envie a traves de https  //false en caso de que el site no sea https
          samesite: "strict", // esta config la cookie para que unicamente se envie a traves del mismo sitio
        });

        cb(null, user);
      } catch (err) {
        cb(err);
      }
    }
  )
);

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET,
};

passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      const user = await userModel.findById(jwt_payload.userId);
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (err) {
      return done(err, false);
    }
  })
);

passport.serializeUser(function (user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(async function (id, cb) {
  try {
    const user = await userModel.findById(id);
    cb(null, user);
  } catch (err) {
    cb(err);
  }
});

export const auth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  return next();
};

export const authLogged = (req, res, next) => {
  if (req.session.user) {
    return res.redirect("/profile");
  }
  return next();
};

export const authorize = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  try {
    const decoded = jwt.decode(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido" });
  }
};

const validRoles = ["admin", "user", "guest"];

router.post("/logout", logout);

export const requireRole = (role) => (req, res, next) => {
  if (req.user.role !== role) {
    return res.status(403).json({ error: "Permiso denegado" });
  }
  next();
};

router.get("/change-role/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).send("Usuario no encontrado");
    }

    if (
      user.role === "user" &&
      (!user.documents || user.documents.length === 0)
    ) {
      return res
        .status(400)
        .send(
          "El usuario debe subir los documentos requeridos para cambiar a premium"
        );
    }

    user.role = user.role === "user" ? "premium" : "user";
    await user.save();

    res.status(200).send(`El rol del usuario ha sido cambiado a ${user.role}`);
  } catch (error) {
    res.status(500).send("Error al cambiar el rol del usuario");
  }
});

// endpoint file upload
router.post(
  "/upload-documents",
  authorize,
  upload.array("documents", 3),
  async (req, res) => {
    try {
      const userId = req.user.userId;
      const user = await userModel.findById(userId);

      if (!user) {
        return res.status(404).send("Usuario no encontrado");
      }

      const documents = req.files.map((file) => ({
        name: file.fieldname,
        reference: file.path,
      }));

      user.documents = user.documents.concat(documents);

      // valida que el usuario subio los files requeridos
      const requiredDocuments = [
        "id",
        "comprobante de domicilio",
        "estado de cuenta",
      ];
      const uploadedDocuments = user.documents.map((doc) => doc.name);

      if (requiredDocuments.every((doc) => uploadedDocuments.includes(doc))) {
        user.role = "premium";
      }

      await user.save();

      res.status(200).send("Documentos subidos exitosamente");
    } catch (error) {
      res.status(500).send("Error al subir documentos");
    }
  }
);

export default passport;
