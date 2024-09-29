const express = require('express');
const router = express.Router();


// Import Controller 
const {createComment} = require("../controllers/commentController");
const {likePost, unlikePost, dummyLink} = require("../controllers/likeController");
const {createPost, getAllPosts} = require("../controllers/postController");




// Mapping Create
router.get("/dummyLink", dummyLink);
router.post("/comments/create", createComment);
router.post("/posts/create", createPost);
router.get("/posts", getAllPosts);
router.post("/likes/like", likePost);
router.post("/likes/unlike", unlikePost);

// Export Controller
module.exports = router;