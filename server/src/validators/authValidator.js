// "Is the input valid?"

export const validateRegister = (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required",
    });
  }

  if (username.length < 3) {
    return res.status(400).json({
      message: "Username must be at least 3 characters",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: "Password must be at least 6 characters",
    });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required",
    });
  }

  next();
};
