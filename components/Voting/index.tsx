import { VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI } from "#/utils/contract";
import { useWeb3Modal } from "@web3modal/react";
import { useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { verifyMessage } from "ethers/lib/utils.js";
import { readContract, writeContract, disconnect } from "@wagmi/core";
import { BigNumber } from "ethers";
import { Button, Flex, Heading, Text } from "@chakra-ui/react";
import Issue from "../Issue";
import Loader from "../Loader";
import Option from "../Option";
import Alert from "../Alert";

interface Issue {
  id: number;
  description: string;
  optionsCount: number;
}

interface Option {
  id: number;
  description: string;
  voteCount: number;
}

export default function Voting() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<
    (Issue & { options: Option[] }) | null
  >(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [activeIssue, setActiveIssue] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const [response, setResponse] = useState<any>(null);

  const { open } = useWeb3Modal();

  const account = useAccount({
    onConnect({ address }) {
      login({
        message: `I am signing this message to prove ownership of my address: ${address}`,
      });
    },
    onDisconnect() {
      setUserAddress(null);
    },
  });

  const { signMessage: login } = useSignMessage({
    onSuccess(data, variables) {
      const { message } = variables;
      const recoveredAddress = verifyMessage(message, data);
      setUserAddress(recoveredAddress);
    },
    onError(error) {
      console.log(error);
      disconnect();
    },
  });

  async function fetchIssues() {
    setLoading(true);
    const issuesCount: BigNumber = (await readContract({
      address: VOTING_CONTRACT_ADDRESS,
      abi: VOTING_CONTRACT_ABI,
      functionName: "issuesCount",
    })) as BigNumber;
    const issuesArray: Issue[] = [];
    const issuesCountInt = parseInt(issuesCount.toString());
    for (let i = 1; i <= issuesCountInt; i++) {
      const issue: any = await readContract({
        address: VOTING_CONTRACT_ADDRESS,
        abi: VOTING_CONTRACT_ABI,
        functionName: "issues",
        args: [i],
      });
      issuesArray.push(issue);
    }
    setIssues(issuesArray);
    setLoading(false);
  }

  async function fetchOptions(issueId: number) {
    setLoading(true);
    const issue: any = await readContract({
      address: VOTING_CONTRACT_ADDRESS,
      abi: VOTING_CONTRACT_ABI,
      functionName: "issues",
      args: [issueId],
    });
    const optionsCount = parseInt(issue.optionsCount.toString());
    const optionsArray: Option[] = [];
    for (let i = 1; i <= optionsCount; i++) {
      const option: any = await readContract({
        address: VOTING_CONTRACT_ADDRESS,
        abi: VOTING_CONTRACT_ABI,
        functionName: "getOption",
        args: [issueId, i],
      });
      optionsArray.push(option);
    }
    setSelectedIssue({ ...issue, options: optionsArray });
    setLoading(false);
  }

  async function vote(issueId: number, optionId: number) {
    try {
      setLoading(true);
      const { wait } = await writeContract({
        mode: "recklesslyUnprepared",
        address: VOTING_CONTRACT_ADDRESS,
        abi: VOTING_CONTRACT_ABI,
        functionName: "vote",
        args: [parseInt(issueId.toString()), optionId],
      });
      await wait();
      setResponse({
        status: "success",
        message: "Vote successful",
      });
      fetchOptions(parseInt(issueId.toString()));
      setLoading(false);
    } catch (error: Error | any) {
      if (error.toString().includes("already voted")) {
        setResponse({
          status: "error",
          message: "You have already voted on this issue",
        });
      } else {
        setResponse({
          status: "error",
          message: "Something went wrong",
        });
      }
      console.log(error);
      setLoading(false);
    }
  }

  useEffect(() => {
    if (userAddress) {
      fetchIssues();
    }
  }, [userAddress]);

  return (
    <>
      {loading && <Loader />}
      <Flex flexDir="column" align="center" w={1200}>
        <Heading mb={5}>Voting</Heading>
        <Alert data={response} />
        {!userAddress ? (
          <Flex>
            <Button onClick={() => open()}>Connect Wallet</Button>
          </Flex>
        ) : (
          <Flex flexDir="column" w="100%" gap={5}>
            <Text textAlign="center">
              Connected Address:{" "}
              <Text
                as="span"
                onClick={() => open()}
                cursor="pointer"
                color="blue.500"
                _hover={{ textDecoration: "underline" }}
              >
                {userAddress}
              </Text>
            </Text>
            <Heading fontSize="3xl">Current Issues:</Heading>
            <Flex flexWrap="wrap" gap={5}>
              {issues.map((issue, index) => (
                <Issue
                  key={index}
                  description={issue.description}
                  onClick={() => {
                    fetchOptions(parseInt(issue.id.toString()));
                    setActiveIssue(parseInt(issue.id.toString()));
                  }}
                  active={activeIssue === parseInt(issue.id.toString())}
                />
              ))}
            </Flex>
            {selectedIssue && (
              <Flex gap={5} flexWrap="wrap">
                {selectedIssue.options.map((option, index) => (
                  <Option
                    key={index}
                    description={option.description}
                    voteCount={parseInt(option.voteCount.toString())}
                    onClick={() =>
                      vote(selectedIssue.id, parseInt(option.id.toString()))
                    }
                  />
                ))}
              </Flex>
            )}
          </Flex>
        )}
      </Flex>
    </>
  );
}
