import { Button, Tooltip } from "@nextui-org/react";
import { Moon, SunDim } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import React from "react";

const ThemeSwitch: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Tooltip content={theme === "dark" ? "Light" : "Dark"} placement="bottom">
      <Button
        color="secondary"
        isIconOnly={true}
        onPress={() => setTheme(theme === "dark" ? "light" : "dark")}
        variant="light"
        startContent={theme === "dark" ? <SunDim size={24} /> : <Moon size={24} />}
        className="absolute top-4 right-4"
      ></Button>
    </Tooltip>
  );
};

export default ThemeSwitch;
