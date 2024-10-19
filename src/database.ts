import * as mongodb from "mongodb";
import { Product } from "./interfaces/product";
import { ProductVariant } from "./interfaces/productVariant";
import { User } from "./interfaces/user";

export const collections:{
    products?: mongodb.Collection<Product>;
    productVariants?: mongodb.Collection<ProductVariant>;
    users?: mongodb.Collection<User>;
}  = {};
export let client: mongodb.MongoClient;
export async function connectToDatabase(uri:string) {
    client = new mongodb.MongoClient(uri)
    await client.connect();

    const db = client.db("meanStackExample");
    await applySchemaValidation(db)

    collections.products = db.collection<Product>("products");
    collections.productVariants = db.collection<ProductVariant>("productVariants");
    collections.users = db.collection<User>("users");
}


async function applySchemaValidation(db:mongodb.Db){


    const productSchema = {
        $jsonSchema: {
            bsonType: "object",
            required: ["name", "description", "category", "image", "createdAt"],
            properties: {
                _id: {},
                name: {
                    bsonType: "string",
                    description: "'name' is a required field"
                },
                description: {
                    bsonType: "string",
                    description: "'description' is a required field"
                },
                category: {
                    bsonType: "string",
                    description: "'category' is a required field"
                },
                image: {
                    bsonType: "string",
                    description: "'image' is a required field"
                },
                createdAt: {
                    bsonType: "date",
                    description: "'createdAt' is a required field"
                },
                updatedAt: {
                    bsonType: "date"
                }
            }
        }
    };

    const productVariantSchema = {
        $jsonSchema: {
            bsonType: "object",
            required: ["productId", "variantName", "price", "stock", "createdAt"],
            properties: {
                _id: {},
                productId: {
                    bsonType: "objectId",
                    description: "'productId' is a required field"
                },
                variantName: {
                    bsonType: "string",
                    description: "'variantName' is a required field"
                },
                price: {
                    bsonType: "number",
                    description: "'price' is a required field"
                },
                stock: {
                    bsonType: "number",
                    description: "'stock' is a required field"
                },
                createdAt: {
                    bsonType: "date",
                    description: "'createdAt' is a required field"
                },
                updatedAt: {
                    bsonType: "date"
                }
            }
        }
    };

    const userSchema = {
        $jsonSchema: {
            bsonType: "object",
            required: ["name", "email", "phone", "password", "role", "area", "doorNo", "status", "createdAt"],
            properties: {
                _id: {},
                name: {
                    bsonType: "string",
                    description: "'name' is a required field"
                },
                email: {
                    bsonType: "string",
                    description: "'email' is a required field"
                },
                phone: {
                    bsonType: "string",
                    description: "'phone' is a required field"
                },
                password: {
                    bsonType: "string",
                    description: "'password' is a required field"
                },
                role: {
                    bsonType: "string",
                    enum: ["Admin", "Customer", "Vendor"],
                    description: "'role' is a required field"
                },
                area: {
                    bsonType: "string",
                    description: "'area' is a required field"
                },
                doorNo: {
                    bsonType: "string",
                    description: "'doorNo' is a required field"
                },
                status: {
                    bsonType: "string",
                    enum: ["AC", "NA", "BL"],
                    description: "'status' is a required field"
                },
                createdAt: {
                    bsonType: "date",
                    description: "'createdAt' is a required field"
                },
                updatedAt: {
                    bsonType: "date"
                }
            }
        }
    };

    // await db.command({
    //     collMod: "products",
    //     validator: productSchema
    // });

    // await db.command({
    //     collMod: "productVariants",
    //     validator: productVariantSchema
    // });

    // await db.command({
    //     collMod: "users",
    //     validator: userSchema
    // });
}