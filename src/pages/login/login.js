import { Link } from "react-router-dom";
import "./login.css";

const Login = () => {
  return (
    <div className="form-container">
      <form className="login-form">
        <h1>Login to Account</h1>

        <div className="form-row">
          <label htmlFor="student-id">학번</label>
          <input type="text" id="student-id" name="student-id" />
        </div>

        <div className="form-row">
          <label htmlFor="password">비밀번호</label>
          <input type="password" id="password" name="password" />
        </div>

        <button type="submit" className="submit-btn">
          Sign In
        </button>

        <div className="signup-link">
          <span>계정이 없으신가요? </span>
          <Link to="/signup">회원가입하기</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
