import * as express from "express";
import { ObjectId } from "mongodb";
import { collections } from "../database";

export const userRouter = express.Router();
userRouter.use(express.json());

userRouter.get("/", async (_req, res) => {
    try {
        const users = await collections?.users?.find({}).toArray();
        res.status(200).send(users);
    } catch (error) {
        res.status(500).send(error instanceof Error ? error.message : "Unknown error");
    }
});

userRouter.get("/:id", async (req, res) => {
    try {
        const id = req?.params?.id;
        const query = { _id: new ObjectId(id) };
        const user = await collections?.users?.findOne(query);
        if (user) {
            res.status(200).send(user);
        } else {
            res.status(404).send(`Failed to find User ID:${id}`);
        }
    } catch (error) {
        res.status(500).send(error instanceof Error ? error.message : "Unknown error");
    }
});

userRouter.post("/", async (req, res) => {
    try {
        const user = req.body;
        const result = await collections?.users?.insertOne(user);

        if (result?.acknowledged) {
            res.status(201).send(`Created a new User: Id ${result.insertedId}`);
        } else {
            res.status(500).send("Failed to create a new User");
        }
    } catch (error) {
        console.error(error);
        res.status(400).send(error instanceof Error ? error.message : "Unknown error");
    }
});

userRouter.put("/:id", async (req, res) => {
    try {
        const id = req?.params?.id;
        const query = { _id: new ObjectId(id) };
        const user = req.body;

        const result = await collections?.users?.updateOne(query, { $set: user });

        if (result && result.matchedCount) {
            res.status(200).send(`Updated a User: ID ${id}`);
        } else if (!result?.matchedCount) {
            res.status(404).send(`Failed to find a User: ID ${id}`);
        } else {
            res.status(304).send(`Failed to update a User: ID ${id}`);
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(message);
        res.status(400).send(message);
    }
});

userRouter.delete("/:id", async (req, res) => {
    try {
        const id = req?.params?.id;
        const query = { _id: new ObjectId(id) };
        const result = await collections?.users?.deleteOne(query);

        if (result && result.deletedCount) {
            res.status(202).send(`Removed a User: ID ${id}`);
        } else if (!result) {
            res.status(400).send(`Failed to delete a User: ID ${id}`);
        } else {
            res.status(404).send(`Failed to find a User: ID ${id}`);
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(message);
        res.status(400).send(message);
    }
});
