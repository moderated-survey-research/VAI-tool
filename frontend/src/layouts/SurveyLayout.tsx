interface Props {
  children: React.ReactNode;
}

const SurveyLayout: React.FC<Props> = ({ children }) => {
  return (
    <main className="min-h-screen text-foreground min-w-[320px]">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 h-full w-full bg-background [&>div]:absolute [&>div]:bottom-auto [&>div]:left-auto [&>div]:right-0 [&>div]:top-0 [&>div]:h-[500px] [&>div]:w-[500px] [&>div]:-translate-x-[30%] [&>div]:translate-y-[20%] [&>div]:rounded-full [&>div]:bg-[rgba(108,92,231,.3)] [&>div]:opacity-50 [&>div]:blur-[80px]">
          <div></div>
        </div>
      </div>
      <div className="flex flex-col min-h-screen z-0">{children}</div>
    </main>
  );
};

export default SurveyLayout;
