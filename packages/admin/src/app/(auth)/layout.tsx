const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-screen flex flex-col bg-[#FAFAFA] p-6 overflow-hidden">
      <div className="bg-[#FFFFFF] flex-1 flex items-center justify-center shadow-lg overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
