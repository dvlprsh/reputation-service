import { useCallback, useState } from "react"
import { Signer, utils, Contract, providers, Wallet } from "ethers"
import createIdentity from "@interep/identity"
import { useToast } from "@chakra-ui/react"
import Interep from "contract-artifacts/Interep.json"
import getNextConfig from "next/config"
// import { generateMerkleProof } from "@zk-kit/protocols"


const contract = new Contract("0xC36B2b846c53a351d2Eb5Ac77848A3dCc12ef22A", Interep.abi)
const provider = new providers.JsonRpcProvider("https://ropsten.infura.io/v3/4cdff1dcd508417a912e1713d3750f24")

// const ADMIN = getNextConfig().publicRuntimeConfig.adminMnemonic
// const adminWallet = Wallet.fromMnemonic(ADMIN).connect(provider)
// // Mnemonic

const ADMIN = getNextConfig().publicRuntimeConfig.adminprivatekey
const adminWallet = new Wallet(ADMIN, provider)
// Privatekey

// const adminAddress = adminWallet.getAddress()
const groupId = "2"// utils.formatBytes32String("brightid")

type ReturnParameters = {
    signMessage: (signer: Signer, message: string) => Promise<string | null>
    retrieveIdentityCommitment: (signer: Signer) => Promise<string | null>
    joinGroup: (identityCommitment: string) => Promise<true | null>
    leaveGroup: (identityCommitment: string, members: string[]) => Promise<true | null>
    _loading: boolean
}

export default function useOnChainGroups(): ReturnParameters {
    const [_loading, setLoading] = useState<boolean>(false)

    const toast = useToast()

    const signMessage = useCallback(
        async (signer: Signer, message: string): Promise<string | null> => {
            try {
                setLoading(true)

                const signedMessage = await signer.signMessage(message)

                setLoading(false)
                return signedMessage
            } catch (error) {
                console.error(error)

                toast({
                    description: "Your signature is needed to join/leave the group.",
                    variant: "subtle",
                    isClosable: true
                })

                setLoading(false)
                return null
            }
        },
        [toast]
    )

    const retrieveIdentityCommitment = useCallback(
        async (signer: Signer): Promise<string | null> => {
            try {
                setLoading(true)

                const identity = await createIdentity((message) => signer.signMessage(message), groupId)
                const identityCommitment = identity.genIdentityCommitment()

                setLoading(false)
                return identityCommitment.toString()
            } catch (error) {
                console.error(error)

                toast({
                    description: "Your signature is needed to create the identity commitment.",
                    variant: "subtle",
                    isClosable: true
                })

                setLoading(false)
                return null
            }
        },
        [toast]
    )


    const joinGroup = useCallback(
        async (identityCommitment: string): Promise<true | null> => {
            setLoading(true)

            await contract.connect(adminWallet).addMember(groupId, identityCommitment, {gasLimit: 3000000})
            
            
            setLoading(false)
            toast({
                description: `You joined the ${groupId} group correctly.`,
                variant: "subtle",
                isClosable: true
            })
            return true
        },
        [toast]
    )


    const leaveGroup = useCallback(
        async (IdentityCommitment: string, members:bigint[]): Promise<true | null> => {
            setLoading(true)
            const merkleproof = generateMerkleProof(20, BigInt(0), members, IdentityCommitment)

            console.log("\n---leaf----\n"+merkleproof.leaf+"\n----pathindices---\n"+merkleproof.pathIndices+"\n---root----\n"+merkleproof.root+"\n----siblings---\n"+merkleproof.siblings)
            await contract.connect(adminWallet).removeMember(groupId, IdentityCommitment, merkleproof.siblings ,merkleproof.pathIndices, {gasLimit: 3000000})

            setLoading(false)
            toast({
                description: `You out`,
                variant:"subtle",
                isClosable: true
            })
            return true
        },
        [toast]
    )

    return {
        retrieveIdentityCommitment,
        signMessage,
        joinGroup,
        leaveGroup,
        _loading
    }
}
