import * as express from "express";
import { ObjectId } from "mongodb";
import { collections } from "../database";

export const productVariantRouter = express.Router();
productVariantRouter.use(express.json());

productVariantRouter.get("/", async (_req, res) => {
    try {
        const productVariants = await collections?.productVariants?.find({}).toArray();
        res.status(200).send(productVariants);
    } catch (error) {
        res.status(500).send(error instanceof Error ? error.message : "Unknown error");
    }
});

productVariantRouter.get("/:id", async (req, res) => {
    try {
        const id = req?.params?.id;
        const query = { _id: new ObjectId(id) };
        const productVariant = await collections?.productVariants?.findOne(query);
        if (productVariant) {
            res.status(200).send(productVariant);
        } else {
            res.status(404).send(`Failed to find Product Variant ID:${id}`);
        }
    } catch (error) {
        res.status(500).send(error instanceof Error ? error.message : "Unknown error");
    }
});

productVariantRouter.post("/", async (req, res) => {
    try {
        const productVariant = req.body;
        const result = await collections?.productVariants?.insertOne(productVariant);

        if (result?.acknowledged) {
            res.status(201).send(`Created a new Product Variant: Id ${result.insertedId}`);
        } else {
            res.status(500).send("Failed to create a new Product Variant");
        }
    } catch (error) {
        console.error(error);
        res.status(400).send(error instanceof Error ? error.message : "Unknown error");
    }
});

productVariantRouter.put("/:id", async (req, res) => {
    try {
        const id = req?.params?.id;
        const query = { _id: new ObjectId(id) };
        const productVariant = req.body;

        const result = await collections?.productVariants?.updateOne(query, { $set: productVariant });

        if (result && result.matchedCount) {
            res.status(200).send(`Updated a Product Variant: ID ${id}`);
        } else if (!result?.matchedCount) {
            res.status(404).send(`Failed to find a Product Variant: ID ${id}`);
        } else {
            res.status(304).send(`Failed to update a Product Variant: ID ${id}`);
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(message);
        res.status(400).send(message);
    }
});

productVariantRouter.delete("/:id", async (req, res) => {
    try {
        const id = req?.params?.id;
        const query = { _id: new ObjectId(id) };
        const result = await collections?.productVariants?.deleteOne(query);

        if (result && result.deletedCount) {
            res.status(202).send(`Removed a Product Variant: ID ${id}`);
        } else if (!result) {
            res.status(400).send(`Failed to delete a Product Variant: ID ${id}`);
        } else {
            res.status(404).send(`Failed to find a Product Variant: ID ${id}`);
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(message);
        res.status(400).send(message);
    }
});
