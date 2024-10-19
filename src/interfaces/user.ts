import * as mongodb from "mongodb";

export interface User {
    name: string;
    email: string;
    phone: string;
    password: string; // Consider hashing this before storing
    role: "Admin" | "Customer" | "Vendor";
    area:string;
    doorNo:string;
    status:"AC" | "NA" | "BL";
    createdAt: Date;
    updatedAt?: Date;
    _id?: mongodb.ObjectId;
}
