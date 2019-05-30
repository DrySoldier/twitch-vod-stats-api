const router = require("express").Router();
const vodRoutes = require("./vods");

router.use("/", vodRoutes);
router.use('/api', vodRoutes);

module.exports = router;