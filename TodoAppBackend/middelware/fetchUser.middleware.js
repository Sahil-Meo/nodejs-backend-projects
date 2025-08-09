import jwt from 'jsonwebtoken'

const fetchUser = (req, res, next) => {
     const token = req.header('auth-token');
     // console.log(token)
     if (!token) {
          return res.status(401).json({ error: 'No token, authorization denied' });
     }

     try {
          const data = jwt.verify(token, "sahil");
          req.user = data.user;
          next();
     } catch (err) {
          return res.status(401).json({ error: 'Token is not valid' });
     }
};

export default fetchUser;