import { Input } from "@/components/ui/input";

const LoginForm = ({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  error,
  isLoading,
  handleSubmit,
}: {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  error: string;
  isLoading: boolean;
  handleSubmit: (e: React.FormEvent) => void;
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-[352px] mx-auto">
      <div className="space-y-2 w-full">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>

      <div className="space-y-2 w-full">
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pr-10"
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <Button type="submit" className="w-full" loading={isLoading}>
        Iniciar sesión
      </Button>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-xs text-red-600">
          {error}
        </div>
      )}
    </form>
  );
};

export default LoginForm;
