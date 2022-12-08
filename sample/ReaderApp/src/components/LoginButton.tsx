import { Component } from 'solid-js';
import { Button } from '@suid/material';
import ICLogo from './ICLogo';
import { useNavigate } from '@solidjs/router';
import { Page } from '../common/Page';
import { identity, login } from '../common/Identity';

const LoginButton: Component = () => {
    const navigate = useNavigate();
    return (
        <Button
            variant='outlined'
            size='large'
            onClick={() => login(navigate)}>
            Login with Internet Identity <ICLogo />
        </Button>
    );
};

export default LoginButton;


