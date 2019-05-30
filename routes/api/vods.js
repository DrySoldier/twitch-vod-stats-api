const router = require("express").Router();
const vodController = require("../../controllers/vodController");

router
  .route("/:id")
  .get(vodController.createStats)

router
  .route('/vods/:id')
  .get(vodController.getStats)

router
  .route('/statTest/:id')
  .get(vodController.areStatsCreated)

router
  .route('/recentStats/recentStats')
  .get(vodController.getRecentStats)

module.exports = router;