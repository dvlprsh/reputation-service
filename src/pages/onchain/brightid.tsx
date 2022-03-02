import { Box, Heading, Text, Spinner, VStack, Container } from "@chakra-ui/react"
import { useWeb3React } from "@web3-react/core"
import { providers, Signer } from "ethers"
import QRCode from "qrcode.react"
import React, { useCallback, useEffect, useState } from "react"
import Step from "src/components/Step"
import { Group } from "src/types/groups"
import useOnChainGroups from "src/hooks/useOnChainGroups"
import { OnchainGroups } from "src/core/onchain"

const NODE_URL = "http:%2f%2fnode.brightid.org"
const CONTEXT = "interep"

export default function BrightIdPage(): JSX.Element {
    const { account, library } = useWeb3React<providers.Web3Provider>()
    const [_identityCommitment, setIdentityCommitment] = useState<string>()
    const [_group, setGroup] = useState<Group>()
    const [_currentStep, setCurrentStep] = useState<number>(0)
    const [_hasJoined, setHasJoined] = useState<boolean>()
    const [url, setUrl] = useState<string>()
    const [_verified, setVerified] = useState<boolean>()
    const [_signer, setSigner] = useState<Signer>()
    const {
        signMessage,
        retrieveIdentityCommitment,
        joinGroup,
        //leaveGroup,
        _loading
    } = useOnChainGroups()

    const getQRcodeLink = async (ethereumAddress: string) => {
        const verificationLink = `brightid://link-verification/${NODE_URL}/${CONTEXT}/${ethereumAddress}`
        setUrl(verificationLink)
    }
    const getBrightIdByAddress = async (ethereumAddress: string) => {
        const response = await fetch(`https://app.brightid.org/node/v5/verifications/${CONTEXT}/${ethereumAddress}`)
        return response.json()
    }
    const isUserVerified = useCallback(async (address: string) => {
        const brightIdUser = await getBrightIdByAddress(address)
        return brightIdUser.data.unique
    }, [])

    useEffect(() => {
        ;(async () => {
            if (account && library) {
                setSigner(library.getSigner(account))
                getQRcodeLink(account)
                const userVerified = await isUserVerified(account)
                if (userVerified && _currentStep === 0) {
                    setVerified(userVerified)
                    setCurrentStep(1)
                }
            }
        })()
    }, [account, library, _currentStep, isUserVerified])

    const step1 = useCallback(
        async (signer: Signer, group: Group, groupName: OnchainGroups) => {
            const identityComitment = await retrieveIdentityCommitment(signer, "onchain")
            // const onchainGroup = await getGroup("onchain", groupName)

            if (identityComitment) {
                // setGroup(onchainGroup)

                setIdentityCommitment(identityComitment)
                setCurrentStep(2)
            }
        },
        [retrieveIdentityCommitment]
    )

    const step2 = useCallback(
        async (signer: Signer, userAddress: string, group: Group, identityComitment: string, hasJoined: boolean) => {
            const userSignature = await signMessage(signer, identityComitment)

            if (userSignature) {
                if (!hasJoined) {
                    if (
                        await joinGroup(identityComitment, "onchain", group.name, {
                            userAddress,
                            userSignature
                        })
                    ) {
                        setCurrentStep(1)
                        setHasJoined(undefined)
                        setGroup(undefined)
                    }
                } else if (await leaveGroup(identityComitment, "onchain", group.name, { userAddress, userSignature })) {
                    setCurrentStep(1)
                    setHasJoined(undefined)
                    setGroup(undefined)
                }
            }
        },
        [joinGroup, /*leaveGroup,*/ signMessage]
    )

    return (
        <Container flex="1" mb="80px" mt="180px" px="80px" maxW="container.md">
            {_currentStep === 0 ? (
                <VStack h="300px" align="center" justify="center">
                    <Spinner thickness="4px" speed="0.65s" size="xl" />
                </VStack>
            ) : !_verified ? (
                <VStack h="250px" align="center" justify="center">
                    <Box
                        bg="white"
                        w="100%"
                        p={4}
                        color="black"
                        alignItems="center"
                        display="flex"
                        flexDirection="column"
                    >
                        <Heading as="h3" size="lg">
                            Connect with BrightId
                        </Heading>
                        <Box mt="50px" mb="50px">
                            {url ? (
                                <QRCode value={url} />
                            ) : (
                                <Text fontWeight="semibold">Please connect your wallet</Text>
                            )}
                        </Box>
                    </Box>
                </VStack>
            ) : (
                <>
                    {_group && (
                        <Text fontWeight="semibold">
                            The {_group.name} group has {_group.size} members. Follow the steps below to join/leave it.
                        </Text>
                    )}

                    <VStack mt="20px" spacing={4} align="left">
                        <Step
                            title="Step 1"
                            message="Generate your Semaphore identity."
                            actionText="Generate Identity"
                            actionFunction={(groupName) => step1(_signer as Signer, _group as Group, groupName)}
                            loading={_currentStep === 1 && _loading}
                            disabled={_currentStep !== 1}
                        />
                        {_hasJoined !== undefined && (
                            <Step
                                title="Step 2"
                                message={`${!_hasJoined ? "Join" : "Leave"} our BrightID Semaphore group.`}
                                actionText={`${!_hasJoined ? "Join" : "Leave"} Group`}
                                actionFunction={() =>
                                    step2(
                                        _signer as Signer,
                                        account as string,
                                        _group as Group,
                                        _identityCommitment as string,
                                        _hasJoined
                                    )
                                }
                                loading={_currentStep === 2 && _loading}
                                disabled={_currentStep !== 2}
                            />
                        )}
                    </VStack>
                </>
            )}
        </Container>
    )
}
