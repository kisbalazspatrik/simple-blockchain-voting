import { NFT_CONTRACT_ABI, NFT_CONTRACT_ADDRESS } from "#/utils/contract";
import { useState } from "react";
import { writeContract } from "@wagmi/core";
import { useAccount } from "wagmi";
import { Button, Flex, Heading } from "@chakra-ui/react";
import Loader from "../Loader";
import Alert from "../Alert";

export default function Mint() {
  const [loading, setLoading] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);

  const [response, setResponse] = useState<any>(null);

  const account = useAccount({
    onConnect({ address }) {
      setUserAddress(address!);
    },
    onDisconnect() {
      setUserAddress(null);
    },
  });

  async function mint() {
    try {
      setLoading(true);
      const { wait } = await writeContract({
        mode: "recklesslyUnprepared",
        address: NFT_CONTRACT_ADDRESS,
        abi: NFT_CONTRACT_ABI,
        functionName: "mintNFT",
        args: [userAddress],
      });
      await wait();
      setResponse({
        status: "success",
        message: "NFT Minted Successfully",
      });
      setLoading(false);
    } catch (error: Error | any) {
      setResponse({
        status: "error",
        message: error.message,
      });
      console.log(error);
      setLoading(false);
    }
  }

  return (
    <>
      {loading && <Loader title="Minting..." />}
      {userAddress && (
        <Flex flexDir="column" align="center" mt={12}>
          <Alert data={response} />
          <Flex>
            <Button onClick={() => mint()}>Mint a new NFT to Vote</Button>
          </Flex>
        </Flex>
      )}
    </>
  );
}
