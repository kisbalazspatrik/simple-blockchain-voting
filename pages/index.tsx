import Mint from "#/components/Mint";
import Voting from "#/components/Voting";
import { Flex, Heading } from "@chakra-ui/react";
import Head from "next/head";

export default function Home() {
  return (
    <div>
      <Head>
        <title>Blockchain Voting App</title>
        <meta
          name="description"
          content="A voting application using blockchain technology"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Flex flexDir="column" align="center">
        <Heading my={5}>Blockchain Voting App</Heading>
        <Voting />
        <Mint />
      </Flex>
    </div>
  );
}
