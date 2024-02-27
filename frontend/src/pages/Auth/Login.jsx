import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../components/Loader";
import { useLoginMutation } from "../../redux/api/usersApiSlice";
import { setCredentials } from "../../redux/features/auth/authSlice";
import { toast } from "react-toastify";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remainingTime, setRemainingTime] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [login, { isLoading }] = useLoginMutation();

  const { userInfo } = useSelector((state) => state.auth);

  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get("redirect") || "/";

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      console.log(res);
      dispatch(setCredentials({ ...res }));
      navigate(redirect);
    } catch (err) {
      if (err?.data?.error === "Too many unsuccessful login attempts. Account locked for 3 minutes.") {
        const lockTime = 3 * 60;
        setRemainingTime(lockTime);
        setIsLocked(true);
        startTimer(lockTime);
      }
      toast.error(err?.data?.error || "An error occurred while processing your request.");
    }
  };

  const startTimer = (lockTime) => {
    const interval = setInterval(() => {
      setRemainingTime((prevTime) => prevTime - 1);
    }, 1000);

    setTimeout(() => {
      clearInterval(interval);
      setIsLocked(false);
    }, lockTime * 1000);
  };

  return (
    <div>
      <section className="pl-[10rem] flex flex-wrap">
        <div className="mr-[4rem] mt-[5rem]">
          <h1 className="text-2xl font-semibold mb-4">Sign In</h1>

          <form onSubmit={submitHandler} className="container w-[40rem]">
            <div className="my-[2rem]">
              <label htmlFor="email" className="block text-sm font-medium text-white">Email Address</label>
              <input type="email" id="email" className="mt-1 p-2 border rounded w-full" placeholder="Enter email"
                value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLocked} />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-white">Password</label>
              <input type="password" id="password" className="mt-1 p-2 border rounded w-full" placeholder="Enter password"
                value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLocked} />
            </div>

            <button disabled={isLoading || isLocked} type="submit"
              className="bg-pink-500 text-white px-4 py-2 rounded cursor-pointer my-[1rem]">
              {isLoading ? "Signing In..." : "Sign In"}
            </button>

            {isLoading && <Loader />}
            {isLocked && <p className="text-red-500">Please try again in {remainingTime} seconds.</p>}
          </form>

          <div className="mt-4">
            <p className="text-white">New Customer? <Link to={redirect ? `/register?redirect=${redirect}` : "/register"}
              className="text-pink-500 hover:underline">Register</Link></p>
          </div>
        </div>
        <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1964&q=80"
          alt="" className="h-[55rem] w-[45%] xl:block md:hidden sm:hidden rounded-lg" />
      </section>
    </div>
  );
};

export default Login;
