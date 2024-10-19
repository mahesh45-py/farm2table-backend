import * as mongodb from "mongodb";

export interface Product {
    name: string;
    telugu_name:string;
    description: string;
    category: string;
    image: string;
    createdAt: Date;
    updatedAt?: Date;
    _id?: mongodb.ObjectId;
}
