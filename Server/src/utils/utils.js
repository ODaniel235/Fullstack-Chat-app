import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const signToken = async (id, email, res) => {
  const refreshToken = jwt.sign(
    {
      id: id,
      email: email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
  const accessToken = jwt.sign({ id, email: email }, process.env.JWT_SECRET, {
    expiresIn: 60 * 1000,
  });
  res.cookie("RefreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "Lax",
    /*     secure: "true", */
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.cookie("AccessToken", accessToken, {
    httpOnly: true,
    sameSite: "Lax",
    /*     secure: "true", */
    maxAge: 24 * 60 * 60 * 1000,
  });
  return { refreshToken, accessToken };
};
export { signToken };
