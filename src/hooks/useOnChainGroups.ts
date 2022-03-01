import { useCallback, useState } from "react"
import { OAuthProvider } from "next-auth/providers"
import { Signer } from "ethers"
import { Provider } from "src/types/groups"

type ReturnParameters = {
    hasJoinedAGroup: (provider: OAuthProvider) => Promise<boolean | null>
    signMessage: (signer: Signer, message: string) => Promise<string | null>
    retrieveIdentityCommitment: (signer: Signer, provider: Provider) => Promise<string | null>
    hasIdentityCommitment: (
        identityCommitment: string,
        provider: Provider,
        groupName: string,
        join?: boolean
    ) => Promise<boolean | null>
    joinGroup: (identityCommitment: string, provider: Provider, groupName: string, body: any) => Promise<true | null>
    leaveGroup: (identityCommitment: string, provider: Provider, groupName: string, body: any) => Promise<true | null>
    _loading: boolean
}

export default function useOnChainGroups(): ReturnParameters {
    const [_loading, setLoading] = useState<boolean>(false)

    const retrieveIdentityCommitment = useCallback(() => {}, [])

    const signMessage = useCallback(() => {}, [])

    const joinGroup = useCallback(() => {}, [])

    const leaveGroup = useCallback(() => {}, [])

    return {
        retrieveIdentityCommitment,
        signMessage,
        joinGroup,
        leaveGroup,
        _loading
    }
}
