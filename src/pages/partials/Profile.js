import React, {useRef, useState, useCallback, useEffect} from 'react';
//import { useBlockstack } from 'react-blockstack';
import {fetchAccount, fetchHodlTokenBalance} from './StacksAccount';
import {Card, Button, Row, Col, Container, Image, ProgressBar, Form} from 'react-bootstrap';

//blockstack  connect
import {Person} from 'blockstack';

export default function Profile({stxAddresses, userData}) {

    const {profile, username} = userData;
    console.log("userData:", userData);
    console.log("usernameusernameusername:", username);
    const [status, setStatus] = useState('');

    const person = new Person(profile)
    console.log("person name:", person.name());
    console.log("person avatarUrl:", person.avatarUrl());

    // const { person, username } = useBlockstack();

    const updateStatus = status => {
        setStatus(status);
        setTimeout(() => {
            setStatus(undefined);
        }, 2000);
    };


    const proxyUrl = url => '/proxy/' + url.replace(/^https?:\/\//i, '');

    return (
        <React.Fragment>
            <Card body>
                <div className="Profile">

                    <div className="text-center mt-2">
                        Hello,{' '}
                        <span id="heading-name">{(person && person.name()) || username || 'User'}</span>!
                    </div>
                    {username && (
                        <>
                            Your Blockstack username is {username} <br/>
                        </>
                    )}
                    <b>
                        <a href="https://github.com/blockstack/ux/issue/570">
                            Betting and buying hodl tokens still fail due to github issue #570
                        </a>
                    </b>
                    <div className="pt-4">
                        Your Hodl amount for Speed Spend app:
                        <br/>
                        <StxProfile
                            stxAddress={stxAddresses.appStxAddress}
                            updateStatus={updateStatus}
                        ></StxProfile>
                    </div>
                    <div className="pt-4">
                        Your Hodl amount for Speed Spend Hodl tokens:
                        <br/>
                        <HodlTokenProfile
                            stxAddress={stxAddresses.ownerStxAddress}
                            updateStatus={updateStatus}
                        ></HodlTokenProfile>
                    </div>

                    <div className="pt-4">
                        Your own Stacks address:
                        <br/>
                        <StxProfile
                            stxAddress={stxAddresses.ownerStxAddress}
                            updateStatus={updateStatus}
                            showAddress
                        ></StxProfile>
                    </div>
                    {status && (
                        <>
                            <br/>
                            <div>{status}</div>
                        </>
                    )}
                </div>
            </Card>
        </React.Fragment>
    );
}

function HodlTokenProfile({stxAddress}) {
    const [balanceProfile, setBalanceProfile] = useState({
        balance: undefined,
    });

    useEffect(() => {
        /*fetchHodlTokenBalance(stxAddress).then(balance => {
          setBalanceProfile({ balance });
        });
        */
    }, [stxAddress]);

    return (
        <>
            {balanceProfile.balance && (
                <>
                    {balanceProfile.balance} <br/>
                </>
            )}
            {!balanceProfile.balance && (
                <>
                    0 <br/>
                </>
            )}
        </>
    );
}

function StxProfile({stxAddress, updateStatus, showAddress}) {
    const spinner = useRef();
    const faucetSpinner = useRef();

    const [profileState, setProfileState] = useState({
        account: undefined,
    });

    const onRefreshBalance = useCallback(
        async stxAddress => {
            updateStatus(undefined);
            spinner.current.classList.remove('d-none');

            fetchAccount(stxAddress)
                .then(acc => {
                    console.log(acc);
                    setProfileState({account: acc});
                    spinner.current.classList.add('d-none');
                })
                .catch(e => {
                    updateStatus('Refresh failed');
                    console.log(e);
                    spinner.current.classList.add('d-none');
                });
        },
        [updateStatus]
    );

    useEffect(() => {
        fetchAccount(stxAddress).then(acc => {
            setProfileState({account: acc});
        });
    }, [stxAddress]);

    const claimTestTokens = stxAddr => {
        updateStatus(undefined);
        faucetSpinner.current.classList.remove('d-none');

        fetch(`https://sidecar.staging.blockstack.xyz/sidecar/v1/faucets/stx?address=${stxAddr}`, {
            method: 'POST',
        })
            .then(r => {
                if (r.status === 200) {
                    updateStatus('Tokens will arrive soon.');
                } else {
                    updateStatus('Claiming tokens failed.');
                }
                console.log(r);
                faucetSpinner.current.classList.add('d-none');
            })
            .catch(e => {
                updateStatus('Claiming tokens failed.');
                console.log(e);
                faucetSpinner.current.classList.add('d-none');
            });
    };

    return (
        <>
            {stxAddress && showAddress && (
                <>
                    {stxAddress} <br/>
                </>
            )}
            {profileState.account && (
                <>
                    You balance: {parseInt(profileState.account.balance, 16).toString()}uSTX.
                    <br/>
                </>
            )}
            <button
                className="btn btn-outline-secondary mt-1"
                onClick={e => {
                    onRefreshBalance(stxAddress);
                }}
            >
                <div
                    ref={spinner}
                    role="status"
                    className="d-none spinner-border spinner-border-sm text-info align-text-top mr-2"
                />
                Refresh balance
            </button>
            {showAddress && (
                <button
                    className="btn btn-outline-secondary mt-1"
                    onClick={() => {
                        claimTestTokens(stxAddress);
                    }}
                >
                    <div
                        ref={faucetSpinner}
                        role="status"
                        className="d-none spinner-border spinner-border-sm text-info align-text-top mr-2"
                    />
                    Claim test tokens from faucet
                </button>
            )}
        </>
    );
}
