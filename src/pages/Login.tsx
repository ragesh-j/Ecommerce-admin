import { useActionState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../app/hooks";
import { setCredentials } from "../features/auth/authSlice";
import api from "../services/axios";

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [error, submitAction, isPending] = useActionState(
    async (_prev: string | null, formData: FormData) => {
      try {
        const res = await api.post("/auth/login", {
          email: formData.get("email"),
          password: formData.get("password"),
        });
        dispatch(setCredentials({
          token: res.data.data.accessToken,
          user: res.data.data.user,
        }));
        navigate("/");
        return null;
      } catch (err: any) {
        return err.response?.data?.message || "Invalid email or password";
      }
    },
    null
  );

  return (
    <div className="h-screen bg-gray-50 flex items-center justify-center p-8">
  <div className="w-full max-w-md">

    {/* logo + heading */}
    <div className="text-center mb-6">
      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M12 12l9-5M12 12v10M12 12L3 7" stroke="white" strokeWidth="1.5"/>
        </svg>
      </div>
      <h1 className="text-xl font-medium text-gray-900">Admin panel</h1>
      <p className="text-sm text-gray-500 mt-1">Sign in to manage your store</p>
    </div>

    {/* card */}
    <div className="bg-white border border-gray-200 rounded-2xl p-6">

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
            <circle cx="8" cy="8" r="7" stroke="#A32D2D" strokeWidth="1.2"/>
            <path d="M8 5v4M8 11v.5" stroke="#A32D2D" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      <form action={submitAction} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5 text-left">
            Email address
          </label>
          <input
            type="email"
            name="email"
            placeholder="admin@example.com"
            required
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5 text-left">
            Password
          </label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            required
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {isPending ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  </div>
</div>
  );
};

export default Login;