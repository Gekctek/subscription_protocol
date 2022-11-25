import { Component } from 'solid-js';
import { login } from '../api/Identity';
import { Button } from '@suid/material';
import ICLogo from './ICLogo';

const LoginButton: Component = () => {

    return (
        <Button
            variant='outlined'
            size='large'
            onClick={() => login()}>
            Login with Internet Identity <ICLogo />
        </Button>
    );
};

export default LoginButton;


