import userModel from '../models/userModel.js';

const getCurrent = async (req, res) => {
    try {
        const user = await userModel.findById(req.session.userId);
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export default {
    getCurrent,
};