import React from "react";
import { Spinner } from "@nextui-org/react";

interface Props {
  isLoading: boolean;
  children: React.ReactNode;
}

const Loading: React.FC<Props> = ({ isLoading, children }) => {
  return isLoading ? (
    <div className="flex flex-1 items-center justify-center">
      <Spinner color="primary" size="lg" />
    </div>
  ) : (
    <>{children}</>
  );
};

export default Loading;
