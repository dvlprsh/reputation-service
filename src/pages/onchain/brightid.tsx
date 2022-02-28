import { Container, Box, Heading, Text } from "@chakra-ui/react"
import { useWeb3React } from "@web3-react/core"
import { providers } from "ethers"
import QRCode from "qrcode.react"
import React, { useEffect, useState } from "react"

const NODE_URL = "http:%2f%2fnode.brightid.org"
const CONTEXT = "interep"

export default function BrightIdPage(): JSX.Element {
    const { account } = useWeb3React<providers.Web3Provider>()
    const [url, setUrl] = useState<string>()

    useEffect(() => {
        ;(async () => {
            if (account) {
                const verificationLink = `brightid://link-verification/${NODE_URL}/${CONTEXT}/${account}`

                setUrl(verificationLink)
            }
        })()
    }, [account])
    return (
        <>
            <Container flex="1" mb="80px" mt="180px" px="80px" maxW="container.lg">
                <Box bg="white" w="100%" p={4} color="black" alignItems="center" display="flex" flexDirection="column">
                    <Heading as="h3" size="lg">
                        Connect with BrightId
                    </Heading>
                    <Box mt="50px" mb="50px">
                        {url ? <QRCode value={url} /> : <Text fontWeight="semibold">Please connect your wallet</Text>}
                    </Box>
                </Box>
            </Container>
        </>
    )
}
