import Voting from "#/components/Voting";
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

      <main>
        <h1>Blockchain Voting App</h1>
        <Voting />
      </main>
    </div>
  );
}
