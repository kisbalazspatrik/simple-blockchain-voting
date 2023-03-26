import React, { FC } from "react";
import {
  AlertDescription,
  AlertIcon,
  Alert as ChakraAlert,
  Flex,
} from "@chakra-ui/react";

interface AlertProps {
  data: {
    status?: "info" | "warning" | "success" | "error" | "loading" | undefined;
    message?: string;
  };
}

const Alert: FC<AlertProps> = ({ data }) => {
  if (!data?.status && !data?.message) return null;

  return (
    <Flex justify={"center"} mb={5} px={6}>
      <ChakraAlert status={data.status} maxW={600} borderRadius={12}>
        <AlertIcon />
        <AlertDescription>{data.message}</AlertDescription>
      </ChakraAlert>
    </Flex>
  );
};

export default Alert;
