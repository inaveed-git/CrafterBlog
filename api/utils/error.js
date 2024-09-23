// class ErrorHandler extends Error {
//   constructor(message, status) {
//     super(message); // Correct way to pass the message to the Error constructor
//     this.status = status;
//   }
// }

class ErrorHandler extends Error {
  constructor(message, status) {
    super(message); // Pass the message to the Error constructor
    this.status = status; // Set the HTTP status code
  }
}

// // Error-handling middleware
// export const errorMidleWare = (err, req, res, next) => {
//   res.status(err.status || 500).json({
//     success: false,
//     message: err.message || "An unexpected error occurred",
//   });
// };

export const errorMidleWare = (err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "An unexpected error occurred",
  });
};

export default ErrorHandler;
