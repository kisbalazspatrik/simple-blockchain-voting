import { ABI, Address } from "#/utils/contract";
import { useWeb3Modal } from "@web3modal/react";
import { useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { verifyMessage } from "ethers/lib/utils.js";
import { readContract, writeContract } from "@wagmi/core";
import { BigNumber } from "ethers";

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

  const { open } = useWeb3Modal();

  const account = useAccount({
    onConnect({ address }) {
      login({
        message: `I am signing this message to prove ownership of my address: ${address}`,
      });
    },
  });

  const { signMessage: login } = useSignMessage({
    onSuccess(data, variables) {
      const { message } = variables;
      const recoveredAddress = verifyMessage(message, data);
      setUserAddress(recoveredAddress);
    },
  });

  async function fetchIssues() {
    const issuesCount: BigNumber = (await readContract({
      address: Address,
      abi: ABI,
      functionName: "issuesCount",
    })) as BigNumber;
    const issuesArray: Issue[] = [];
    const issuesCountInt = parseInt(issuesCount.toString());
    for (let i = 1; i <= issuesCountInt; i++) {
      const issue: any = await readContract({
        address: Address,
        abi: ABI,
        functionName: "issues",
        args: [i],
      });
      issuesArray.push(issue);
    }
    setIssues(issuesArray);
  }

  async function fetchOptions(issueId: number) {
    const issue: any = await readContract({
      address: Address,
      abi: ABI,
      functionName: "issues",
      args: [issueId],
    });
    console.log(issue);

    const optionsCount = parseInt(issue.optionsCount.toString());
    const optionsArray: Option[] = [];
    for (let i = 1; i <= optionsCount; i++) {
      const option: any = await readContract({
        address: Address,
        abi: ABI,
        functionName: "getOption",
        args: [issueId, i],
      });
      optionsArray.push(option);
    }
    setSelectedIssue({ ...issue, options: optionsArray });
  }

  async function vote(issueId: number, optionId: number) {
    try {
      const { wait } = await writeContract({
        mode: "recklesslyUnprepared",
        address: Address,
        abi: ABI,
        functionName: "vote",
        args: [parseInt(issueId.toString()), optionId],
      });
      await wait();
      alert("Vote successful");
      fetchOptions(parseInt(issueId.toString()));
    } catch (error: Error | any) {
      if (error.toString().includes("already voted")) {
        alert("You have already voted");
      }
      console.log(error);
    }
  }

  useEffect(() => {
    if (userAddress) {
      fetchIssues();
    }
  }, [userAddress]);

  return (
    <div>
      <h2>Voting</h2>
      {!userAddress ? (
        <button onClick={() => open()}>Connect Wallet</button>
      ) : (
        <div>
          <h3>
            Connected Address:{" "}
            <span onClick={() => open()} style={{ cursor: "pointer" }}>
              {userAddress}
            </span>
          </h3>
          <h4>Issues:</h4>
          <ul>
            {issues.map((issue) => (
              <li key={issue.id} onClick={() => fetchOptions(issue.id)}>
                {issue.description}
              </li>
            ))}
          </ul>
          {selectedIssue && (
            <div>
              <h4>{selectedIssue.description}</h4>
              <ul>
                {selectedIssue.options.map((option, index) => (
                  <li key={index}>
                    {option.description} -{" "}
                    {parseInt(option.voteCount.toString())} votes
                    <button
                      onClick={() =>
                        vote(selectedIssue.id, parseInt(option.id.toString()))
                      }
                    >
                      Vote
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
