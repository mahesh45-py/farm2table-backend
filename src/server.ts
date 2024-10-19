import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { connectToDatabase } from "./database";

import * as jwt from "jsonwebtoken";
import { productRouter } from "./routes/product.routes";
import { productVariantRouter } from "./routes/productVariant.routes";
import { userRouter } from "./routes/user.routes";

dotenv.config();

const {ATLAS_URI, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET} = process.env


if(!ATLAS_URI){
    console.error("No ATLAS_URI variable has been found in config.env");
    process.exit();

}

connectToDatabase(ATLAS_URI).then(()=>{
    const app = express()
    app.use(express.json());
    app.use(cors())

    app.use("/products",productRouter);
    app.use("/productVariants",productVariantRouter);
    app.use("/user",userRouter);
    
    app.get("/", (req, res) => {
        res.send("Welcome to the Farm to Table API");
    });

    app.post("/login",(req,res) =>{
        console.log(req)
        console.log(req.body) // getting undefined
        const userName = req.body.username
        const user = {name: userName}

        const accessToken = jwt.sign(user,ACCESS_TOKEN_SECRET as jwt.Secret )
        res.json({accessToken: accessToken})
    })
    
    
    //start the Express Server
    app.listen(5200,()=>{
        console.log("Server started running on http://localhost:5200")
    })
}).catch((err)=>{
    console.error(err)
})