const { BadRequestError, UnauthenticatedError } = require("../errors");
const UserModel = require("../models/user.model");
const { StatusCodes } = require("http-status-codes");

const register = async (req, res) => {
  const user = await UserModel.create({ ...req.body });
  const token = user.createJWT();
  res.status(StatusCodes.CREATED).json({ token });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }

  const user = await UserModel.findOne({ email });
  const isPasswordCorrect = await user.comparePassword(password);

  if (!user || !isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid Credentials");
  }

  const token = user.createJWT();

  res.status(StatusCodes.OK).json({ token });
};

module.exports = { register, login };
