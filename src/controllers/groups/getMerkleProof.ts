import { MerkleTreeNode } from "@interep/db"
import { NextApiRequest, NextApiResponse } from "next"
import { checkGroup } from "src/core/groups"
import { createProof } from "src/core/groups/mts"
import { GroupName, Provider } from "src/types/groups"
import { logger } from "src/utils/backend"
import { connectDatabase } from "src/utils/backend/database"

export default async function getMerkleProofController(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        res.status(405).end()
        return
    }

    const provider = req.query?.provider as Provider
    const name = req.query?.name as GroupName
    const identityCommitment = req.query?.identityCommitment

    if (
        !provider ||
        typeof provider !== "string" ||
        !name ||
        typeof name !== "string" ||
        !identityCommitment ||
        typeof identityCommitment !== "string"
    ) {
        res.status(400).end()
        return
    }

    if (!checkGroup(provider, name)) {
        res.status(404).end("The group does not exist")
        return
    }

    try {
        await connectDatabase()

        if (!(await MerkleTreeNode.findByGroupAndHash({ name, provider }, identityCommitment))) {
            res.status(404).send("The identity commitment does not exist")
            return
        }

        const proof = await createProof(provider, name, identityCommitment)

        res.status(200).send({ data: proof })
    } catch (error) {
        res.status(500).end()

        logger.error(error)
    }
}
