

export const HeroTitle = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return (
    <h1 className={`inline-block text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent text-transparent bg-clip-text leading-tight ${className}`}>
      {children}
    </h1>
  );
};
