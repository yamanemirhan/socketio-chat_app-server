const sendJwtToClient = (user, res) => {
  const token = user.generateJwtFromUser();
  const { JWT_COOKIE } = process.env;
  const { password, ...userData } = user._doc;

  return res
    .status(200)
    .cookie("accessToken", token, {
      sameSite: "none",
      secure: true,
      httpOnly: true,
      expires: new Date(Date.now() + parseInt(JWT_COOKIE) * 1000),
    })
    .json({
      success: true,
      data: userData,
      message: "Successfully login",
    });
};

const getAccessTokenFromHeader = (req) => {
  return req.headers["authorization"];
};

export { sendJwtToClient, getAccessTokenFromHeader };
