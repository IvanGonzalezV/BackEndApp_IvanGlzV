import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github';
import jwt from 'jwt-simple';
import userModel from '../dao/models/userModel.js';
import express from 'express';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import csurf from 'csurf';
import dotenv from 'dotenv';
import config from '../config.js';

const GITHUB_CLIENT_ID = config.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = config.GITHUB_CLIENT_SECRET;
const JWT_SECRET = config.JWT_SECRET;
const DB_USERNAME = config.DB_USERNAME;
const DB_PASSWORD = config.DB_PASSWORD;
const router = express.Router();

const csrfProteccion = csurf({ cookie: true});
router.use(csrfProteccion);

function generateToken(user) {
  const payload = { userId: user.id };
  const token = jwt.encode(payload, JWT_SECRET);
  return token;
}

export const logout = async (req, res) => {

  try {

    const token = req.headers.authorization.split(' ')[1]; // Asume que el token se enviara en el encabezado de autorizacion como 'Bearer {token}'

    await BlacklistedToken.create({ token });

    res.status(200).json({ message: 'Logout successful' });
}   catch (err) {
    res.status(500).json({ error: 'Error al Cerrar Sesion'})
  }
}

passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:8080/auth/github/callback"
  },
  async function(accessToken, refreshToken, profile, cb) {
    try {
      let user = await userModel.findOne({ githubId: profile.id });
      if (!user) {
        user = await userModel.create({ githubId: profile.id, username: profile.username, accessToken: accessToken });
      } else {
        user.accessToken = accessToken; // Actualiza el token de acceso
        await user.save();
      }
      
      const token = generateToken(user);
      user.jwt = token;
      await user.save();

      res.cookie('jwt', token, {
        httpOnly: true,     // aqui config cookie para que se accese solo a traves de https, no mediante JScript
        secure: true,       // esta config la cookie para que solo se envie a traves de https  //false en caso de que el site no sea https
        samesite: 'strict'  // esta config la cookie para que unicamente se envie a traves del mismo sitio
      })

      cb(null, user);
    } catch (err) {
      cb(err);
    }
  }
));

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET
};

passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
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
}));

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(async function(id, cb) {
  try {
    const user = await userModel.findById(id);
    cb(null, user);
  } catch (err) {
    cb(err);
  }
});

export const auth = (req, res, next) => {
  if(!req.session.user){
    return res.redirect("/login")
  }
  return next()
}

export const authLogged = (req, res, next) => {
  if(req.session.user){
    return res.redirect("/profile")
  }
  return next()
}

export const authorize = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.decode(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

const validRoles = ['admin', 'user', 'guest'];

router.post('/logout', logout);

export const requireRole = role => (req, res, next) => {
  if (req.user.role !== role) {
    return res.status(403).json({ error: 'Permiso denegado' });
  }
  next();
}

export default passport;