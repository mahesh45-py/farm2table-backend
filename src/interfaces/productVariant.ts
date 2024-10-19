import * as mongodb from "mongodb";

export interface ProductVariant {
    productId: mongodb.ObjectId; // Reference to the Product
    variantName: string;
    price: number;
    stock: number;
    createdAt: Date;
    updatedAt?: Date;
    _id?: mongodb.ObjectId;
}
