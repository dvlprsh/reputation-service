import { useCallback, useState } from "react"
import { Signer, utils, Contract, providers, Wallet } from "ethers"
import createIdentity from "@interep/identity"
import { useToast } from "@chakra-ui/react"
import Interep from "contract-artifacts/Interep.json"

const ADMIN = process.env.BRIGHTID_GROUP_ADMIN_MNEMONIC!

const contract = new Contract("0xC36B2b846c53a351d2Eb5Ac77848A3dCc12ef22A", Interep.abi)
const provider = new providers.JsonRpcProvider("https://ropsten.infura.io/v3/4cdff1dcd508417a912e1713d3750f24")
const adminWallet = Wallet.fromMnemonic(ADMIN).connect(provider)

const groupId = utils.formatBytes32String("brightid")

type ReturnParameters = {
    signMessage: (signer: Signer, message: string) => Promise<string | null>
    retrieveIdentityCommitment: (signer: Signer) => Promise<string | null>
    joinGroup: (identityCommitment: string) => Promise<true | null>
    // leaveGroup: (identityCommitment: string, groupName: string, body: any) => Promise<true | null>
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
                    description: "Signature required for identity commitment.",
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

            await contract.connect(adminWallet).addMember(groupId, identityCommitment)
            
            
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


    // const leaveGroup = useCallback(() => {}, [])

    return {
        retrieveIdentityCommitment,
        signMessage,
        joinGroup,
        // leaveGroup,
        _loading
    }
}
