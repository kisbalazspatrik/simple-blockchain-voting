import { Button, Flex, Text } from "@chakra-ui/react";
import React from "react";

interface OptionProps {
  description: string;
  voteCount: number;
  onClick: () => void;
}

const Option: React.FC<OptionProps> = ({ description, voteCount, onClick }) => {
  return (
    <Flex
      flexDir="column"
      border={"1px solid rgba(255, 255, 255, 0.1)"}
      borderRadius={12}
      align="center"
      p={5}
      flex="1"
    >
      <Text>{description}</Text>
      <Text>
        Number of Votes:{" "}
        <Text as="span" fontWeight={700}>
          {voteCount}
        </Text>
      </Text>
      <Button onClick={() => onClick()} mt={5} w="100%">
        Vote
      </Button>
    </Flex>
  );
};

export default Option;
