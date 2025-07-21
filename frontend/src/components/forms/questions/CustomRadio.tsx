import React from "react";
import { RadioProps, VisuallyHidden, cn, useRadio } from "@nextui-org/react";

const CustomRadio: React.FC<RadioProps> = props => {
  const {
    Component,
    children,
    description,
    getBaseProps,
    getWrapperProps,
    getInputProps,
    getLabelProps,
    getLabelWrapperProps,
    getControlProps,
  } = useRadio(props);

  return (
    <Component
      {...getBaseProps()}
      className={cn(
        "group flex w-full max-w-full items-center hover:opacity-70 active:opacity-50 tap-highlight-transparent",
        "cursor-pointer rounded-lg gap-4 p-4 transition-all shadow-sm",
        "bg-content1 data-[disabled=false]:hover:shadow-md data-[disabled=false]:hover:bg-content2",
        "data-[selected=true]:border-primary data-[selected=true]:bg-primary/10",
        "data-[disabled=true]:opacity-50 data-[disabled=true]:cursor-default"
      )}
    >
      <VisuallyHidden>
        <input {...getInputProps()} />
      </VisuallyHidden>
      <span {...getWrapperProps()}>
        <span {...getControlProps()} />
      </span>
      <div {...getLabelWrapperProps()} className="flex flex-1 ml-0 mr-10 font-medium justify-center">
        {children && <span {...getLabelProps()}>{children}</span>}
        {description && <span className="text-small opacity-70">{description}</span>}
      </div>
    </Component>
  );
};

export default CustomRadio;
