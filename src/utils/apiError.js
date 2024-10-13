class ApiError extends Error{
    constructor( 
         statusCode, 
         message = "Something went wrong", // a bried message when error occurs
         errors=[], // an array of errors (this is optional)
         stack = "" //
     ){
         super(message)
         this.statusCode= statusCode
         this.data = null
         this.message = message
         this.success = false; // this always occurs false indicating error
         this.errors = errors
 
         if(stack) {
             this.stack = stack 
         } else {
             Error.captureStackTrace(this, this.constructor)
         }
     }
}
 export { ApiError }