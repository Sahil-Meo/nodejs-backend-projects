import jwt from 'jsonwebtoken'

const fetchUser = (req, res, next) => {
     try {
          const token = req.header('auth-token');
          // console.log(token)
          if (!token) {
               return res.status(401).json({ error: 'No token, authorization denied' });
          }
          const decoded = jwt.verify(token, "sahil");
          // console.log(decoded);

          req.user = { id: decoded.user.id, role: decoded.role };
          next();
     } catch (err) {
          return res.status(401).json({ error: 'Token is not valid' });
     }
};

export default fetchUser;