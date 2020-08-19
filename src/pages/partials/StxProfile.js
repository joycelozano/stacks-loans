import React, {useCallback, useEffect, useRef, useState} from "react";
import {fetchAccount} from "@pages/partials/StacksAccount";
import {Badge, Button, Col, Row, Card, Image} from 'react-bootstrap';
import BlockStackIcon  from "@assets/imgs/blockstack-icon.png";
import Loader from "@components/ui/Loader";

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
                faucetSpinner.current.classList.add('d-none');
            })
            .catch(e => {
                updateStatus('Claiming tokens failed.');
                console.log(e);
                faucetSpinner.current.classList.add('d-none');
            });
    };

    return (
        <React.Fragment>
            {stxAddress && showAddress && (<React.Fragment>
                    <Badge variant="light" pill> {stxAddress}</Badge>
                    <br/>
                </React.Fragment>
            )}

            {profileState.account && (
                <React.Fragment>
                        <Row  noGutters={false}>
                            <Col lg={showAddress ? 3 : 6}>
                                <Card
                                    text="light"
                                    className="sampleBox sampleBox-one">
                                    <Card.Body>
                                        <Image src={BlockStackIcon}
                                               style={{width: '50px'}}
                                        />
                                        <Card.Title>
                                            You balance: {parseInt(profileState.account.balance, 16).toString()} STX
                                        </Card.Title>
                                        <Card.Text className="sampleBox-footer">
                                            <span className="title"> {parseInt(profileState.account.balance, 16).toString()} STX</span>
                                        </Card.Text>
                                    </Card.Body>


                                </Card>
                            </Col>
                        </Row>

                    <br/>
                </React.Fragment>
            )}

            {!profileState.account && (
                <React.Fragment>
                    <Loader/>
                    <br/>
                    <br/>
                </React.Fragment>
                )
            }
            <Row  xs={2} md={2} lg={3}>
                <Col>

                    <Button
                        variant="dark"
                        size="sm" block
                        onClick={e => {
                            onRefreshBalance(stxAddress);
                        }}
                    >
                        <div
                            ref={spinner}
                            role="status"
                            className="d-none spinner-border spinner-border-sm text-white align-text-top mr-2"
                        />
                        Refresh balance
                    </Button>

                </Col>
                <Col>

                    {showAddress && (
                        <Button
                            variant="primary"
                            size="sm"
                            block
                            onClick={() => {
                                claimTestTokens(stxAddress);
                            }}
                        >
                            <div
                                ref={faucetSpinner}
                                role="status"
                                className="d-none spinner-border spinner-border-sm text-white align-text-top mr-2"
                            />
                            Test tokens from STX faucet
                        </Button>
                    )}

                </Col>
            </Row>

        </React.Fragment>
    );
};
export default StxProfile;