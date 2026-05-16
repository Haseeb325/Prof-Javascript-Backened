//first

//   yay promise wala code hai
const asyncHandler =(requestHandler)=>{
    // return ye return krta ha  return lazmi aye ga ku ki rewuesthandler ham ne 1 method sccept to use return b krna zrori ha
  return  (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).
        catch((err)=>(next(err)))
    }
}


export  {asyncHandler}


//2nd

//steps to handle asyncHandler
// const asyncHandler =()=>{}
// const asyncHandler =(func)=>()=>{}
// const asyncHandler =(func)=> async()=>{} // making it async

//   yay try catch wala ha

// const asyncHandler = (fn) => async (req,res, next) => {
//     try {
//         await fn(req,res, next)           // this is wrapper function
        
//     } catch (error) {
//         res.status(error.code || 5000).json({
//             success: false,                          //making easy for frontened
//             message:error.message             
//         })
//     }
//  }