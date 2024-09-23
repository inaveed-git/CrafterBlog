import Post from "../models/post.model.js"; // Adjust the import based on your project structure
// import errorHandler from "../utils/errorHandler.js"; // Adjust the import based on your project structure
import ErrorHandler from "../../api/utils/error.js";
export const create = async (req, res, next) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      //   return next(errorHandler(403, 'You are not allowed to create a post'));
      return next(
        new ErrorHandler("You are not allowed to create a post", 403)
      );
    }

    // Extract values from req.body
    const { title, content, image, category } = req.body;

    // Validate required fields
    if (!title || !content) {
      //   return next(errorHandler(400, 'Please provide all required fields'));
      return next(new ErrorHandler("Please provide all required fields", 400));
    }

    // Generate slug from title
    const slug = title
      .split(" ")
      .join("-")
      .toLowerCase()
      .replace(/[^a-zA-Z0-9-]/g, "");

    // Create a new post instance
    const newPost = new Post({
      title,
      content,
      image:
        image ||
        "https://www.hostinger.com/tutorials/wp-content/uploads/sites/2/2021/09/how-to-write-a-blog-post.png",
      category: category || "uncategorized",
      slug,
      userId: req.user.id,
    });

    // Save the post to the database
    const savedPost = await newPost.save();

    // Respond with the saved post
    res.status(201).json({
      success: true,
      savedPost,
    });
  } catch (error) {
    // Handle errors
    next(error);
  }
};

export const getposts = async (req, res, next) => {
  try {
    // 1. Start by getting query parameters (inputs) from the request (req)

    // Start showing posts from this index (used for pagination). Defaults to 0.
    const startIndex = parseInt(req.query.startIndex) || 0;

    // Number of posts to return. If not given, return 9 posts by default.
    const limit = parseInt(req.query.limit) || 9;

    // Decide whether to show posts from oldest to newest ('asc') or newest to oldest ('desc').
    const sortDirection = req.query.order === "asc" ? 1 : -1;

    // 2. Search for posts in the database using different filters based on query parameters

    // Here, we are looking for posts using filters like userId, category, etc.
    const posts = await Post.find({
      ...(req.query.userId && { userId: req.query.userId }), // Filter by userId, if given
      ...(req.query.category && { category: req.query.category }), // Filter by category, if given
      ...(req.query.slug && { slug: req.query.slug }), // Filter by slug, if given
      ...(req.query.postId && { _id: req.query.postId }), // Find specific post by ID, if given
      ...(req.query.searchTerm && {
        // Search posts based on a keyword (title or content)
        $or: [
          { title: { $regex: req.query.searchTerm, $options: "i" } }, // Match title with keyword
          { content: { $regex: req.query.searchTerm, $options: "i" } }, // Match content with keyword
        ],
      }),
    })
      .sort({ updatedAt: sortDirection }) // Sort the posts based on when they were last updated
      .skip(startIndex) // Skip a certain number of posts (for pagination)
      .limit(limit); // Limit the number of posts returned

    // 3. Get the total number of posts in the database (not just the filtered ones)
    const totalPosts = await Post.countDocuments();

    // 4. Calculate how many posts were created in the last month

    // Get the current date
    const now = new Date();

    // Calculate the date exactly one month ago
    const oneMonthAgo = new Date(
      now.getFullYear(), // Get the current year
      now.getMonth() - 1, // Subtract 1 from the current month
      now.getDate() // Keep the current day of the month
    );

    // Count how many posts were created in the last month (from oneMonthAgo until now)
    const lastMonthPosts = await Post.countDocuments({
      createdAt: { $gte: oneMonthAgo }, // Only count posts created after oneMonthAgo
    });

    // 5. Send the response back with the posts, total post count, and last month's post count
    res.status(200).json({
      posts, // The posts we found
      totalPosts, // Total number of posts in the database
      lastMonthPosts, // Number of posts created in the last month
    });
  } catch (error) {
    // If there's any error, pass it to the error handler
    next(error);
  }
};

export const deletepost = async (req, res, next) => {
  // router.delete('/deletepost/:postId/:userId', verifyToken, deletepost)

  if (!req.user.isAdmin || req.user.id !== req.params.userId) {
    return next(errorHandler(403, "You are not allowed to delete this post"));
  }

  try {
    await Post.findByIdAndDelete(req.params.postId);
    res.status(200).json("The post has been deleted");
  } catch (error) {
    next(error);
  }
};

export const updatepost = async (req, res, next) => {
  if (!req.user.isAdmin || req.user.id !== req.params.userId) {
    return next(errorHandler(403, "You are not allowed to update this post"));
  }
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $set: {
          title: req.body.title,
          content: req.body.content,
          category: req.body.category,
          image: req.body.image,
        },
      },
      { new: true }
    );
    res.status(200).json(updatedPost);
  } catch (error) {
    next(error);
  }
};
