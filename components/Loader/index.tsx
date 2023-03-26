import { Flex, Spinner, Text } from "@chakra-ui/react";
import React, { FC } from "react";

interface LoaderProps {
  title?: string;
}

const Loader: FC<LoaderProps> = ({ title }) => {
  return (
    <Flex
      position="fixed"
      top="0"
      left="0"
      width="100%"
      height="100%"
      bg="rgba(0,0,0,0.75)"
      zIndex="999"
      justify="center"
      align="center"
      flexDir="column"
      gap={5}
    >
      <Spinner size="xl" color={"white"} />
      <Text color={"white"}>{title ? title : "Loading..."}</Text>
    </Flex>
  );
};

export default Loader;
