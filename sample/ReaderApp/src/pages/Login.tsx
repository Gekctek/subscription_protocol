import { Component } from "solid-js";
import LoginButton from "../components/LoginButton";

const Login: Component = () => {
    return (
        <div
            style={{
              display: 'flex',
              'justify-content': 'center',
              'align-items': 'center',
              height: '100%'
            }}>
            <LoginButton />
          </div>
    );
};

export default Login;