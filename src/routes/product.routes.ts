import * as express from "express";
import { ObjectId } from "mongodb";
import { collections,client } from "../database";


export const productRouter = express.Router();
productRouter.use(express.json());

productRouter.get("/", async (_req, res) => {
    try {
        const products = await collections?.products?.aggregate([
            {
                $lookup: {
                    from: "productVariants", // The collection to join with
                    localField: "_id", // The field from the Product collection
                    foreignField: "productId", // The field from the ProductVariant collection
                    as: "variants" // The output array field in the result documents
                }
            }
        ]).toArray();
        res.status(200).send(products);
    } catch (error) {
        res.status(500).send(error instanceof Error ? error.message : "Unknown error");
    }
});

productRouter.get("/:id", async (req, res) => {
    try {
        const id = req?.params?.id;
        const query = { _id: new ObjectId(id) };
        const product = await collections?.products?.findOne(query);
        if (product) {
            res.status(200).send(product);
        } else {
            res.status(404).send(`Failed to find Product ID:${id}`);
        }
    } catch (error) {
        res.status(500).send(error instanceof Error ? error.message : "Unknown error");
    }
});

productRouter.post("/", async (req, res) => {
    const session = client.startSession();

    try {
        const { variants, ...productData } = req.body;

        // Start a transaction
        session.startTransaction();
        productData.createdAt = new Date()
        // Insert the product first
        const productResult = await collections?.products?.insertOne(productData, { session });

        if (productResult?.acknowledged) {
            const productId = productResult.insertedId;

            // If variants are provided, insert them
            if (variants && Array.isArray(variants) && variants.length > 0) {
                const variantsWithProductId = variants.map((variant: any) => ({
                    ...variant,
                    productId: productId, // Set the productId for each variant
                    createdAt: new Date(),
                }));

                const variantsResult = await collections?.productVariants?.insertMany(variantsWithProductId, { session });

                if (!variantsResult?.acknowledged) {
                    throw new Error("Failed to create product variants");
                }
            }

            // Commit the transaction
            await session.commitTransaction();
            res.status(201).send(`Created a new Product with ID ${productId}`);
        } else {
            await session.abortTransaction();
            res.status(500).send("Failed to create a new Product");
        }
    } catch (error) {
        await session.abortTransaction();
        console.error(error);
        res.status(400).send(error instanceof Error ? error.message : "Unknown error");
    } finally {
        session.endSession();
    }
});

productRouter.put("/:id", async (req, res) => {
    const session = client.startSession();

    try {
        const id = req?.params?.id;
        const query = { _id: new ObjectId(id) };
        const { variants, ...productData } = req.body;

        // Start a transaction
        session.startTransaction();

        // Update the product
        const productResult = await collections?.products?.updateOne(query, { $set: productData }, { session });

        if (productResult && productResult.matchedCount) {
            // Handle variants if provided
            if (variants && Array.isArray(variants) && variants.length > 0) {
                // First, delete existing variants for the product
                await collections?.productVariants?.deleteMany({ productId: new ObjectId(id) }, { session });

                // Insert the new variants
                const variantsWithProductId = variants.map((variant: any) => ({
                    ...variant,
                    productId: new ObjectId(id),
                    createdAt: new Date(),
                }));

                const variantsResult = await collections?.productVariants?.insertMany(variantsWithProductId, { session });

                if (!variantsResult?.acknowledged) {
                    throw new Error("Failed to update product variants");
                }
            }

            // Commit the transaction
            await session.commitTransaction();
            res.status(200).send(`Updated a Product: ID ${id}`);
        } else if (!productResult?.matchedCount) {
            await session.abortTransaction();
            res.status(404).send(`Failed to find a Product: ID ${id}`);
        } else {
            await session.abortTransaction();
            res.status(304).send(`Failed to update a Product: ID ${id}`);
        }
    } catch (error) {
        await session.abortTransaction();
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(message);
        res.status(400).send(message);
    } finally {
        session.endSession();
    }
});


productRouter.delete("/:id", async (req, res) => {
    const session = client.startSession();

    try {
        const id = req?.params?.id;
        const query = { _id: new ObjectId(id) };

        // Start a transaction
        session.startTransaction();

        // Delete the product
        const productResult = await collections?.products?.deleteOne(query, { session });

        if (productResult && productResult.deletedCount) {
            // Delete the associated variants
            const variantsResult = await collections?.productVariants?.deleteMany({ productId: new ObjectId(id) }, { session });

            // Commit the transaction
            await session.commitTransaction();
            res.status(202).send(`Removed a Product and its variants: ID ${id}`);
        } else if (!productResult) {
            await session.abortTransaction();
            res.status(400).send(`Failed to delete a Product: ID ${id}`);
        } else {
            await session.abortTransaction();
            res.status(404).send(`Failed to find a Product: ID ${id}`);
        }
    } catch (error) {
        await session.abortTransaction();
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(message);
        res.status(400).send(message);
    } finally {
        session.endSession();
    }
});
