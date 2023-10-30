import bcrypt from "bcryptjs";

const validateUserInput = (username, password) => {
  return username && password;
};
const comparePassword = (password, hashedPassword) => {
  return bcrypt.compareSync(password, hashedPassword);
};

export { validateUserInput, comparePassword };
