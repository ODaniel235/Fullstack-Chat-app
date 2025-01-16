import prisma from "../db/db.js";
export const createGroup = async (req, res) => {
  try {
    const { id, name, avatar } = req.body;
    if (!name || !userId) {
      return res.status(400).json({ error: "Name is a required field" });
    }
    const group = await prisma.
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
