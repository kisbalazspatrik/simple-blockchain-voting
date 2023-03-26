import { Button, Flex, Text } from "@chakra-ui/react";
import React from "react";

interface IssueCardProps {
  description: string;
  onClick: () => void;
  active: boolean;
}

const Issue: React.FC<IssueCardProps> = ({
  description,
  onClick,
  active,
}) => {
  return (
    <Button
      flexDir="column"
      onClick={() => onClick()}
      cursor="pointer"
      px={5}
      py={3}
      borderRadius={12}
      isActive={active}
    >
      <Text>{description}</Text>
    </Button>
  );
};

export default Issue;
