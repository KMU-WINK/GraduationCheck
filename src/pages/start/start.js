import { useNavigate } from "react-router-dom";
import logo from "../../images/image.png";
import "../start/start.css";

const Start = () => {
  const navigate = useNavigate();

  const goToLogin = () => {
    navigate("/login");
  };

  const goToSignup = () => {
    navigate("/signup");
  };

  return (
    <div className="div">
      <img className="img-logo" src={logo} alt="logo" />
      <button className="btn" onClick={goToLogin}>
        Login
      </button>
      <button className="btn" onClick={goToSignup}>
        Sign Up
      </button>
    </div>
  );
};

export default Start;
